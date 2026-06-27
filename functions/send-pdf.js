// Cloudflare Function: Send paid PDF via email
// POST /api/send-pdf
// Body: { email: string, product: string }

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
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const email = body.email;
  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid email' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const resendKey = env.RESEND_API_KEY;
  if (!resendKey) {
    return new Response(JSON.stringify({ ok: false, error: 'Server config' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const pdfUrl = 'https://www.folkcalm.com/pdfs/25-Chinese-Household-Remedies-Guide.pdf';

  const html = `<div style="font-family: Georgia; max-width: 600px; padding: 20px; background: #FDF8F0;">
<h2 style="color: #5C3317;">Thank You for Your Purchase</h2>
<p style="color: #A0522D; font-style: italic;">The Folk Calm Kitchen — 25 Chinese Household Remedies</p>
<p>Here is your guide. 28 pages of simmered preparations and folk practices, passed down through generations.</p>
<div style="text-align: center; margin: 24px 0;">
<a href="${pdfUrl}" style="background: #A0522D; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 15px;">Download Your PDF</a>
</div>
<p style="color: #888; font-size: 12px;">This is a cultural documentation, not medical advice.</p>
<p>— Folk Calm</p>
</div>`;

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
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

    const result = await emailRes.json();
    console.log('Resend:', result);

    if (emailRes.ok) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ ok: false, error: 'Email failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Network error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}