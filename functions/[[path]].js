const GONE_PATHS = new Set([
  '/google198e627e00e92b43.html',
  '/project-words.txt',
  '/skills-lock.json',
  '/images/hair-combing-ritual.png',
  '/images/hero-bg-soft.webp',
  '/images/kitchen-tools/bamboo-chopsticks.webp',
  '/images/kitchen-tools/bamboo-steamer.webp',
  '/images/kitchen-tools/carbon-steel-wok.webp',
  '/images/kitchen-tools/clay-pot.webp',
  '/images/kitchen-tools/clay-teapot.webp',
  '/images/kitchen-tools/gourd-ladle.webp',
  '/images/kitchen-tools/herbal-pot.webp',
  '/images/kitchen-tools/mortar-pestle.webp',
  '/images/kitchen-tools/rice-bowl.webp',
  '/images/kitchen-tools/rolling-pin.webp',
  '/images/pattern-dark.svg',
  '/images/pattern-light.svg',
  '/images/pin-bamboo-wife.webp',
  '/images/pin-chrysanthemum-tea-agnes.webp',
  '/images/pin-ginger-scalp-rub.webp',
  '/images/pin-hair-combing-jimeng.png',
  '/images/pin-longan-red-date-tea.webp',
  '/images/pin-mung-bean-soup-agnes.webp',
  '/images/pin-mung-bean-soup.webp',
  '/images/pin-pear-water-night-cough.webp',
  '/images/pin-salt-water-gargle.webp',
  '/images/pin-soap-pods-ChatGPT.png',
  '/images/pin-sour-plum-drink.webp',
  '/images/pin-sunning-back-jimeng.png',
  '/images/pin-tremella-soup.webp',
  '/images/pin-warm-towel-jimeng.webp',
  '/images/pinterest-bedding-airing-pin.jpg',
  '/images/pinterest-foot-soak-pin.jpg',
  '/images/pinterest-morning-water-pin.jpg',
  '/images/pinterest-rice-water-pin.jpg',
  '/images/pinterest-sichuan-peppercorn-pin.jpg',
  '/images/pinterest-winter-melon-pin.jpg',
  '/images/sunning-the-back.png',
  '/pdfs/Grandmothers-Household-Shelf-Guide.pdf',
  '/pdfs/Grandmothers-Kitchen-Toolkit-Guide.pdf',
  '/pdfs/Quiet-Rules-of-the-Chinese-Table-Guide.pdf',
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
