import { secureResponse, withSecurityHeaders } from '../_lib/http.js';

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

function forbidden(request) {
  return secureResponse(request.method === 'HEAD' ? null : 'Forbidden', {
    status: 403,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function gone(request) {
  return secureResponse(request.method === 'HEAD' ? null : 'Gone', {
    status: 410,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function hiddenNotFound(request) {
  return secureResponse(request.method === 'HEAD' ? null : 'Not Found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function isPrivateFile(file) {
  var lower = file.toLowerCase();
  var segments = lower.split('/');
  return segments.some(function (segment) {
    return segment.startsWith('.') || segment.startsWith('_');
  }) || /\.(?:bat|cmd|lock|log|md|ps1|py|pyc|pyo|sh|toml|ya?ml)$/.test(lower);
}

export async function onRequest(context) {
  var request = context.request;
  var env = context.env;
  var url = new URL(request.url);
  var file = decodeURIComponent(url.pathname.replace(/^\/pdfs\//, ''));

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return secureResponse('Method not allowed', {
      status: 405,
      headers: { 'Allow': 'GET, HEAD' },
    });
  }

  if (isPrivateFile(file)) {
    return hiddenNotFound(request);
  }

  if (GONE_PDFS.has(file)) {
    return gone(request);
  }

  if (file !== PAID_GUIDE_FILE) {
    return env.ASSETS.fetch(request);
  }

  try {
    if (!(await hasValidToken(request, env, file))) {
      return forbidden(request);
    }
  } catch (e) {
    console.error('PDF token verification error:', e);
    return secureResponse('Download unavailable', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  var assetRes = await env.ASSETS.fetch(assetRequestWithoutToken(request));
  return withSecurityHeaders(assetRes, {
    'Cache-Control': 'private, no-store',
    'Content-Disposition': 'attachment; filename="' + PAID_GUIDE_FILE + '"',
  });
}
