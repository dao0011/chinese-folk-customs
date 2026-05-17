export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('Please use POST', { status: 405 });
  }

  var formData = await request.formData();
  var email = (formData.get('email_address') || formData.get('email') || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response('Invalid email.', { status: 400 });
  }

  var pdfUrl = 'https://tcmwellness.xyz/pdfs/10-Ancient-Chinese-Evening-Habits-Guide.pdf';
  var resendKey = env.RESEND_API_KEY;
  var from = env.RESEND_FROM || 'Folk Calm <guide@tcmwellness.xyz>';

  if (!resendKey) {
    return new Response('ENV MISSING: RESEND_API_KEY', { status: 500 });
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
        subject: 'Your Free Guide: 10 Ancient Chinese Evening Habits',
        html: '<p>Here is your free guide: <a href="' + pdfUrl + '">Download</a></p>',
      }),
    });

    var body = await res.text();
    return new Response('Resend: ' + res.status + ' -> ' + body.substring(0, 500), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 });
  }
}
