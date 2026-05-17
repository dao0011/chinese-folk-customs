export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('GET works. POST your email here to test Resend.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  var formData = await request.formData();
  var email = (formData.get('email_address') || formData.get('email') || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response('Invalid email', { status: 400 });
  }

  var resendKey = env.RESEND_API_KEY;
  var from = env.RESEND_FROM || 'Folk Calm <guide@tcmwellness.xyz>';

  if (!resendKey) {
    return new Response('MISSING: RESEND_API_KEY env var', { status: 500 });
  }

  try {
    var res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from,
        to: [email],
        subject: 'Test from Folk Calm',
        html: '<p>If you see this, Resend is working. <a href="https://tcmwellness.xyz/pdfs/10-Ancient-Chinese-Evening-Habits-Guide.pdf">Download your guide</a></p>',
      }),
    });

    var body = await res.text();
    return new Response('Resend status: ' + res.status + '\nResponse: ' + body.substring(0, 500), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (e) {
    return new Response('Fetch error: ' + e.message, { status: 500 });
  }
}
