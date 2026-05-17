export async function onRequestPost({ request, env }) {
  var formData = await request.formData();
  var email = (formData.get('email_address') || formData.get('email') || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(
      JSON.stringify({ error: 'Please enter a valid email address.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  var pdfUrl = 'https://tcmwellness.xyz/pdfs/10-Ancient-Chinese-Evening-Habits-Guide.pdf';
  var resendKey = env.RESEND_API_KEY;
  var from = env.RESEND_FROM || 'Folk Calm <guide@tcmwellness.xyz>';

  if (!resendKey) {
    return new Response(
      'ENV ERROR: RESEND_API_KEY is not set in Cloudflare environment variables.',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  try {
    var htmlBody =
      '<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">' +
      '<h2 style="color: #5C3317;">Thank you for subscribing!</h2>' +
      '<p>Here is your free cultural guide, as promised:</p>' +
      '<p style="margin: 24px 0;">' +
      '<a href="' + pdfUrl + '" style="background: #A0522D; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">Download Your Free Guide</a>' +
      '</p>' +
      '<p style="color: #6B5B4A; font-size: 14px;">Or copy this link: <a href="' + pdfUrl + '">' + pdfUrl + '</a></p>' +
      '<hr style="border: 1px solid #e0d5c5; margin: 24px 0;">' +
      '<p style="color: #888; font-size: 12px;">You received this email because you subscribed at Folk Calm. <a href="https://tcmwellness.xyz/privacy-policy.html">Privacy Policy</a></p>' +
      '</div>';

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
        html: htmlBody,
      }),
    });

    var body = await res.text();

    if (!res.ok) {
      return new Response(
        'Resend API error: ' + body,
        { status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    return Response.redirect('/subscribe-thankyou?email=' + encodeURIComponent(email), 303);
  } catch (e) {
    return new Response(
      'Error: ' + e.message,
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }
}
