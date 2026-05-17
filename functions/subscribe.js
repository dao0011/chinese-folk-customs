export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return Response.redirect('https://tcmwellness.xyz/', 302);
  }

  var formData = await request.formData();
  var email = (formData.get('email_address') || formData.get('email') || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response('Please enter a valid email address.', { status: 400 });
  }

  var pdfUrl = 'https://tcmwellness.xyz/pdfs/10-Ancient-Chinese-Evening-Habits-Guide.pdf';
  var resendKey = env.RESEND_API_KEY;
  var from = env.RESEND_FROM || 'Folk Calm <guide@tcmwellness.xyz>';

  if (!resendKey) {
    return new Response('Server config error.', { status: 500 });
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
        html: [
          '<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">',
          '<h2 style="color: #5C3317;">Thank you for subscribing!</h2>',
          '<p>Here is your free cultural guide, as promised:</p>',
          '<p style="margin: 24px 0;">',
          '<a href="' + pdfUrl + '" style="background: #A0522D; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">Download Your Free Guide →</a>',
          '</p>',
          '<p style="color: #6B5B4A; font-size: 14px;">Or copy this link: <a href="' + pdfUrl + '">' + pdfUrl + '</a></p>',
          '<hr style="border: 1px solid #e0d5c5; margin: 24px 0;">',
          '<p style="color: #888; font-size: 12px;">You received this email because you subscribed at Folk Calm. <a href="https://tcmwellness.xyz/privacy-policy.html">Privacy Policy</a></p>',
          '</div>',
        ].join(''),
      }),
    });

    var body = await res.text();

    if (!res.ok) {
      return new Response('Resend error [' + res.status + ']: ' + body, { status: 502 });
    }

    return Response.redirect('https://tcmwellness.xyz/subscribe-thankyou', 303);
  } catch (e) {
    return new Response('Error: ' + e.message + ' | ' + e.stack, { status: 500 });
  }
}
