const SHANGHAI_TIME_ZONE = 'Asia/Shanghai';
const publicationCache = new WeakMap();

export function shanghaiCalendarDate(now) {
  var formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: SHANGHAI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  var parts = formatter.formatToParts(now || new Date());
  var values = {};

  parts.forEach(function (part) {
    if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
      values[part.type] = part.value;
    }
  });

  return values.year + '-' + values.month + '-' + values.day;
}

export function parseArticlePublicationDates(source) {
  var dates = new Map();
  var entryPattern = /\{\s*url:\s*(['"])(article-[^'"]+\.html)\1[^}]*?\bdate:\s*(['"])(\d{4}-\d{2}-\d{2})\3[^}]*\}/gi;
  var match;

  while ((match = entryPattern.exec(source)) !== null) {
    dates.set(match[2].toLowerCase(), match[4]);
  }

  if (dates.size === 0) {
    throw new Error('No article publication dates were found in articles-data.js');
  }

  return dates;
}

function articleFileForPath(pathname) {
  var decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch (e) {
    return null;
  }

  var relativePath = decodedPath.replace(/^\/+|\/+$/g, '');
  if (!relativePath || relativePath.includes('/')) return null;

  var file = relativePath;
  if (!file.includes('.')) file += '.html';
  if (!/^article-[a-z0-9-]+\.html$/i.test(file)) return null;
  return file.toLowerCase();
}

export function publicationForPath(pathname, dates) {
  var file = articleFileForPath(pathname);
  if (!file) return null;
  return {
    file: file,
    date: dates.get(file) || null,
  };
}

function decodeXmlText(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function filterSitemapXml(xml, dates, today) {
  return xml.replace(/\s*<url>([\s\S]*?)<\/url>/gi, function (block, inner) {
    var locMatch = inner.match(/<loc>\s*([^<]+?)\s*<\/loc>/i);
    if (!locMatch) return block;

    var pathname;
    try {
      pathname = new URL(decodeXmlText(locMatch[1])).pathname;
    } catch (e) {
      return block;
    }

    var publication = publicationForPath(pathname, dates);
    if (!publication) return block;

    // Unknown article records are also omitted. This makes the shared article
    // data the single publication allowlist instead of accidentally exposing a
    // newly uploaded article whose metadata was forgotten.
    if (!publication.date || publication.date > today) return '';
    return block;
  });
}

async function fetchPublicationDates(assets, origin) {
  var dataUrl = new URL('/js/articles-data.js', origin);
  var response = await assets.fetch(new Request(dataUrl.toString(), { method: 'GET' }));
  if (!response.ok) {
    throw new Error('Unable to load articles-data.js: HTTP ' + response.status);
  }
  return parseArticlePublicationDates(await response.text());
}

export async function loadPublicationDates(assets, origin) {
  if (!assets || typeof assets.fetch !== 'function') {
    throw new Error('ASSETS binding is unavailable');
  }

  var cached = publicationCache.get(assets);
  if (!cached) {
    cached = fetchPublicationDates(assets, origin);
    publicationCache.set(assets, cached);
  }

  try {
    return await cached;
  } catch (e) {
    publicationCache.delete(assets);
    throw e;
  }
}
