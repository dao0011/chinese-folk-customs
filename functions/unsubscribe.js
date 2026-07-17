// Cloudflare Function: /unsubscribe endpoint
//
// Two responsibilities, split by HTTP method:
//   GET  — serve the static unsubscribe.html page (delegated to ASSETS so
//          Cloudflare Pages Pretty URLs rule serves /unsubscribe.html at
//          /unsubscribe without a 308 redirect loop).
//   POST — process the unsubscribe form: validate the email, mark the
//          Resend contact as unsubscribed (create-on-404 fallback), then
//          redirect back to /unsubscribe with ?sent=1 or ?error=1.
//
// The HTML page reads ?sent=1 / ?error=1 from the query string and shows
// the matching panel (unsubscribe-sent / unsubscribe-error / unsubscribe-form).

import { callResend } from './_lib/resend.js';

// Mark a Resend contact as unsubscribed.
// Tries PATCH first; if the contact does not exist (404), creates it with
// unsubscribed=true. Any other failure throws and the caller shows ?error=1.
async function markContactUnsubscribed(email, resendKey) {
  var updateRes = await callResend(resendKey, '/contacts/' + encodeURIComponent(email), 'PATCH', {
    unsubscribed: true,
  });

  if (updateRes.ok) {
    return;
  }

  var updateBody = await updateRes.text();

  if (updateRes.status === 404) {
    var createRes = await callResend(resendKey, '/contacts', 'POST', {
      email: email,
      unsubscribed: true,
    });

    if (createRes.ok) {
      return;
    }

    var createBody = await createRes.text();
    console.error('Resend contact create-unsubscribed error [' + createRes.status + ']: ' + createBody);
  }

  console.error('Resend contact unsubscribe error [' + updateRes.status + ']: ' + updateBody);
  throw new Error('Contact unsubscribe failed');
}

// 302-redirect back to /unsubscribe with a query string flag (?sent=1 or ?error=1).
// We always come back to the same page so the user sees the result inline.
function redirectToUnsubscribe(request, search) {
  var url = new URL(request.url);
  url.pathname = '/unsubscribe';
  url.search = search;
  return Response.redirect(url.toString(), 302);
}

export async function onRequest({ request, env }) {
  if (request.method === 'GET') {
    // Delegate to ASSETS: Cloudflare Pages Pretty URLs rule serves
    // /unsubscribe.html content at /unsubscribe automatically.
    // (Using '/unsubscribe.html' as pathname would trigger a 308 redirect
    // back to /unsubscribe, creating an infinite loop.)
    return env.ASSETS.fetch(request);
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  var formData = await request.formData();
  var email = (formData.get('email_address') || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirectToUnsubscribe(request, '?error=1');
  }

  var resendKey = env.RESEND_API_KEY;

  if (!resendKey) {
    return redirectToUnsubscribe(request, '?error=1');
  }

  try {
    await markContactUnsubscribed(email, resendKey);
    return redirectToUnsubscribe(request, '?sent=1');
  } catch (e) {
    console.error('Unsubscribe error:', e);
    return redirectToUnsubscribe(request, '?error=1');
  }
}
