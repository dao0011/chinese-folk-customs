export async function onRequestPost({ request, env }) {
  var formData = await request.formData();
  var email = (formData.get('email_address') || formData.get('email') || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response('Invalid email.', { status: 400 });
  }

  var pdfUrl = 'https://tcmwellness.xyz/pdfs/10-Ancient-Chinese-Evening-Habits-Guide.pdf';
  var resendKey = env.RESEND_API_KEY;
  var from = env.RESEND_FROM || 'Folk Calm <guide@tcmwellness.xyz>';

  if (!resendKey) {
    return new Response('ENV MISSING: RESEND_API_KEY not set');
  }

  // Step 1: Test basic connectivity to Resend
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
        html: '<p>Test email from Folk Calm. <a href="' + pdfUrl + '">Download your guide</a></p>',
      }),
    });

    var statusCode = res.status;
    var body = await res.text();

    // Show everything — status code, body, and env key preview
    var info = 'RESEND STATUS: ' + statusCode + '\n';
    info += 'RESEND BODY: ' + body.substring(0, 500) + '\n';
    info += 'KEY PREFIX: ' + resendKey.substring(0, 6) + '...\n';
    info += 'FROM: ' + from;

    return new Response(info, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (e) {
    return new Response('FETCH ERROR: ' + e.message + ' | ' + e.stack, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
