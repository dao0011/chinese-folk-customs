const GONE_PATHS = new Set([
  '/google198e627e00e92b43.html',
  '/project-words.txt',
  '/skills-lock.json',
]);

export async function onRequest(context) {
  var request = context.request;
  var path = new URL(request.url).pathname;

  if (GONE_PATHS.has(path)) {
    return new Response('Gone', {
      status: 410,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  return context.env.ASSETS.fetch(request);
}
