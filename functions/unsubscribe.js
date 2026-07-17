var PAGE_HTML = [
'<!DOCTYPE html>',
'<html lang="en">',
'<head>',
'    <meta charset="UTF-8">',
'    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">',
'    <title>Unsubscribe — Folk Calm</title>',
'    <meta name="description" content="Request removal from Folk Calm email updates.">',
'    <meta name="robots" content="noindex, nofollow">',
'    <link rel="icon" href="favicon.ico" type="image/x-icon">',
'    <link rel="stylesheet" href="css/styles.css?v=15">',
'    <script src="js/components.js?v=11" defer></script>',
'</head>',
'<body>',
'    <a href="#main" class="skip-link">Skip to main content</a>',
'    <div id="site-disclaimer-banner"></div>',
'    <div id="site-header"></div>',
'    <main id="main" class="wrap">',
'        <article>',
'            <h1>Unsubscribe</h1>',
'            <div id="unsubscribe-sent" style="display:none">',
'                <p class="lead">You have been unsubscribed.</p>',
'                <p>This address has been marked as unsubscribed from Folk Calm updates.</p>',
'                <p><a href="/">Back to the home page →</a></p>',
'            </div>',
'            <div id="unsubscribe-error" style="display:none">',
'                <p class="lead">Something went wrong. Please try again, or email us directly at <a href="mailto:unsubscribe@folkcalm.com?subject=Unsubscribe">unsubscribe@folkcalm.com</a>.</p>',
'            </div>',
'            <div id="unsubscribe-form">',
'                <p class="lead">Enter the email address you want removed from Folk Calm updates.</p>',
'                <form class="email-cta-form" action="/unsubscribe" method="post">',
'                    <input type="email" name="email_address" placeholder="Your email address" required aria-label="Email address">',
'                    <button type="submit">Unsubscribe</button>',
'                </form>',
'                <p class="privacy-note">You can also reply STOP to any Folk Calm email.</p>',
'            </div>',
'        </article>',
'    </main>',
'    <div id="site-footer"></div>',
'    <script>',
'    (function(){',
'        var p=new URLSearchParams(window.location.search);',
'        if(p.get("sent")==="1"){document.getElementById("unsubscribe-form").style.display="none";document.getElementById("unsubscribe-sent").style.display="block"}',
'        else if(p.get("error")==="1"){document.getElementById("unsubscribe-form").style.display="none";document.getElementById("unsubscribe-error").style.display="block"}',
'    })();',
'    </script>',
'    <script src="js/main.js" defer></script>',
'</body>',
'</html>',
].join('');

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

export async function onRequest({ request, env }) {
  if (request.method === 'GET') {
    return new Response(PAGE_HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  var formData = await request.formData();
  var email = (formData.get('email_address') || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.redirect('https://www.folkcalm.com/unsubscribe?error=1', 302);
  }

  var resendKey = env.RESEND_API_KEY;

  if (!resendKey) {
    return Response.redirect('https://www.folkcalm.com/unsubscribe?error=1', 302);
  }

  try {
    await markContactUnsubscribed(email, resendKey);
    return Response.redirect('https://www.folkcalm.com/unsubscribe?sent=1', 302);
  } catch (e) {
    console.error('Unsubscribe error:', e);
    return Response.redirect('https://www.folkcalm.com/unsubscribe?error=1', 302);
  }
}
