async function markContactUnsubscribed(email, resendKey) {
  var headers = {
    'Authorization': 'Bearer ' + resendKey,
    'Content-Type': 'application/json',
  };

  var updateRes = await fetch('https://api.resend.com/contacts/' + encodeURIComponent(email), {
    method: 'PATCH',
    headers: headers,
    body: JSON.stringify({
      unsubscribed: true,
    }),
  });

  if (updateRes.ok) {
    return;
  }

  var updateBody = await updateRes.text();

  if (updateRes.status === 404) {
    var createRes = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        email: email,
        unsubscribed: true,
      }),
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
