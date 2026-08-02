const SECURITY_HEADERS = {
  'Cache-Control': 'no-store',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export function withSecurityHeaders(response, extraHeaders) {
  var headers = new Headers(response.headers);
  var additions = { ...SECURITY_HEADERS, ...(extraHeaders || {}) };

  Object.keys(additions).forEach(function (name) {
    headers.set(name, additions[name]);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

export function secureResponse(body, init) {
  var responseInit = init || {};
  var headers = new Headers(responseInit.headers || {});

  Object.keys(SECURITY_HEADERS).forEach(function (name) {
    if (!headers.has(name)) headers.set(name, SECURITY_HEADERS[name]);
  });

  return new Response(body, { ...responseInit, headers: headers });
}

export function jsonResponse(value, status, extraHeaders) {
  var headers = new Headers(extraHeaders || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return secureResponse(JSON.stringify(value), {
    status: status || 200,
    headers: headers,
  });
}

export function secureRedirect(url, status) {
  return secureResponse(null, {
    status: status || 302,
    headers: { Location: url },
  });
}

export function methodNotAllowed(allow, json) {
  var headers = { Allow: allow };
  if (json) {
    return jsonResponse({ error: 'Method not allowed' }, 405, headers);
  }
  return secureResponse('Method not allowed', { status: 405, headers: headers });
}

export function isSameOriginRequest(request) {
  var expectedOrigin = new URL(request.url).origin;
  var fetchSite = (request.headers.get('Sec-Fetch-Site') || '').toLowerCase();

  if (fetchSite === 'cross-site') return false;

  var origin = request.headers.get('Origin');
  if (origin) {
    if (origin === 'null') return false;
    try {
      return new URL(origin).origin === expectedOrigin;
    } catch (e) {
      return false;
    }
  }

  var referer = request.headers.get('Referer');
  if (referer) {
    try {
      return new URL(referer).origin === expectedOrigin;
    } catch (e) {
      return false;
    }
  }

  // Privacy tools can remove Origin and Referer while retaining Fetch
  // Metadata. Accept only an explicit same-origin signal; fully unverifiable
  // requests remain blocked.
  return fetchSite === 'same-origin';
}

export function hasFilledHoneypot(formData) {
  var fieldNames = ['website', 'company_website', '_gotcha'];
  return fieldNames.some(function (name) {
    return String(formData.get(name) || '').trim() !== '';
  });
}

export function isSupportedFormContentType(request) {
  var contentType = (request.headers.get('Content-Type') || '').toLowerCase();
  return contentType.startsWith('application/x-www-form-urlencoded') ||
    contentType.startsWith('multipart/form-data');
}

export function isOversizedForm(request, maximumBytes) {
  var rawLength = request.headers.get('Content-Length');
  if (!rawLength) return false;
  var length = Number(rawLength);
  return Number.isFinite(length) && length > maximumBytes;
}
