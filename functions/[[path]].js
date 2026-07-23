import { secureResponse } from './_lib/http.js';
import {
  filterSitemapXml,
  loadPublicationDates,
  publicationForPath,
  shanghaiCalendarDate,
} from './_lib/publication.js';

const GONE_PATHS = new Set([
  '/google198e627e00e92b43.html',
  '/project-words.txt',
  '/skills-lock.json',
]);

const PRIVATE_PATH_PREFIXES = [
  '/__pycache__/',
  '/content/',
  '/docs/',
  '/functions/',
  '/output/',
  '/references/',
  '/resend-audit/',
  '/skills/',
  '/tiktok_output/',
  '/tmp/',
  '/tools/',
];

const PRIVATE_ROOT_FILES = new Set([
  '/readme.md',
  '/build_pdfs.py',
  '/requirements.txt',
  '/send_now.py',
  '/verify_articles_data.py',
  '/_imgcheck.txt',
]);

const PRIVATE_FILE_SUFFIXES = [
  '.bat',
  '.cmd',
  '.lock',
  '.log',
  '.md',
  '.ps1',
  '.py',
  '.pyc',
  '.pyo',
  '.sh',
  '.toml',
  '.yaml',
  '.yml',
];

function decodedLowerPath(pathname) {
  try {
    return decodeURIComponent(pathname).toLowerCase();
  } catch (e) {
    return pathname.toLowerCase();
  }
}

function isPrivateRepositoryPath(pathname) {
  var path = decodedLowerPath(pathname);
  if (path.startsWith('/.') || path.startsWith('/_')) return true;
  if (PRIVATE_ROOT_FILES.has(path)) return true;
  if (PRIVATE_PATH_PREFIXES.some(function (prefix) { return path.startsWith(prefix); })) return true;
  if (PRIVATE_FILE_SUFFIXES.some(function (suffix) { return path.endsWith(suffix); })) return true;

  var segments = path.split('/').filter(Boolean);
  return segments.some(function (segment) { return segment.startsWith('_'); });
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

function gone(request) {
  return secureResponse(request.method === 'HEAD' ? null : 'Gone', {
    status: 410,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

async function publicationDates(context) {
  return loadPublicationDates(context.env.ASSETS, new URL(context.request.url).origin);
}

async function serveArticle(context, path) {
  var request = context.request;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return secureResponse('Method not allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    });
  }

  try {
    var dates = await publicationDates(context);
    var publication = publicationForPath(path, dates);
    var today = shanghaiCalendarDate();

    if (!publication || !publication.date || publication.date > today) {
      return hiddenNotFound(request);
    }
  } catch (e) {
    console.error('Article publication gate error:', e);
    return secureResponse('Temporarily unavailable', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Retry-After': '60',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return context.env.ASSETS.fetch(request);
}

async function serveSitemap(context) {
  var request = context.request;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return secureResponse('Method not allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    });
  }

  try {
    // Always read the full source even when the crawler sent conditional or
    // HEAD headers; the filtered sitemap itself is intentionally not cached.
    var sitemapUrl = new URL('/sitemap.xml', request.url);
    var assetResponse = await context.env.ASSETS.fetch(
      new Request(sitemapUrl.toString(), { method: 'GET' })
    );
    if (!assetResponse.ok) {
      return secureResponse('Sitemap unavailable', {
        status: assetResponse.status,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Retry-After': '60',
        },
      });
    }

    var dates = await publicationDates(context);
    var xml = filterSitemapXml(
      await assetResponse.text(),
      dates,
      shanghaiCalendarDate()
    );

    return secureResponse(request.method === 'HEAD' ? null : xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (e) {
    console.error('Sitemap publication filter error:', e);
    return secureResponse('Temporarily unavailable', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Retry-After': '60',
      },
    });
  }
}

export async function onRequest(context) {
  var request = context.request;
  var path = new URL(request.url).pathname;

  if (GONE_PATHS.has(path)) {
    return gone(request);
  }

  if (isPrivateRepositoryPath(path)) return hiddenNotFound(request);
  if (path === '/sitemap.xml') return serveSitemap(context);
  if (/^\/article-/i.test(decodedLowerPath(path))) return serveArticle(context, path);

  return context.env.ASSETS.fetch(request);
}
