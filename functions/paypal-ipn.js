// Cloudflare Function: PayPal IPN -> Resend PDF delivery
// Deployed at: https://www.folkcalm.com/api/paypal-ipn

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Parse PayPal IPN body
  const body = await request.text();
  
  // Step 1: Validate with PayPal
  const verifyBody = 'cmd=_notify-validate&' + body;
  const verifyRes = await fetch('https://ipnpb.paypal.com/cgi-bin/webscr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: verifyBody
  });
  const verifyText = await verifyRes.text();
  
  if (verifyText.trim() !== 'VERIFIED') {
    return new Response('Invalid', { status: 400 });
  }

  // Step 2: Parse the verified IPN
  const params = new URLSearchParams(body);
  const paymentStatus = params.get('payment_status');
  const payerEmail = params.get('payer_email');
  const itemName = params.get('item_name');
  const txnId = params.get('txn_id');

  // Only send on completed payment
  if (paymentStatus !== 'Completed') {
    return new Response('OK', { status: 200 });
  }

  if (!payerEmail) {
    return new Response('No email', { status: 200 });
  }

  // Step 3: Send PDF via Resend
  const resendKey = env.RESEND_API_KEY;
  if (!resendKey) {
    return new Response('Config error', { status: 500 });
  }

  const pdfUrl = 'https://www.folkcalm.com/pdfs/25-Chinese-Household-Remedies-Guide.pdf';
  
  const emailHtml = `<div style="font-family: Georgia; max-width: 600px; padding: 20px; background: #FDF8F0;">
<h2 style="color: #5C3317;">Your Purchase — The Folk Calm Kitchen</h2>
<p>Thank you for your order!</p>
<p>Here is your guide: <strong>25 Chinese Household Remedies</strong> — 28 pages of simmered preparations and folk practices, passed down through generations.</p>
<div style="text-align: center; margin: 24px 0;">
<a href="${pdfUrl}" style="background: #A0522D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 15px;">Download Your Guide</a>
</div>
<p style="color: #888; font-size: 12px;">Transaction: ${txnId || 'N/A'}</p>
<p style="color: #888;">This is a cultural documentation, not medical advice.</p>
<p>— Folk Calm</p>
</div>`;

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Folk Calm <guide@folkcalm.com>',
      to: [payerEmail],
      subject: 'Your Purchase: 25 Chinese Household Remedies',
      html: emailHtml
    })
  });

  const emailResult = await emailRes.json();
  console.log('Email sent:', emailResult);

  return new Response('OK', { status: 200 });
}