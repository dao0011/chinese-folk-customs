/**
 * Folk Calm — Shared Component Injection
 * Injects header, footer, disclaimer banner, and article widgets
 * across all pages. Edit once, update everywhere.
 */
(function () {
  'use strict';

  var path = window.location.pathname.replace(/^.*[\\/]/, '');
  if (!path) path = 'index.html';
  // Cloudflare serves article URLs without .html; use the canonical filename
  // internally so article metadata and layout work on both URL forms.
  if (/^article-[^/]+$/.test(path) && !/\.html$/i.test(path)) path += '.html';

  // 文章元数据（共享数据源，Related Articles + Latest Articles 共用）
  var articles = [
    { url: 'article-mugwort-foot-soak.html', title: 'Dried Mugwort and the Evening Foot Basin', desc: 'The herb seller tied dried mugwort with red cotton thread before placing it in my market bag. She pressed the bundle flat so the brittle leaves would not scatter among the vegetables.', img: 'images/warm-foot-soak-basin.webp', date: '2020-01-01' },
    { url: 'article-ginger-tea.html', title: 'Ginger and Red Dates After Dinner', desc: 'After dinner my grandmother cleared the bowls, cut ginger on the board that still smelled of scallion, and dropped red dates into a small enamel pot. The first cup went to the family member still sitting at the table.', img: 'images/ginger-date-tea.webp', date: '2020-01-01' },
    { url: 'article-rice-congee.html', title: 'Plain Rice Congee and the Everyday Pot', desc: 'At the grain stall, I asked why two sacks of white rice carried different prices. The seller rubbed a few grains between her fingers, then told me which one her family used for the breakfast pot.', img: 'images/rice-congee-kitchen.webp', date: '2020-01-01' },
    { url: 'article-salt-warm-pack.html', title: 'The Coarse Salt Warming Bag', desc: 'My grandmother made her salt bag from a worn cotton pillowcase. On winter evenings she warmed the coarse crystals in the kitchen, tested the bundle against her wrist, and carried it to the chair beside the television.', img: 'images/salt-warm-pack.webp', date: '2020-01-01' },
    { url: 'article-winter-melon-tea.html', title: 'Winter Melon Tea on the Autumn Counter', desc: 'The preserved-fruit seller cut a dark slab of winter-melon sugar with a broad knife and wrapped it in waxed paper. I carried the sticky parcel home separately from the tea and grain.', img: 'images/winter-melon-tea.webp', date: '2026-05-25' },
    { url: 'article-yam-millet-porridge.html', title: 'Yam and Millet in the Northern Porridge Pot', desc: 'A northern grain seller split a piece of dried yam to show me its chalky center, then swept yellow millet into a paper bag. At home, the two colors stayed distinct until the breakfast pot began to thicken.', img: 'images/yam-millet-porridge.webp', date: '2026-05-20' },
    { url: 'article-sichuan-peppercorn-foot-soak.html', title: 'Sichuan Peppercorn in the Winter Foot Basin', desc: 'The spice seller recognized the peppercorns I did not want for cooking. She pushed the duller husks into a separate paper twist and told me they still belonged in a winter household.', img: 'images/sichuan-peppercorn-foot-soak.webp', date: '2026-05-20' },
    { url: 'article-sour-jujube-seed-tea.html', title: 'Sour Jujube Seeds at the Bedside', desc: 'The herb-shop assistant crushed a sour-jujube seed beneath a small brass weight, then folded the fragments into paper. I heard the dry shell break above the quieter traffic outside.', img: 'images/sour-jujube-seed-tea.webp', date: '2026-05-20' },
    { url: 'article-post-meal-walk.html', title: 'The Evening Walk After the Meal', desc: 'The post-meal walk begins when bowls are cleared and chairs move back. It is usually slow, social, and close to home: a courtyard circuit, a lane to the corner, or a loop through an apartment compound.', img: 'images/post-meal-walk.webp', date: '2026-05-20' },
    { url: 'article-scallion-white-root.html', title: 'Scallion White in the Early-Cold Kitchen', desc: 'When a wet coat came through the kitchen door, my grandmother set aside the white ends of the scallions she was cutting for dinner. She rinsed the roots, put on a small pot, and moved the dry shoes nearer the chair.', img: 'images/scallion-white-root.webp', date: '2026-05-21' },
    { url: 'article-goji-berry-tea.html', title: 'Goji Berries in the Glass Tea Jar', desc: 'At the dried-fruit counter, the shopkeeper pinched a goji berry open to show me the seeds. I carried the red parcel home beside a glass tea jar, careful not to crush it under the heavier groceries.', img: 'images/goji-berry-tea-cup.jpg', date: '2026-05-21' },
    { url: 'article-moxibustion-home.html', title: 'Moxa Smoke in the Winter Room', desc: 'The herb-shop clerk would not hand over a moxa roll without showing me the ash bowl. She set a ceramic dish on the counter, opened the window behind her, and cleared the paper packets away from the demonstration space.', img: 'images/moxibustion.webp', date: '2026-05-24' },
    { url: 'article-ginger-foot-soak.html', title: 'Ginger in the Winter Foot Basin', desc: 'The woman next door carried her own enamel basin into the corridor on cold evenings. I knew ginger was inside before I saw the slices because the steam brought the kitchen smell through the open doorway.', img: 'images/ginger-foot-soak.jpg', date: '2026-05-24' },
    { url: 'article-morning-warm-water.html', title: 'The First Cup of Warm Water', desc: 'Before the office lights were fully on, the night guard filled his enamel mug from the communal kettle. I stood beside him with my own cup while the first buses moved past the gate.', img: 'images/morning-warm-water.webp', date: '2026-05-30' },
    { url: 'article-rice-water-rinse.html', title: 'Rice Water Between Kitchen and Washroom', desc: 'The downstairs neighbor never poured the first cloudy rice water straight into the drain. I watched her carry the enamel bowl from the kitchen to the courtyard, where several household jobs were waiting for it.', img: 'images/rice-water-rinse.webp', date: '2026-06-09' },
    { url: 'article-bedding-airing.html', title: 'Bedding Across the Courtyard Rail', desc: 'Bedding airing belongs to the clear-weather calendar of the household. Quilts move from beds to rails, cotton is turned and tapped, and the room remains open until the fabric is carried back inside.', img: 'images/bedding-airing.webp', date: '2026-06-09' },
    { url: 'article-post-lunch-pause.html', title: 'The Midday Rest After Lunch', desc: 'The tailor next door lowered his bamboo blind after lunch but never locked the shop. I could still hear the radio behind it while he rested on a narrow bench between the cutting table and the fabric shelves.', img: 'images/post-lunch-pause.webp', date: '2026-06-09' },
    { url: 'article-soap-pods.html', title: 'Soap Pods at the Wash Basin', desc: 'The market vendor cracked a dried soap pod with a short wooden mallet and opened the dark shell toward me. I could see the sticky interior before I understood why these pods once hung beside wash basins.', img: 'images/soap-pods-bowl.webp', date: '2026-06-20' },
    { url: 'article-mung-bean-soup.html', title: 'The Summer Pot of Mung Bean Soup', desc: 'At the neighborhood grain shop, the clerk keeps mung beans in a deep bin near the door. I watch her reject the split, dusty ones before she folds the green beans into a square paper parcel.', img: 'images/mung-bean-soup-bowl.webp', date: '2026-06-20' },
    { url: 'article-chrysanthemum-tea.html', title: 'Chrysanthemum Flowers in the Autumn Teacup', desc: 'The tea seller opened a glass jar and lifted one dried chrysanthemum by its stem. I watched the pale petals loosen over the counter before they ever reached a cup.', img: 'images/chrysanthemum-tea-cup.webp', date: '2026-06-20' },
    { url: 'article-warm-towel-compress.html', title: 'The Warm Towel Folded Over the Eyes', desc: 'At the end of a long sewing afternoon, my aunt folded a warm towel into a narrow rectangle and laid it over her closed eyes. I sat across from her while the machine wheel slowed to a stop.', img: 'images/warm-towel-compress.webp', date: '2026-06-23' },
    { url: 'article-pear-water-night-cough.html', title: 'Snow Pear Water in the Night Kitchen', desc: 'When I was seven, my grandmother heard me coughing from the back room and went to the kitchen without turning on the ceiling light. The pear, the small pot, and the bowl she carried upstairs are the part I remember.', img: 'images/pear-water-night-cough.webp', date: '2026-06-25' },
    { url: 'article-sour-plum-drink.html', title: 'Sour Plum Drink in the Beijing Summer', desc: 'In my grandmother\'s Beijing courtyard, the sour-plum jar lived on the refrigerator door through July. She checked it before breakfast, and my grandfather drank from it standing beside the open door after bicycle work in the lane.', img: 'images/sour-plum-drink.webp', date: '2026-06-27' },
    { url: 'article-bamboo-wife.html', title: 'The Bamboo Wife in the Summer Bed', desc: 'The bamboo wife was a hollow woven bolster placed on a summer bed. Its literary names are unusually elaborate, but the object itself was built for arms, knees, moving air, and a room arranged around humid weather.', img: 'images/bamboo-wife.webp', date: '2026-07-03' },
    { url: 'article-salt-water-gargle.html', title: 'The Salt-Water Glass Beside the Toothbrush', desc: 'At my aunt\'s washbasin, a small glass stood apart from the drinking cups. I knew it by the cloudy salt mark near the base and by the way she rinsed it before putting the toothbrushes back.', img: 'images/salt-water-gargle.webp', date: '2026-07-02' },
    { url: 'article-longan-red-date-tea.html', title: 'Longan and Red Date Tea in the Women\'s Room', desc: 'At a women\'s gathering, I watched the host remove date stones before the cups reached the older guests. The longan shells had already been cleared into a small bowl beside the kettle.', img: 'images/longan-red-date-tea.webp', date: '2026-07-01' },
    { url: 'article-tremella-soup.html', title: 'Tremella Soup and the Long Simmer', desc: 'The dried-goods seller turns a tremella cluster over in her palm and points to its tight folds. I carry the brittle flower home in a paper box; by the time it reaches the pot, it occupies far more room.', img: 'images/tremella-soup.webp', date: '2026-06-29' },
    { url: 'article-ginger-scalp-rub.html', title: 'Fresh Ginger at the Dressing Table', desc: 'My grandmother kept a small knob of ginger beside the soap dish. After washing her hair, she cut a fresh face on it at the bathroom sink and leaned toward the mirror while I stood behind her.', img: 'images/ginger-scalp-rub.webp', date: '2026-06-30' },
    { url: 'article-lotus-root-water.html', title: 'Lotus Root Water: The Pale Summer Sip', desc: 'Lotus root came home from the market with mud in its joints. My grandmother cleaned the holes with a chopstick, cut the best rounds for dinner, and put the small end pieces into a side pot of water.', img: 'images/lotus-root-water.webp', date: '2026-07-06' },
    { url: 'article-mint-cool-cloth.html', title: 'Fresh Mint Cloth by the Summer Door', desc: 'My grandmother kept mint in a cracked clay pot on the kitchen sill. On the hottest afternoons she rubbed the leaves between her palms, lowered a cotton cloth into an enamel basin, and left it by the shaded back door.', img: 'images/mint-cool-cloth.webp', date: '2026-07-07' },
    { url: 'article-black-sesame-walnut-paste.html', title: 'Black Sesame Walnut Paste: The Dark Sweet Bowl', desc: 'At a dried-goods counter, I can hear the sesame before I smell it: seeds running through a metal scoop, walnuts knocking against the scale, and the vendor folding both into paper for the same kitchen bowl.', img: 'images/black-sesame-walnut-paste.webp', date: '2026-07-08' },
    { url: 'article-cassia-seed-pillow.html', title: 'Cassia Seed Pillow: An Old Summer Bedroom Object', desc: 'At the herb stall, the vendor poured cassia seeds into a shallow metal dish and shook it near my ear. The dry rustle explained why this old pillow never behaved like cotton.', img: 'images/cassia-seed-pillow.webp', date: '2026-07-09' },
    { url: 'article-water-chestnut-sugarcane-water.html', title: 'Water Chestnut and Sugarcane in the Summer Pot', desc: 'A neighbor arrived with a dented pot and a length of sugarcane wrapped in newspaper. I cleared the kitchen table while she tipped water chestnuts into the sink and asked for the heavier knife.', img: 'images/water-chestnut-sugarcane-water.webp', date: '2026-07-10' },
    { url: 'article-corn-silk-water.html', title: 'Corn Silk Water at the Edge of the Summer Stove', desc: 'My grandmother saved the clean silk from fresh corn, rinsed it in a white bowl, and kept a small covered pot beside the lunch stove.', img: 'images/corn-silk-water.webp', date: '2026-07-13' },
    { url: 'article-ginger-on-the-belly.html', title: 'Ginger Beneath the Folded Belly Cloth', desc: 'An older neighbor grated fresh ginger into a thin cotton square, folded the cloth inward, and tucked it beneath a loose nightshirt before bed.', img: 'images/ginger-on-the-belly.webp', date: '2026-07-14' },
    { url: 'article-honey-white-radish-water.html', title: 'Honey and White Radish in a Lidded Jar', desc: 'A wet-market seller chose a firm white radish, trimmed its leaves, and wrapped it in newspaper. At home, I set the cut pieces beneath honey in a lidded jar.', img: 'images/honey-white-radish-water.webp', date: '2026-07-15' }
  ];

  function related(first, second, third) {
    return [{ url: first }, { url: second }, { url: third }];
  }

  var sidebarNotes = {
    'article-bamboo-wife.html': related('article-cassia-seed-pillow.html', 'article-bedding-airing.html', 'article-mint-cool-cloth.html'),
    'article-bedding-airing.html': related('article-cassia-seed-pillow.html', 'article-bamboo-wife.html', 'article-post-lunch-pause.html'),
    'article-black-sesame-walnut-paste.html': related('article-rice-congee.html', 'article-tremella-soup.html', 'article-longan-red-date-tea.html'),
    'article-cassia-seed-pillow.html': related('article-bamboo-wife.html', 'article-bedding-airing.html', 'article-sour-jujube-seed-tea.html'),
    'article-chrysanthemum-tea.html': related('article-goji-berry-tea.html', 'article-sour-plum-drink.html', 'article-winter-melon-tea.html'),
    'article-ginger-foot-soak.html': related('article-mugwort-foot-soak.html', 'article-sichuan-peppercorn-foot-soak.html', 'article-salt-warm-pack.html'),
    'article-ginger-scalp-rub.html': related('article-rice-water-rinse.html', 'article-soap-pods.html', 'article-warm-towel-compress.html'),
    'article-ginger-tea.html': related('article-longan-red-date-tea.html', 'article-scallion-white-root.html', 'article-morning-warm-water.html'),
    'article-goji-berry-tea.html': related('article-chrysanthemum-tea.html', 'article-longan-red-date-tea.html', 'article-morning-warm-water.html'),
    'article-longan-red-date-tea.html': related('article-ginger-tea.html', 'article-tremella-soup.html', 'article-black-sesame-walnut-paste.html'),
    'article-lotus-root-water.html': related('article-water-chestnut-sugarcane-water.html', 'article-mung-bean-soup.html', 'article-winter-melon-tea.html'),
    'article-mint-cool-cloth.html': related('article-warm-towel-compress.html', 'article-bamboo-wife.html', 'article-bedding-airing.html'),
    'article-morning-warm-water.html': related('article-goji-berry-tea.html', 'article-salt-water-gargle.html', 'article-post-meal-walk.html'),
    'article-moxibustion-home.html': related('article-mugwort-foot-soak.html', 'article-salt-warm-pack.html', 'article-ginger-foot-soak.html'),
    'article-mugwort-foot-soak.html': related('article-ginger-foot-soak.html', 'article-sichuan-peppercorn-foot-soak.html', 'article-moxibustion-home.html'),
    'article-mung-bean-soup.html': related('article-sour-plum-drink.html', 'article-winter-melon-tea.html', 'article-water-chestnut-sugarcane-water.html'),
    'article-pear-water-night-cough.html': related('article-sour-jujube-seed-tea.html', 'article-tremella-soup.html', 'article-warm-towel-compress.html'),
    'article-post-lunch-pause.html': related('article-post-meal-walk.html', 'article-bedding-airing.html', 'article-warm-towel-compress.html'),
    'article-post-meal-walk.html': related('article-post-lunch-pause.html', 'article-ginger-tea.html', 'article-morning-warm-water.html'),
    'article-rice-congee.html': related('article-yam-millet-porridge.html', 'article-morning-warm-water.html', 'article-mung-bean-soup.html'),
    'article-rice-water-rinse.html': related('article-soap-pods.html', 'article-ginger-scalp-rub.html', 'article-bedding-airing.html'),
    'article-salt-warm-pack.html': related('article-warm-towel-compress.html', 'article-ginger-foot-soak.html', 'article-moxibustion-home.html'),
    'article-salt-water-gargle.html': related('article-morning-warm-water.html', 'article-soap-pods.html', 'article-warm-towel-compress.html'),
    'article-scallion-white-root.html': related('article-ginger-tea.html', 'article-morning-warm-water.html', 'article-ginger-foot-soak.html'),
    'article-sichuan-peppercorn-foot-soak.html': related('article-ginger-foot-soak.html', 'article-mugwort-foot-soak.html', 'article-salt-warm-pack.html'),
    'article-soap-pods.html': related('article-rice-water-rinse.html', 'article-ginger-scalp-rub.html', 'article-bedding-airing.html'),
    'article-sour-jujube-seed-tea.html': related('article-cassia-seed-pillow.html', 'article-warm-towel-compress.html', 'article-pear-water-night-cough.html'),
    'article-sour-plum-drink.html': related('article-mung-bean-soup.html', 'article-winter-melon-tea.html', 'article-water-chestnut-sugarcane-water.html'),
    'article-tremella-soup.html': related('article-pear-water-night-cough.html', 'article-longan-red-date-tea.html', 'article-black-sesame-walnut-paste.html'),
    'article-warm-towel-compress.html': related('article-sour-jujube-seed-tea.html', 'article-cassia-seed-pillow.html', 'article-post-lunch-pause.html'),
    'article-water-chestnut-sugarcane-water.html': related('article-lotus-root-water.html', 'article-sour-plum-drink.html', 'article-mung-bean-soup.html'),
    'article-winter-melon-tea.html': related('article-mung-bean-soup.html', 'article-sour-plum-drink.html', 'article-lotus-root-water.html'),
    'article-yam-millet-porridge.html': related('article-rice-congee.html', 'article-morning-warm-water.html', 'article-black-sesame-walnut-paste.html')
  };

  var objectNotes = {
    'article-water-chestnut-sugarcane-water.html': [
      { title: 'Water chestnuts', desc: 'Brown-skinned market tubers, peeled before they entered the pot.' },
      { title: 'Sugarcane', desc: 'Short green sections cracked open for the water.' }
    ],
    'article-lotus-root-water.html': [
      { title: 'Lotus root', desc: 'A wet-market root cut across its round windows.' },
      { title: 'Side pot', desc: 'The small pot left near other stove work.' }
    ]
  };

  var categoryAnchors = {
    'Warm Foot Soaks': 'foot-soaks',
    'Kitchen Comforts': 'kitchen-foods',
    'Cloth Warmth': 'compresses',
    'Sleep & Calm': 'sleep-calm',
    'Everyday Rituals': 'everyday-rituals',
    'Seasonal Comfort': 'seasonal-comfort'
  };

  function escHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function isArticlePage() {
    return /^article-[^/]+\.html$/.test(path);
  }

  function currentDateString() {
    return new Date().toISOString().split('T')[0];
  }

  function getPublishedArticles() {
    var today = currentDateString();
    return articles.filter(function (a) {
      return a.date <= today;
    });
  }

  function getArticleRecord(url) {
    for (var i = 0; i < articles.length; i++) {
      if (articles[i].url === url) return articles[i];
    }
    return null;
  }

  function shortText(value, max) {
    var text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text.length <= max) return text;
    return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '.';
  }

  function articleSummary(article) {
    return shortText(article && article.desc, 94);
  }

  function currentArticleFilename(fallback) {
    var canonical = document.querySelector('link[rel="canonical"]');
    var value = canonical && canonical.href ? canonical.href : String(fallback || '');
    value = value.split(/[?#]/)[0].replace(/^.*[\\/]/, '');
    if (/^article-[^/]+$/.test(value) && !/\.html$/i.test(value)) value += '.html';
    return value;
  }

  function getArticleCategory() {
    var meta = document.querySelector('meta[property="article:section"]');
    if (meta && meta.content) return meta.content;
    var crumbs = document.querySelectorAll('.breadcrumb a');
    if (crumbs.length > 1) return crumbs[crumbs.length - 1].textContent.trim();
    return 'Archive';
  }

  function formatArticleDate(value) {
    if (!value) return '';
    var parts = value.split('-');
    if (parts.length !== 3) return value;
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var index = parseInt(parts[1], 10) - 1;
    return (months[index] || parts[1]) + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
  }

  function getArticlePublishedDate() {
    var meta = document.querySelector('meta[property="article:published_time"]');
    return meta && meta.content ? meta.content : '';
  }

  function getSidebarNotesFor(page) {
    page = currentArticleFilename(page);
    if (sidebarNotes[page]) {
      return sidebarNotes[page].map(function (note) {
        var article = getArticleRecord(note.url) || note;
        return {
          url: article.url,
          title: article.title,
          desc: articleSummary(article)
        };
      });
    }

    var articleElement = document.querySelector('article[data-related-notes]');
    if (articleElement) {
      return articleElement.getAttribute('data-related-notes').split(',').map(function (url) {
        var article = getArticleRecord(url.trim());
        if (!article) return null;
        return {
          url: article.url,
          title: article.title,
          desc: articleSummary(article)
        };
      }).filter(Boolean);
    }

    return [];
  }

  function getSidebarNoteUrls(page) {
    return getSidebarNotesFor(page).map(function (note) {
      return note.url;
    });
  }

  function isActive(page) {
    return path === page ? ' active' : '';
  }
  function ariaCurrent(page) {
    return path === page ? ' aria-current="page"' : '';
  }

  // ── Disclaimer Banner ──────────────────────────────────────────
  function injectBanner() {
    var el = document.getElementById('site-disclaimer-banner');
    if (!el) return;
    el.innerHTML =
      'This site documents historical Chinese folk customs for cultural interest only. ' +
      'It is not advice of any kind.';
    el.className = 'site-disclaimer-banner';
  }

  // ── Header ─────────────────────────────────────────────────────
  function injectHeader() {
    var el = document.getElementById('site-header');
    if (!el) return;
    var guideHref = path === 'index.html' ? '#subscribe' : '/#subscribe';

    // Only show search on index.html
    var searchHTML = (path === 'index.html' || path === '')
      ? '<div class="search-container">' +
          '<div class="search-form-inline">' +
            '<input type="text" id="search-input" placeholder="Search for customs, items, or traditions…" aria-label="Search this site">' +
            '<button id="search-button">Search</button>' +
          '</div>' +
          '<div id="search-results" class="search-results" aria-live="polite"></div>' +
        '</div>'
      : '';

    el.className = 'site-header';
    el.innerHTML =
      '<div class="container">' +
        '<h1>Folk Calm</h1>' +
        '<p class="subtitle">Old habits from a Sichuan kitchen, written down so I don\'t forget</p>' +
        '<nav class="main-nav" aria-label="Main navigation">' +
          '<button class="nav-toggle" aria-expanded="false" aria-label="Toggle navigation">☰ Menu</button>' +
          '<ul>' +
            '<li><a href="index.html" class="nav-link' + isActive('index.html') + '"' + ariaCurrent('index.html') + '>Home</a></li>' +
            '<li><a href="categories.html" class="nav-link' + isActive('categories.html') + '"' + ariaCurrent('categories.html') + '>Archive</a></li>' +
            '<li><a href="about.html" class="nav-link' + isActive('about.html') + '"' + ariaCurrent('about.html') + '>About</a></li>' +
            '<li><a href="' + guideHref + '" class="nav-link">Free Guide</a></li>' +
            '<li><a href="remedies-guide.html" class="nav-link' + isActive('remedies-guide.html') + '"' + ariaCurrent('remedies-guide.html') + '>Shop</a></li>' +
          '</ul>' +
        '</nav>' +
        searchHTML +
      '</div>';
  }

  // ── Footer ──────────────────────────────────────────────────────
  function injectFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;
    el.className = 'site-footer';
    el.innerHTML =
      '<div class="container">' +
        '<div class="footer-content">' +
          '<div class="footer-section">' +
            '<h4>About This Site</h4>' +
            '<p>This website serves as a digital archive of traditional Chinese household customs and family routines passed down through generations. <a href="about.html">Learn more →</a></p>' +
          '</div>' +
          '<div class="footer-section">' +
            '<h4>Legal & Compliance</h4>' +
            '<ul>' +
              '<li><a href="disclaimer.html">Full Disclaimer</a></li>' +
              '<li><a href="privacy-policy.html">Privacy Policy</a></li>' +
              '<li><a href="affiliate-disclosure.html">Affiliate Disclosure</a></li>' +
              '<li><a href="terms-of-use.html">Terms of Use</a></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="full-disclaimer">' +
          '<h4>Cultural Documentation Notice</h4>' +
          '<p>This website documents historical Chinese folk customs for educational and cultural interest only. All content is based on historical records and oral traditions. It is not personal advice, guidance, or a recommendation for any action. Historical texts reflect ancient worldviews and are not guides for contemporary living.</p>' +
        '</div>' +
        '<div class="affiliate-footer-note">' +
          '<p>If you buy something through certain links, I get a few cents. It doesn\'t change what you pay. I only link to things I\'d use in my own kitchen. <a href="affiliate-disclosure.html">Full disclosure →</a></p>' +
        '</div>' +
        '<div class="copyright">' +
          '<p>&copy; <span id="y"></span> Folk Calm. Written in Chengdu, China.</p>' +
        '</div>' +
      '</div>';

    // Set copyright year
    var ySpan = document.getElementById('y');
    if (ySpan) ySpan.textContent = new Date().getFullYear();
  }

  // ── Email Signup CTA (article pages) ────────────────────────────
  function injectEmailCta() {
    var el = document.getElementById('email-signup-cta');
    if (!el) return;
    el.className = 'email-signup-cta';
    el.innerHTML =
      '<div id="subscribe" class="email-cta-inner">' +
        '<h3>Enjoyed this article? Get our free cultural guide</h3>' +
        '<p>A beautifully designed PDF documenting 10 ancient Chinese evening routines — delivered to your inbox.</p>' +
        '<form id="cta-email-form" class="email-cta-form" action="/subscribe" method="post">' +
          '<input type="email" name="email_address" placeholder="Your email address" required aria-label="Email address">' +
          '<label class="gdpr-consent"><input type="checkbox" required> I agree to receive emails. Unsubscribe anytime. <a href="privacy-policy.html">Privacy Policy</a></label>' +
          '<button type="submit">Send Me the Free Guide</button>' +
        '</form>' +
        '<p class="privacy-note">Your email will only be used to send the cultural guide. No spam, ever.</p>' +
      '</div>';
  }

  // ── Article Layout + Sidebar ────────────────────────────────────
  function enhanceArticlePage() {
    if (!isArticlePage()) return;

    var main = document.getElementById('main') || document.querySelector('main.wrap');
    if (!main) return;
    var article = main.getElementsByTagName('article')[0];
    if (!article || article.parentNode.className === 'article-layout') return;

    main.classList.add('article-page-wrap');

    var section = getArticleCategory();
    var published = getArticlePublishedDate();
    var lead = article.querySelector('.lead');
    if (lead && !article.querySelector('.article-meta')) {
      var metaLine = document.createElement('p');
      metaLine.className = 'article-meta';
      metaLine.textContent = section + (published ? ' · ' + formatArticleDate(published) : '');
      lead.parentNode.insertBefore(metaLine, lead);
    }

    var layout = document.createElement('div');
    layout.className = 'article-layout';
    main.insertBefore(layout, article);
    layout.appendChild(article);

    var currentPage = currentArticleFilename(path);
    var notes = getSidebarNotesFor(currentPage);
    var objects = objectNotes[currentPage] || [];
    var categoryId = categoryAnchors[section];
    var categoryHref = categoryId ? 'categories.html#' + categoryId : 'categories.html';
    var html =
      '<aside class="article-sidebar" aria-label="Article side navigation">' +
        '<section class="sidebar-section">' +
          '<h2>Filed under</h2>' +
          '<a class="sidebar-category" href="' + categoryHref + '">' + escHtml(section) + '</a>' +
        '</section>' +
        '<section class="sidebar-section">' +
          '<h2>Related Notes</h2>' +
          '<div class="sidebar-note-list">';

    notes.forEach(function (note) {
      html +=
        '<a class="sidebar-note" href="' + note.url + '">' +
          '<span class="sidebar-note-title">' + escHtml(note.title) + '</span>' +
          '<span class="sidebar-note-desc">' + escHtml(note.desc) + '</span>' +
        '</a>';
    });
    html += '</div></section>';

    if (objects.length) {
      html +=
        '<section class="sidebar-section">' +
          '<h2>Objects Mentioned</h2>' +
          '<div class="sidebar-object-list">';
      objects.forEach(function (item) {
        html +=
          '<div class="sidebar-object">' +
            '<span class="sidebar-object-title">' + escHtml(item.title) + '</span>' +
            '<span class="sidebar-object-desc">' + escHtml(item.desc) + '</span>' +
          '</div>';
      });
      html += '</div></section>';
    }

    html += '</aside>';
    layout.insertAdjacentHTML('beforeend', html);
  }

  // ── Related Articles ─────────────────────────────────────────────
  function injectRelatedArticles() {
    var el = document.getElementById('related-articles');
    if (!el) return;
    el.className = 'related-articles';

    var today = currentDateString();
    var currentPage = currentArticleFilename(path);
    var sidebarUrls = getSidebarNoteUrls(currentPage);
    var filtered = articles.filter(function (a) {
      if (a.date > today) return false;
      if (a.url === currentPage) return false;
      if (currentPage && a.url === currentPage + '.html') return false;
      if (a.url.replace(/\.html$/, '') === currentPage.replace(/\.html$/, '')) return false;
      if (sidebarUrls.indexOf(a.url) !== -1) return false;
      return true;
    });
    for (var i = filtered.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = filtered[i];
      filtered[i] = filtered[j];
      filtered[j] = tmp;
    }
    filtered = filtered.slice(0, 2);

    var html = '<h3>Continue Reading</h3><div class="related-grid">';
    filtered.forEach(function (a) {
      html +=
        '<a href="' + a.url + '" class="related-card">' +
          '<img src="' + a.img + '" alt="" loading="lazy" width="300" height="200">' +
          '<div class="related-card-text">' +
            '<span class="related-card-title">' + a.title + '</span>' +
            '<span class="related-card-desc">' + a.desc + '</span>' +
          '</div>' +
        '</a>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  // ── Social Share Buttons ─────────────────────────────────────────
  function injectSocialShare() {
    var el = document.getElementById('social-share');
    if (!el) return;
    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);
    el.className = 'social-share';
    el.innerHTML =
      '<span>Share this article:</span>' +
      '<a href="https://twitter.com/intent/tweet?url=' + url + '&text=' + title + '" target="_blank" rel="noopener noreferrer" title="Share on X" class="share-btn share-x">𝕏</a>' +
      '<a href="https://www.facebook.com/sharer/sharer.php?u=' + url + '" target="_blank" rel="noopener noreferrer" title="Share on Facebook" class="share-btn share-fb">f</a>' +
      '<a href="https://www.reddit.com/submit?url=' + url + '&title=' + title + '" target="_blank" rel="noopener noreferrer" title="Share on Reddit" class="share-btn share-reddit">r/</a>' +
      '<a href="https://pinterest.com/pin/create/button/?url=' + url + '&description=' + title + '" target="_blank" rel="noopener noreferrer" title="Save to Pinterest" class="share-btn share-pinterest">P</a>';
  }

  // ── Affiliate Disclosure (before Materials sections) ─────────────
  function injectAffiliateDisclosure() {
    var els = document.querySelectorAll('.affiliate-disclosure-placeholder');
    for (var i = 0; i < els.length; i++) {
      els[i].className = 'affiliate-note';
      els[i].innerHTML = '<strong>Disclosure:</strong> Some links below are affiliate links. If you buy through them, I get a few cents — at no extra cost to you. I only link to things I\'d use in my own kitchen.';
    }
  }

  // ── Performance & SEO Tags ─────────────────────────────────────
  function injectPerformanceTags() {
    if (!document.head) return;

    if (document.getElementById('email-collection-form') || document.getElementById('email-signup-cta')) {
      var pc = document.createElement('link');
      pc.rel = 'preconnect';
      pc.href = 'https://api.resend.com';
      pc.crossOrigin = 'anonymous';
      document.head.appendChild(pc);

      var dns = document.createElement('link');
      dns.rel = 'dns-prefetch';
      dns.href = '//api.resend.com';
      document.head.appendChild(dns);
    }

  }

  // ── Latest Articles (homepage only) ─────────────────────────────
  function injectLatestArticles() {
    var el = document.getElementById('latest-articles');
    if (!el) return;

    var today = new Date().toISOString().split('T')[0];

    var sorted = articles.filter(function (a) {
      return a.date <= today;
    }).sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });

    var html = '';
    if (el.classList.contains('home-latest-list')) {
      sorted.slice(0, 4).forEach(function (a) {
        html += '<a class="home-latest-item" href="' + a.url + '">' +
          '<time datetime="' + a.date + '">' + formatArticleDate(a.date) + '</time>' +
          '<strong>' + escHtml(a.title) + '</strong>' +
          '<span>' + escHtml(articleSummary(a)) + '</span>' +
        '</a>';
      });
    } else {
      html = '<ul>';
      sorted.slice(0, 5).forEach(function (a) {
        html += '<li><a href="' + a.url + '">' + a.title + '</a> &mdash; ' + a.desc + '</li>';
      });
      html += '</ul>';
    }
    el.innerHTML = html;
  }

  // ── Init ─────────────────────────────────────────────────────────
  function injectEditorialHeader() {
    var el = document.getElementById('site-header');
    if (!el) return;

    el.className = 'site-masthead';
    el.innerHTML =
      '<a class="home-brand" href="index.html" aria-label="Folk Calm home">Folk Calm <img class="home-seal-image" src="images/folk-calm-seal.png" alt=""></a>' +
      '<nav class="site-nav" aria-label="Main navigation">' +
        '<a href="categories.html" class="site-nav-link' + isActive('categories.html') + '"' + ariaCurrent('categories.html') + '>Archive</a>' +
        '<a href="index.html#categories" class="site-nav-link">Categories</a>' +
        '<a href="index.html#guides" class="site-nav-link">Guides</a>' +
        '<a href="index.html#objects" class="site-nav-link">Objects</a>' +
        '<a href="about.html" class="site-nav-link' + isActive('about.html') + '"' + ariaCurrent('about.html') + '>About</a>' +
      '</nav>';
  }

  function injectEditorialFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;

    el.className = 'home-footer site-footer-modern';
    el.innerHTML =
      '<div class="home-footer-grid">' +
        '<div>' +
          '<a class="home-brand home-brand-footer" href="index.html">Folk Calm <img class="home-seal-image" src="images/folk-calm-seal.png" alt=""></a>' +
          '<p>A personal record of Chinese household customs, old objects, kitchen habits, and seasonal rooms.</p>' +
        '</div>' +
        '<div>' +
          '<h2>Archive</h2>' +
          '<a href="categories.html#kitchen-foods">Kitchen</a>' +
          '<a href="categories.html#everyday-rituals">Everyday work</a>' +
          '<a href="categories.html#seasonal-comfort">Seasonal rooms</a>' +
        '</div>' +
        '<div>' +
          '<h2>Guides</h2>' +
          '<a href="index.html#guides">Subscriber PDF</a>' +
          '<a href="remedies-guide.html">Paid PDF</a>' +
          '<a href="about.html">About Folk Calm</a>' +
        '</div>' +
        '<div>' +
          '<h2>Site information</h2>' +
          '<a href="disclaimer.html">Cultural notice</a>' +
          '<a href="privacy-policy.html">Privacy</a>' +
          '<a href="terms-of-use.html">Terms</a>' +
          '<a href="affiliate-disclosure.html">Affiliate disclosure</a>' +
        '</div>' +
      '</div>' +
      '<div class="home-footer-base">' +
        '<span>&copy; <span id="site-year"></span> Folk Calm</span>' +
        '<span>Chinese household records</span>' +
      '</div>';

    var ySpan = document.getElementById('site-year');
    if (ySpan) ySpan.textContent = new Date().getFullYear();
  }

  function init() {
    injectPerformanceTags();
    injectBanner();
    injectEditorialHeader();
    injectEditorialFooter();
    injectEmailCta();
    enhanceArticlePage();
    injectRelatedArticles();
    injectLatestArticles();
    injectSocialShare();
    injectAffiliateDisclosure();

    // Re-bind mobile nav toggle
    var navToggle = document.querySelector('.nav-toggle');
    var navUl = document.querySelector('.main-nav ul');
    if (navToggle && navUl) {
      navToggle.addEventListener('click', function () {
        navUl.classList.toggle('open');
        var isOpen = navUl.classList.contains('open');
        this.textContent = isOpen ? '✕ Close' : '☰ Menu';
        this.setAttribute('aria-expanded', isOpen);
      });
    }
  }

  // Run as soon as DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
