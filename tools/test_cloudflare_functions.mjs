import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { onRequest as routeRequest } from '../functions/[[path]].js';
import { onRequest as captureRequest } from '../functions/capture-order.js';
import { onRequest as imageRequest } from '../functions/images/[[path]].js';
import { onRequest as pdfRequest } from '../functions/pdfs/[[path]].js';
import { onRequest as subscribeRequest } from '../functions/subscribe.js';
import { onRequest as unsubscribeRequest } from '../functions/unsubscribe.js';
import {
  filterSitemapXml,
  parseArticlePublicationDates,
  publicationForPath,
  shanghaiCalendarDate,
} from '../functions/_lib/publication.js';

const ROOT = new URL('../', import.meta.url);
const source = await readFile(new URL('js/articles-data.js', ROOT), 'utf8');
const sitemap = await readFile(new URL('sitemap.xml', ROOT), 'utf8');
const homeHtml = await readFile(new URL('index.html', ROOT), 'utf8');
const componentsSource = await readFile(new URL('js/components.js', ROOT), 'utf8');
const dates = parseArticlePublicationDates(source);

function assertSecure(response) {
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer');
  assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
  assert.equal(response.headers.get('Cross-Origin-Resource-Policy'), 'same-origin');
  assert.equal(response.headers.get('Permissions-Policy'), 'camera=(), microphone=(), geolocation=()');
}

function dataSource(entries) {
  return 'window.FOLK_CALM_DATA = { articles: [' + entries.map(function (entry) {
    return "{ url: '" + entry.file + "', title: 'Test', date: '" + entry.date + "' }";
  }).join(',') + '] };';
}

function mockAssets(articleData, sitemapXml) {
  var calls = [];
  return {
    calls: calls,
    async fetch(request) {
      var url = new URL(request.url);
      calls.push(url.pathname);
      if (url.pathname === '/js/articles-data.js') {
        return new Response(articleData, { status: 200 });
      }
      if (url.pathname === '/sitemap.xml') {
        return new Response(sitemapXml || sitemap, { status: 200 });
      }
      return new Response('asset:' + url.pathname, { status: 200 });
    },
  };
}

// Shared-data parsing and the Asia/Shanghai midnight boundary.
assert.ok(dates.size > 0);
assert.equal(shanghaiCalendarDate(new Date('2026-07-22T15:59:59Z')), '2026-07-22');
assert.equal(shanghaiCalendarDate(new Date('2026-07-22T16:00:00Z')), '2026-07-23');

var latestEntry = [...dates.entries()].sort(function (a, b) {
  return a[1].localeCompare(b[1]);
}).at(-1);
var latestFile = latestEntry[0];
var latestDate = latestEntry[1];
var latestPrettyPath = '/' + latestFile.replace(/\.html$/, '');
var dayBeforeLatest = new Date(latestDate + 'T00:00:00Z');
dayBeforeLatest.setUTCDate(dayBeforeLatest.getUTCDate() - 1);
var previousDate = dayBeforeLatest.toISOString().slice(0, 10);

assert.equal(publicationForPath(latestPrettyPath, dates).date, latestDate);
assert.equal(publicationForPath('/' + latestFile, dates).date, latestDate);
assert.equal(filterSitemapXml(sitemap, dates, previousDate).includes(latestFile), false);
assert.equal(filterSitemapXml(sitemap, dates, latestDate).includes(latestFile), true);

// Article requests fail closed for future/unknown records and support Pretty URLs.
var gatedAssets = mockAssets(dataSource([
  { file: 'article-old.html', date: '2000-01-01' },
  { file: 'article-future.html', date: '2099-01-01' },
]));
var oldArticle = await routeRequest({
  request: new Request('https://www.folkcalm.com/article-old'),
  env: { ASSETS: gatedAssets },
});
assert.equal(oldArticle.status, 200);
assert.equal(await oldArticle.text(), 'asset:/article-old');

var futureArticle = await routeRequest({
  request: new Request('https://www.folkcalm.com/article-future.html'),
  env: { ASSETS: gatedAssets },
});
assert.equal(futureArticle.status, 404);
assertSecure(futureArticle);

var unknownArticle = await routeRequest({
  request: new Request('https://www.folkcalm.com/article-not-in-data'),
  env: { ASSETS: gatedAssets },
});
assert.equal(unknownArticle.status, 404);

var privateFile = await routeRequest({
  request: new Request('https://www.folkcalm.com/README.md'),
  env: { ASSETS: gatedAssets },
});
assert.equal(privateFile.status, 404);
assertSecure(privateFile);

var dynamicSitemap = await routeRequest({
  request: new Request('https://www.folkcalm.com/sitemap.xml'),
  env: { ASSETS: gatedAssets },
});
assert.equal(dynamicSitemap.status, 200);
assertSecure(dynamicSitemap);
assert.doesNotMatch(await dynamicSitemap.text(), /article-future\.html/);

// Subscribe source verification, autofill compatibility, and method behavior.
assert.doesNotMatch(homeHtml, /name=["']website["']/);
assert.doesNotMatch(componentsSource, /name=["']website["']/);

var subscribeGet = await subscribeRequest({
  request: new Request('https://www.folkcalm.com/subscribe'),
  env: {},
});
assert.equal(subscribeGet.status, 405);
assert.equal(subscribeGet.headers.get('Allow'), 'POST');
assertSecure(subscribeGet);

var crossSiteSubscribe = await subscribeRequest({
  request: new Request('https://www.folkcalm.com/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://attacker.example',
    },
    body: 'email_address=user%40example.com',
  }),
  env: {},
});
assert.equal(crossSiteSubscribe.status, 403);

var unverifiableSubscribe = await subscribeRequest({
  request: new Request('https://www.folkcalm.com/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'email_address=user%40example.com',
  }),
  env: {},
});
assert.equal(unverifiableSubscribe.status, 403);

var privacyCompatibleSubscribe = await subscribeRequest({
  request: new Request('https://www.folkcalm.com/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Sec-Fetch-Site': 'same-origin',
    },
    body: 'email_address=not-an-email',
  }),
  env: {},
});
assert.equal(privacyCompatibleSubscribe.status, 400);
assertSecure(privacyCompatibleSubscribe);

var originalFetch = globalThis.fetch;
var resendCalls = [];
globalThis.fetch = async function (url, init) {
  resendCalls.push({ url: String(url), init: init });
  return new Response('{}', { status: 200 });
};

try {
  var validSubscribe = await subscribeRequest({
    request: new Request('https://www.folkcalm.com/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.folkcalm.com',
      },
      // Cached pages may briefly retain the removed field. It must not cause a
      // silent success response that skips Resend.
      body: 'email_address=reader%40example.com&website=https%3A%2F%2Fautofill.example',
    }),
    env: { RESEND_API_KEY: 'test-key' },
  });
  assert.equal(validSubscribe.status, 303);
  assert.equal(resendCalls.length, 2);
  assert.match(resendCalls[0].url, /\/contacts$/);
  assert.match(resendCalls[1].url, /\/emails$/);
  assert.match(resendCalls[1].init.body, /10-Ancient-Chinese-Evening-Habits-Guide\.pdf/);
  assertSecure(validSubscribe);
} finally {
  globalThis.fetch = originalFetch;
}

resendCalls = [];
globalThis.fetch = async function (url, init) {
  resendCalls.push({ url: String(url), init: init });
  if (String(url).endsWith('/contacts')) {
    return new Response('{"message":"already exists"}', { status: 409 });
  }
  return new Response('{}', { status: 200 });
};

try {
  var validResubscribe = await subscribeRequest({
    request: new Request('https://www.folkcalm.com/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.folkcalm.com',
      },
      body: 'email_address=reader%40example.com',
    }),
    env: { RESEND_API_KEY: 'test-key' },
  });
  assert.equal(validResubscribe.status, 303);
  assert.equal(resendCalls.length, 3);
  assert.equal(resendCalls[1].init.method, 'PATCH');
  assert.match(resendCalls[2].url, /\/emails$/);
  assertSecure(validResubscribe);
} finally {
  globalThis.fetch = originalFetch;
}

resendCalls = [];
globalThis.fetch = async function (url, init) {
  resendCalls.push({ url: String(url), init: init });
  return new Response('{"message":"validation failed"}', { status: 422 });
};

try {
  var invalidContactSubscribe = await subscribeRequest({
    request: new Request('https://www.folkcalm.com/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.folkcalm.com',
      },
      body: 'email_address=reader%40example.com',
    }),
    env: { RESEND_API_KEY: 'test-key' },
  });
  assert.equal(invalidContactSubscribe.status, 500);
  assert.equal(resendCalls.length, 1);
  assert.match(resendCalls[0].url, /\/contacts$/);
  assertSecure(invalidContactSubscribe);
} finally {
  globalThis.fetch = originalFetch;
}

resendCalls = [];
globalThis.fetch = async function (url, init) {
  resendCalls.push({ url: String(url), init: init });
  if (String(url).endsWith('/contacts')) {
    return new Response('{"message":"already exists"}', { status: 409 });
  }
  if (init.method === 'PATCH') {
    return new Response('{"message":"update failed"}', { status: 500 });
  }
  throw new Error('Welcome email must not be sent after a failed contact update');
};

try {
  var failedResubscribe = await subscribeRequest({
    request: new Request('https://www.folkcalm.com/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.folkcalm.com',
      },
      body: 'email_address=reader%40example.com',
    }),
    env: { RESEND_API_KEY: 'test-key' },
  });
  assert.equal(failedResubscribe.status, 500);
  assert.equal(resendCalls.length, 2);
  assert.match(resendCalls[1].url, /\/contacts\/reader%40example\.com$/);
  assert.equal(resendCalls[1].init.method, 'PATCH');
  assertSecure(failedResubscribe);
} finally {
  globalThis.fetch = originalFetch;
}

// Unsubscribe GET pass-through, explicit methods, origin check, and honeypot.
var unsubscribeAssets = mockAssets(source);
var unsubscribeGet = await unsubscribeRequest({
  request: new Request('https://www.folkcalm.com/unsubscribe'),
  env: { ASSETS: unsubscribeAssets },
});
assert.equal(unsubscribeGet.status, 200);
assert.equal(await unsubscribeGet.text(), 'asset:/unsubscribe');

var unsubscribePut = await unsubscribeRequest({
  request: new Request('https://www.folkcalm.com/unsubscribe', { method: 'PUT' }),
  env: { ASSETS: unsubscribeAssets },
});
assert.equal(unsubscribePut.status, 405);
assert.equal(unsubscribePut.headers.get('Allow'), 'GET, HEAD, POST');
assertSecure(unsubscribePut);

var trappedUnsubscribe = await unsubscribeRequest({
  request: new Request('https://www.folkcalm.com/unsubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.folkcalm.com',
    },
    body: 'email_address=bot%40example.com&_gotcha=filled',
  }),
  env: { ASSETS: unsubscribeAssets },
});
assert.equal(trappedUnsubscribe.status, 302);
assert.match(trappedUnsubscribe.headers.get('Location'), /\?sent=1$/);
assertSecure(trappedUnsubscribe);

resendCalls = [];
globalThis.fetch = async function (url, init) {
  resendCalls.push({ url: String(url), init: init });
  return new Response('{}', { status: 200 });
};

try {
  var validUnsubscribe = await unsubscribeRequest({
    request: new Request('https://www.folkcalm.com/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.folkcalm.com',
      },
      body: 'email_address=reader%40example.com',
    }),
    env: { ASSETS: unsubscribeAssets, RESEND_API_KEY: 'test-key' },
  });
  assert.equal(validUnsubscribe.status, 302);
  assert.match(validUnsubscribe.headers.get('Location'), /\?sent=1$/);
  assert.equal(resendCalls.length, 1);
  assert.equal(resendCalls[0].init.method, 'PATCH');
  assertSecure(validUnsubscribe);
} finally {
  globalThis.fetch = originalFetch;
}

// Capture-order, protected PDFs, and retired images all emit direct security headers.
var captureGet = await captureRequest({
  request: new Request('https://www.folkcalm.com/capture-order'),
  env: {},
});
assert.equal(captureGet.status, 405);
assert.equal(captureGet.headers.get('Allow'), 'POST');
assertSecure(captureGet);

var paypalCalls = [];
globalThis.fetch = async function (url, init) {
  paypalCalls.push({ url: String(url), init: init });
  if (String(url).endsWith('/v1/oauth2/token')) {
    return new Response(JSON.stringify({ access_token: 'access-token' }), { status: 200 });
  }
  if (String(url).includes('/v2/checkout/orders/ORDER-1/capture')) {
    return new Response(JSON.stringify({
      status: 'COMPLETED',
      purchase_units: [{
        payee: { merchant_id: 'merchant-1' },
        payments: {
          captures: [{
            id: 'TRANSACTION-1',
            status: 'COMPLETED',
            amount: { value: '7.99', currency_code: 'USD' },
          }],
        },
      }],
    }), { status: 200 });
  }
  throw new Error('Unexpected PayPal mock URL: ' + url);
};

try {
  var captureSuccess = await captureRequest({
    request: new Request('https://www.folkcalm.com/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderID: 'ORDER-1', email: 'buyer@example.com' }),
    }),
    env: {
      PAYPAL_CLIENT_ID: 'client-id',
      PAYPAL_CLIENT_SECRET: 'client-secret',
      PAYPAL_MERCHANT_ID: 'merchant-1',
    },
  });
  assert.equal(captureSuccess.status, 200);
  assertSecure(captureSuccess);
  var captureBody = await captureSuccess.json();
  assert.equal(captureBody.ok, true);
  assert.equal(captureBody.transactionId, 'TRANSACTION-1');
  assert.match(captureBody.downloadUrl, /\/pdfs\/The-Folk-Calm-Kitchen-Guide\.pdf/);
  assert.equal(paypalCalls.length, 2);
} finally {
  globalThis.fetch = originalFetch;
}

var pdfForbidden = await pdfRequest({
  request: new Request('https://www.folkcalm.com/pdfs/The-Folk-Calm-Kitchen-Guide.pdf'),
  env: { ASSETS: mockAssets(source) },
});
assert.equal(pdfForbidden.status, 403);
assertSecure(pdfForbidden);

var previewBlocked = await pdfRequest({
  request: new Request('https://www.folkcalm.com/pdfs/_preview-secret.png'),
  env: { ASSETS: mockAssets(source) },
});
assert.equal(previewBlocked.status, 404);
assertSecure(previewBlocked);

var goneImage = await imageRequest({
  request: new Request('https://www.folkcalm.com/images/pattern-dark.svg'),
  env: { ASSETS: mockAssets(source) },
});
assert.equal(goneImage.status, 410);
assertSecure(goneImage);

var routes = JSON.parse(await readFile(new URL('_routes.json', ROOT), 'utf8'));
assert.equal(routes.version, 1);
assert.ok(routes.include.includes('/article-*'));
assert.ok(routes.include.includes('/sitemap.xml'));
assert.ok(routes.include.includes('/tools/*'));
assert.ok(routes.include.includes('/requirements.txt'));
assert.ok(!routes.include.includes('/*'));

function routeMatches(pathname, pattern) {
  var escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp('^' + escaped + '$').test(pathname);
}

function isFunctionRoute(pathname) {
  return routes.include.some(function (pattern) {
    return routeMatches(pathname, pattern);
  }) && !routes.exclude.some(function (pattern) {
    return routeMatches(pathname, pattern);
  });
}

var imageFunctionSource = await readFile(new URL('functions/images/[[path]].js', ROOT), 'utf8');
var goneImagesBlock = imageFunctionSource.match(/const GONE_IMAGES = new Set\(\[([\s\S]*?)\]\);/)[1];
var goneImages = [...goneImagesBlock.matchAll(/'([^']+)'/g)].map(function (match) {
  return '/images/' + match[1];
});
goneImages.forEach(function (pathname) {
  assert.ok(isFunctionRoute(pathname), 'Missing retired-image route: ' + pathname);
});

var pdfFunctionSource = await readFile(new URL('functions/pdfs/[[path]].js', ROOT), 'utf8');
var gonePdfsBlock = pdfFunctionSource.match(/const GONE_PDFS = new Set\(\[([\s\S]*?)\]\);/)[1];
var protectedPdfs = [...gonePdfsBlock.matchAll(/'([^']+)'/g)].map(function (match) {
  return '/pdfs/' + match[1];
});
protectedPdfs.push('/pdfs/The-Folk-Calm-Kitchen-Guide.pdf');
protectedPdfs.forEach(function (pathname) {
  assert.ok(isFunctionRoute(pathname), 'Missing protected-PDF route: ' + pathname);
});

[
  '/css/styles.css',
  '/js/articles-data.js',
  '/images/warm-foot-soak-basin.webp',
  '/index.html',
  '/about',
  '/robots.txt',
  '/pdfs/10-Ancient-Chinese-Evening-Habits-Guide.pdf',
].forEach(function (pathname) {
  assert.equal(isFunctionRoute(pathname), false, 'Static asset unexpectedly invokes Functions: ' + pathname);
});

console.log('Cloudflare Functions regression checks: PASS');
