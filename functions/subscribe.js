/**
 * Cloudflare Pages Function — Email Subscription + PDF Delivery
 * POST /subscribe  →  sends PDF guide to user's email via Resend
 *
 * Setup:
 *   1. Register at resend.com (free: 100 emails/day)
 *   2. Get API key from Resend dashboard
 *   3. In Cloudflare Dashboard → Pages → Settings → Environment Variables:
 *      RESEND_API_KEY = re_xxxxx
 *      RESEND_FROM    = Folk Calm <guide@yourdomain.com>
 *
 * The PDF link is emailed to the user — no direct download.
 */

export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const email = (formData.get('email_address') || formData.get('email') || '').trim();

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(
      JSON.stringify({ error: 'Please enter a valid email address.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const pdfUrl = 'https://chinese-folk-customs.pages.dev/pdfs/10-Ancient-Chinese-Evening-Habits-Guide.pdf';

  // Send email via Resend
  const resendKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM || 'Folk Calm <guide@chinese-folk-customs.pages.dev>';

  if (!resendKey) {
    // Fallback: redirect to thank-you page with PDF link
    return Response.redirect(
      `/subscribe-thankyou?email=${encodeURIComponent(email)}&pdf=${encodeURIComponent(pdfUrl)}`,
      303
    );
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'Your Free Guide: 10 Ancient Chinese Evening Habits',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #5C3317;">Thank you for subscribing!</h2>
            <p>Here is your free cultural guide, as promised:</p>
            <p style="margin: 24px 0;">
              <a href="${pdfUrl}" style="background: #A0522D; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                Download Your Free Guide →
              </a>
            </p>
            <p style="color: #6B5B4A; font-size: 14px;">Or copy this link: <a href="${pdfUrl}">${pdfUrl}</a></p>
            <hr style="border: 1px solid #e0d5c5; margin: 24px 0;">
            <p style="color: #888; font-size: 12px;">
              You received this email because you subscribed at Folk Calm.
              <br><a href="https://chinese-folk-customs.pages.dev/privacy-policy.html">Privacy Policy</a>
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      // Still redirect to thank-you page even if email fails
      return Response.redirect(
        `/subscribe-thankyou?email=${encodeURIComponent(email)}&pdf=${encodeURIComponent(pdfUrl)}`,
        303
      );
    }

    return Response.redirect(`/subscribe-thankyou?email=${encodeURIComponent(email)}`, 303);
  } catch (e) {
    console.error('Send error:', e);
    return Response.redirect(
      `/subscribe-thankyou?email=${encodeURIComponent(email)}&pdf=${encodeURIComponent(pdfUrl)}`,
      303
    );
  }
}
