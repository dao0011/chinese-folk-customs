import { secureResponse } from '../_lib/http.js';

const GONE_IMAGES = new Set([
  'hair-combing-ritual.png',
  'hero-bg-soft.webp',
  'kitchen-tools/bamboo-chopsticks.webp',
  'kitchen-tools/bamboo-steamer.webp',
  'kitchen-tools/carbon-steel-wok.webp',
  'kitchen-tools/clay-pot.webp',
  'kitchen-tools/clay-teapot.webp',
  'kitchen-tools/gourd-ladle.webp',
  'kitchen-tools/herbal-pot.webp',
  'kitchen-tools/mortar-pestle.webp',
  'kitchen-tools/rice-bowl.webp',
  'kitchen-tools/rolling-pin.webp',
  'pattern-dark.svg',
  'pattern-light.svg',
  'pin-bamboo-wife.webp',
  'pin-chrysanthemum-tea-agnes.webp',
  'pin-ginger-scalp-rub.webp',
  'pin-hair-combing-jimeng.png',
  'pin-longan-red-date-tea.webp',
  'pin-mung-bean-soup-agnes.webp',
  'pin-mung-bean-soup.webp',
  'pin-pear-water-night-cough.webp',
  'pin-salt-water-gargle.webp',
  'pin-soap-pods-ChatGPT.png',
  'pin-sour-plum-drink.webp',
  'pin-sunning-back-jimeng.png',
  'pin-tremella-soup.webp',
  'pin-warm-towel-jimeng.webp',
  'pinterest-bedding-airing-pin.jpg',
  'pinterest-foot-soak-pin.jpg',
  'pinterest-morning-water-pin.jpg',
  'pinterest-rice-water-pin.jpg',
  'pinterest-sichuan-peppercorn-pin.jpg',
  'pinterest-winter-melon-pin.jpg',
  'sunning-the-back.png',
]);

function gone(request) {
  return secureResponse(request.method === 'HEAD' ? null : 'Gone', {
    status: 410,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function onRequest(context) {
  var request = context.request;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return secureResponse('Method not allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    });
  }

  var imagePath;
  try {
    imagePath = decodeURIComponent(new URL(request.url).pathname.replace(/^\/images\//, ''));
  } catch (e) {
    return secureResponse('Bad Request', { status: 400 });
  }

  if (imagePath.split('/').some(function (segment) {
    return segment.startsWith('.') || segment.startsWith('_');
  })) {
    return secureResponse(request.method === 'HEAD' ? null : 'Not Found', {
      status: 404,
      headers: { 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }

  if (GONE_IMAGES.has(imagePath)) {
    return gone(request);
  }

  return context.env.ASSETS.fetch(request);
}
