const PAID_GUIDE_FILE = 'The-Folk-Calm-Kitchen-Guide.pdf';
const GONE_PDFS = new Set([
  'Grandmothers-Household-Shelf-Guide.pdf',
  'Grandmothers-Kitchen-Toolkit-Guide.pdf',
  'Quiet-Rules-of-the-Chinese-Table-Guide.pdf',
  '25-Chinese-Household-Remedies-Guide.pdf',
]);

function getTokenSecret(env) {
  return env.PDF_TOKEN_SECRET || env.PAYPAL_CLIENT_SECRET || '';
}

function base64Url(bytes) {
  var binary = '';
  for (var i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function constantTimeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function signDownloadToken(env, file, orderID, expires) {
  var secret = getTokenSecret(env);
  if (!secret) throw new Error('PDF token secret is not configured');

  var encoder = new TextEncoder();
  var key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  var data = [file, orderID, expires].join('|');
  var signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64Url(new Uint8Array(signature));
}

async function hasValidToken(request, env, file) {
  var url = new URL(request.url);
  var orderID = url.searchParams.get('order') || '';
  var expires = url.searchParams.get('expires') || '';
  var token = url.searchParams.get('token') || '';
  var expiresNumber = Number(expires);

  if (!orderID || !expires || !token) return false;
  if (!Number.isFinite(expiresNumber) || expiresNumber <= Math.floor(Date.now() / 1000)) return false;

  var expected = await signDownloadToken(env, file, orderID, expires);
  return constantTimeEqual(token, expected);
}

function assetRequestWithoutToken(request) {
  var url = new URL(request.url);
  url.search = '';
  return new Request(url.toString(), request);
}

function forbidden() {
  return new Response('Forbidden', {
    status: 403,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function gone() {
  return new Response('Gone', {
    status: 410,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function onRequest(context) {
  var request = context.request;
  var env = context.env;
  var url = new URL(request.url);
  var file = decodeURIComponent(url.pathname.replace(/^\/pdfs\//, ''));

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { 'Allow': 'GET, HEAD' },
    });
  }

  if (GONE_PDFS.has(file)) {
    return gone();
  }

  if (file !== PAID_GUIDE_FILE) {
    return env.ASSETS.fetch(request);
  }

  try {
    if (!(await hasValidToken(request, env, file))) {
      return forbidden();
    }
  } catch (e) {
    console.error('PDF token verification error:', e);
    return new Response('Download unavailable', {
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  var assetRes = await env.ASSETS.fetch(assetRequestWithoutToken(request));
  var headers = new Headers(assetRes.headers);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('Content-Disposition', 'attachment; filename="' + PAID_GUIDE_FILE + '"');
  headers.set('X-Content-Type-Options', 'nosniff');

  return new Response(assetRes.body, {
    status: assetRes.status,
    statusText: assetRes.statusText,
    headers: headers,
  });
}
