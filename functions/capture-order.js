// Cloudflare Function: 验证 PayPal 付款 + 发送付费 PDF
// POST /capture-order
// Body: { orderID: string, email: string }

import { callResend } from './_lib/resend.js';

const PAID_GUIDE_FILE = 'The-Folk-Calm-Kitchen-Guide.pdf';
const PAID_GUIDE_PRICE = '7.99';
const PAID_GUIDE_CURRENCY = 'USD';
const DOWNLOAD_TOKEN_SECONDS = 7 * 24 * 60 * 60;

function getTokenSecret(env) {
  return env.PDF_TOKEN_SECRET || env.PAYPAL_CLIENT_SECRET || '';
}

function base64Url(bytes) {
  var binary = '';
  for (var i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signDownloadToken(env, file, orderID, expires) {
  var secret = getTokenSecret(env);
  if (!secret) throw new Error('PDF token secret is not configured');

  var encoder = new TextEncoder();
  var key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  var data = [file, orderID, expires].join('|');
  var signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64Url(new Uint8Array(signature));
}

async function createDownloadUrl(request, env, orderID) {
  var expires = Math.floor(Date.now() / 1000) + DOWNLOAD_TOKEN_SECONDS;
  var token = await signDownloadToken(env, PAID_GUIDE_FILE, orderID, String(expires));
  var baseUrl = env.PUBLIC_SITE_URL || new URL(request.url).origin;
  var url = new URL('/pdfs/' + PAID_GUIDE_FILE, baseUrl);
  url.searchParams.set('order', orderID);
  url.searchParams.set('expires', String(expires));
  url.searchParams.set('token', token);
  return url.toString();
}

function expectedPayeeMatches(env, payee) {
  var expectedMerchantId = env.PAYPAL_MERCHANT_ID || env.PAYPAL_PAYEE_MERCHANT_ID || '';
  var expectedEmail = env.PAYPAL_PAYEE_EMAIL || '';

  if (!expectedMerchantId && !expectedEmail) {
    console.error('PayPal payee validation requires PAYPAL_MERCHANT_ID or PAYPAL_PAYEE_EMAIL.');
    return false;
  }

  if (expectedMerchantId && payee?.merchant_id !== expectedMerchantId) return false;
  if (expectedEmail && (payee?.email_address || '').toLowerCase() !== expectedEmail.toLowerCase()) return false;
  return true;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { orderID, email } = body;
  if (!orderID) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing orderID' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid email' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const clientId = env.PAYPAL_CLIENT_ID;
  const clientSecret = env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response(JSON.stringify({ ok: false, error: 'Payment service unavailable' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const paypalBase = 'https://api-m.paypal.com';

  try {
    // 步骤 1：获取 PayPal OAuth2 token
    const auth = btoa(`${clientId}:${clientSecret}`);
    const tokenRes = await fetch(`${paypalBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenRes.ok) {
      console.error('PayPal token error:', await tokenRes.text());
      return new Response(JSON.stringify({ ok: false, error: 'Payment service error, please retry' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { access_token } = await tokenRes.json();

    // 步骤 2：Capture 订单（真正扣款）
    const paypalRequestId = `capture-${orderID}`;
    const captureRes = await fetch(
      `${paypalBase}/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': paypalRequestId
        },
        body: '{}'
      }
    );

    const captureData = await captureRes.json();

    // 步骤 3：验证付款结果
    const isCompleted = captureData.status === 'COMPLETED';
    const purchaseUnit = captureData.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const payee = purchaseUnit?.payee || capture?.payee;
    const captureOk = capture?.status === 'COMPLETED';
    const amountOk = capture?.amount?.value === PAID_GUIDE_PRICE;
    const currencyOk = capture?.amount?.currency_code === PAID_GUIDE_CURRENCY;
    const payeeOk = expectedPayeeMatches(env, payee);

    if (!isCompleted || !captureOk || !amountOk || !currencyOk || !payeeOk) {
      console.error('Verification failed:', {
        orderCompleted: isCompleted,
        captureOk,
        amountOk,
        currencyOk,
        payeeOk,
        amount: capture?.amount?.value,
        currency: capture?.amount?.currency_code,
        payeeMerchantId: payee?.merchant_id
      });
      return new Response(JSON.stringify({ ok: false, error: 'Payment verification failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const transactionId = capture.id;
    const pdfUrl = await createDownloadUrl(request, env, orderID);

    // 步骤 4：发邮件
    const resendKey = env.RESEND_API_KEY;
    if (resendKey) {
      const html = `<div style="font-family: Georgia, serif; max-width: 600px; padding: 20px; background: #FDF8F0;">
<h2 style="color: #5C3317;">Thank You for Your Purchase</h2>
<p style="color: #A0522D; font-style: italic;">The Folk Calm Kitchen — 25 Chinese Household Remedies</p>
<p>Here is your guide. 28 pages of simmered preparations and folk practices, passed down through generations.</p>
<div style="text-align: center; margin: 24px 0;">
<a href="${pdfUrl}" style="background: #A0522D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 15px;">Download Your PDF</a>
</div>
<p style="color: #888; font-size: 12px; margin-top: 20px;">Transaction: ${transactionId}</p>
<p style="color: #888; font-size: 12px;">This is cultural documentation, not professional guidance.</p>
<p style="margin-top: 16px;">— Folk Calm</p>
</div>`;

      await callResend(resendKey, '/emails', 'POST', {
        from: 'Folk Calm <guide@folkcalm.com>',
        to: [email],
        subject: 'Your Guide: 25 Chinese Household Remedies',
        html: html
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      downloadUrl: pdfUrl,
      transactionId: transactionId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    console.error('Capture error:', e);
    return new Response(JSON.stringify({ ok: false, error: 'Network error, please retry' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
