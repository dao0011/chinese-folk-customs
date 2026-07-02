// Cloudflare Function: 验证 PayPal 付款 + 发送付费 PDF
// POST /capture-order
// Body: { orderID: string, email: string }

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
    const captureRes = await fetch(
      `${paypalBase}/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: '{}'
      }
    );

    const captureData = await captureRes.json();

    // 步骤 3：验证付款结果
    const isCompleted = captureData.status === 'COMPLETED';
    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const captureOk = capture?.status === 'COMPLETED';
    const amountOk = capture?.amount?.value === '7.99';

    if (!isCompleted || !captureOk || !amountOk) {
      console.error('Verification failed:', {
        orderCompleted: isCompleted,
        captureOk,
        amountOk,
        amount: capture?.amount?.value
      });
      return new Response(JSON.stringify({ ok: false, error: 'Payment verification failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const transactionId = capture.id;

    // 步骤 4：发邮件
    const resendKey = env.RESEND_API_KEY;
    if (resendKey) {
      const pdfUrl = 'https://www.folkcalm.com/pdfs/25-Chinese-Household-Remedies-Guide.pdf';
      const html = `<div style="font-family: Georgia, serif; max-width: 600px; padding: 20px; background: #FDF8F0;">
<h2 style="color: #5C3317;">Thank You for Your Purchase</h2>
<p style="color: #A0522D; font-style: italic;">The Folk Calm Kitchen — 25 Chinese Household Remedies</p>
<p>Here is your guide. 28 pages of simmered preparations and folk practices, passed down through generations.</p>
<div style="text-align: center; margin: 24px 0;">
<a href="${pdfUrl}" style="background: #A0522D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 15px;">Download Your PDF</a>
</div>
<p style="color: #888; font-size: 12px; margin-top: 20px;">Transaction: ${transactionId}</p>
<p style="color: #888; font-size: 12px;">This is a cultural documentation, not medical advice.</p>
<p style="margin-top: 16px;">— Folk Calm</p>
</div>`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Folk Calm <guide@folkcalm.com>',
          to: [email],
          subject: 'Your Guide: 25 Chinese Household Remedies',
          html: html
        })
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      downloadUrl: 'pdfs/25-Chinese-Household-Remedies-Guide.pdf',
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
