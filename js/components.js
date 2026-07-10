/**
 * Folk Calm — Shared Component Injection
 * Injects header, footer, disclaimer banner, and article widgets
 * across all pages. Edit once, update everywhere.
 */
(function () {
  'use strict';

  var path = window.location.pathname.replace(/^.*[\\/]/, '');
  if (!path) path = 'index.html';

  // 文章元数据（共享数据源，Related Articles + Latest Articles 共用）
  var articles = [
    { url: 'article-mugwort-foot-soak.html', title: 'Dried Mugwort Foot Soak', desc: 'A quiet evening basin ritual from southern Chinese homes.', img: 'images/warm-foot-soak-basin.webp', date: '2026-05-17' },
    { url: 'article-ginger-tea.html', title: 'Ginger & Date Warm Sip', desc: 'The most ordinary after-meal moment in Chinese family life.', img: 'images/ginger-date-tea.webp', date: '2026-05-17' },
    { url: 'article-rice-congee.html', title: 'Plain Rice Congee', desc: 'The comfort bowl that travels through every Chinese kitchen.', img: 'images/rice-congee-kitchen.webp', date: '2026-05-17' },
    { url: 'article-salt-warm-pack.html', title: 'Coarse Salt Warm Pack', desc: 'Grandmother\'s cloth heat pad — simple warmth from the kitchen.', img: 'images/salt-warm-pack.webp', date: '2026-05-17' },
    { url: 'article-winter-melon-tea.html', title: 'Winter Melon Throat Comfort Tea', desc: 'Every autumn my grandmother simmered winter melon with rock sugar — a slow ritual for throat comfort.', img: 'images/winter-melon-tea.webp', date: '2026-05-25' },
    { url: 'article-yam-millet-porridge.html', title: 'Chinese Yam and Millet Porridge', desc: 'A gentle stomach-soothing bowl from northern China.', img: 'images/yam-millet-porridge.webp', date: '2026-05-20' },
    { url: 'article-sichuan-peppercorn-foot-soak.html', title: 'Sichuan Peppercorn Foot Soak', desc: 'Warmth for cold days from the Sichuan kitchen.', img: 'images/sichuan-peppercorn-foot-soak.webp', date: '2026-05-20' },
    { url: 'article-sour-jujube-seed-tea.html', title: 'Sour Jujube Seed Tea', desc: 'A quiet cup before sleep — toasted seeds steeped in hot water.', img: 'images/sour-jujube-seed-tea.webp', date: '2026-05-20' },
    { url: 'article-post-meal-walk.html', title: 'Post-Meal Walk', desc: 'A hundred paces after a meal — an old Chinese daily habit.', img: 'images/post-meal-walk.webp', date: '2026-05-20' },
    { url: 'article-scallion-white-root.html', title: 'Scallion White Root Tea', desc: 'What my grandmother reached for when a cold was coming.', img: 'images/scallion-white-root.webp', date: '2026-05-21' },
    { url: 'article-goji-berry-tea.html', title: 'Goji Berry Tea', desc: 'The cup my grandmother poured for tired eyes every afternoon.', img: 'images/goji-berry-tea-cup.jpg', date: '2026-05-21' },
    { url: 'article-moxibustion-home.html', title: 'Moxibustion at Home', desc: 'Warming the knees with mugwort warmth on winter evenings.', img: 'images/moxibustion.webp', date: '2026-05-24' },
    { url: 'article-ginger-foot-soak.html', title: 'Ginger Foot Soak for Cold Feet Comfort', desc: 'Old ginger in hot water until her feet glowed pink.', img: 'images/ginger-foot-soak.jpg', date: '2026-05-24' },
    { url: 'article-morning-warm-water.html', title: 'Morning Warm Water', desc: 'The first kitchen ritual — a cup of warm water before anything else.', img: 'images/morning-warm-water.webp', date: '2026-05-30' },
    { url: 'article-rice-water-rinse.html', title: 'Rice Water Rinse', desc: 'The milky water left from washing rice, saved in a chipped jar on the bathroom shelf.', img: 'images/rice-water-rinse.webp', date: '2026-06-09' },
    { url: 'article-bedding-airing.html', title: 'Bedding Airing Ritual', desc: 'Carrying the quilts outside on a clear morning to catch the smell of the sun.', img: 'images/bedding-airing.webp', date: '2026-06-09' },
    { url: 'article-post-lunch-pause.html', title: 'Post-Lunch Pause', desc: 'Twenty minutes of quiet after lunch — not a nap, just letting the meal settle.', img: 'images/post-lunch-pause.webp', date: '2026-06-09' },
    { url: 'article-soap-pods.html', title: 'Soap Pods by the Kitchen Sink', desc: 'A broken piece of dried honey locust pod steeped in water made the foam that washed everything.', img: 'images/soap-pods-bowl.webp', date: '2026-06-20' },
    { url: 'article-mung-bean-soup.html', title: 'Mung Bean Soup for Summer Afternoons', desc: 'Unsweetened, cooked until the beans split open, then left to cool. She\'d drink it standing up.', img: 'images/mung-bean-soup-bowl.webp', date: '2026-06-20' },
    { url: 'article-chrysanthemum-tea.html', title: 'Chrysanthemum Tea for Autumn Dryness', desc: 'One flower steeped all day. She held the cup in both hands and let the warmth rise into her skin.', img: 'images/chrysanthemum-tea-cup.webp', date: '2026-06-20' },
    { url: 'article-warm-towel-compress.html', title: 'Warm Towel Eye Compress', desc: 'A warm towel over closed eyes at the end of a long day — the five-minute reset.', img: 'images/warm-towel-compress.webp', date: '2026-06-23' },
    { url: 'article-pear-water-night-cough.html', title: 'When the Cough Wouldn\'t Stop, Grandma Went to the Kitchen', desc: 'A pear, a few pieces of rock sugar, and water — the simplest answer from a Chinese kitchen.', img: 'images/pear-water-night-cough.webp', date: '2026-06-25' },
    { url: 'article-sour-plum-drink.html', title: 'The Dark Amber Drink That Cooled a Beijing Summer', desc: 'Smoked dark plums, hawthorn, tangerine peel, osmanthus — the jar every hutong household kept on the fridge door from June to August.', img: 'images/sour-plum-drink.webp', date: '2026-06-27' },
    { url: 'article-bamboo-wife.html', title: 'The Bamboo Wife: China\'s Forgotten Summer Cooler', desc: 'A hollow cylinder of woven bamboo, hugged through the hottest nights — a thousand-year-old object China forgot.', img: 'images/bamboo-wife.webp', date: '2026-07-03' },
    { url: 'article-salt-water-gargle.html', title: 'Salt Water Gargle: The Glass by Every Toothbrush', desc: 'Half a glass of warm water, a pinch of coarse salt — the morning gargle passed down through three generations.', img: 'images/salt-water-gargle.webp', date: '2026-07-02' },
    { url: 'article-longan-red-date-tea.html', title: 'Longan Red Date Tea: The Goddess Tea of the Hutong', desc: 'Dried longan and red dates simmered into deep red water — the pot my grandmother carried door to door.', img: 'images/longan-red-date-tea.webp', date: '2026-07-01' },
    { url: 'article-tremella-soup.html', title: 'The Pale Fungus That Made a Beauty of Every Woman in the Hutong', desc: 'A dried knot of white fungus, soaked four hours and simmered until the water turned to silk.', img: 'images/tremella-soup.webp', date: '2026-06-29' },
    { url: 'article-ginger-scalp-rub.html', title: 'Ginger on the Scalp', desc: 'Every Sunday, a fresh-cut knob of ginger rubbed into the hairline. She said it woke the roots up.', img: 'images/ginger-scalp-rub.webp', date: '2026-06-30' },
    { url: 'article-lotus-root-water.html', title: 'Lotus Root Water', desc: 'A few lotus root slices warmed in a side pot - a plain summer kitchen habit remembered through household behavior.', img: 'images/lotus-root-water.webp', date: '2026-07-06' },
    { url: 'article-mint-cool-cloth.html', title: 'Fresh Mint Cloth', desc: 'Mint leaves, cool water, and a folded cotton cloth kept near the back door on hot afternoons.', img: 'images/mint-cool-cloth.webp', date: '2026-07-07' },
    { url: 'article-black-sesame-walnut-paste.html', title: 'Black Sesame Walnut Paste', desc: 'Black sesame, walnuts, and a stone mortar - the dark sweet bowl my grandmother made on damp days.', img: 'images/black-sesame-walnut-paste.webp', date: '2026-07-08' },
    { url: 'article-cassia-seed-pillow.html', title: 'Cassia Seed Pillow', desc: 'Cassia seeds inside a cotton cover - the firm summer pillow my grandmother kept beside the bamboo mat.', img: 'images/cassia-seed-pillow.webp', date: '2026-07-09' },
    { url: 'article-water-chestnut-sugarcane-water.html', title: 'Water Chestnut Sugarcane Water', desc: 'Water chestnuts, sugarcane, and a pale summer drink from southern Chinese kitchens.', img: 'images/water-chestnut-sugarcane-water.webp', date: '2026-07-10' }
  ];

  var sidebarNotes = {
    'article-water-chestnut-sugarcane-water.html': [
      { url: 'article-sour-plum-drink.html', title: 'Sour Plum Drink', desc: 'A darker summer drink kept in jars and poured cold.' },
      { url: 'article-mung-bean-soup.html', title: 'Mung Bean Soup', desc: 'Beans cooked until split, then left on the kitchen side.' },
      { url: 'article-winter-melon-tea.html', title: 'Winter Melon Tea', desc: 'Another pale summer pot from the kitchen table.' }
    ],
    'article-lotus-root-water.html': [
      { url: 'article-mung-bean-soup.html', title: 'Mung Bean Soup', desc: 'A summer pot left to cool beside other kitchen work.' },
      { url: 'article-winter-melon-tea.html', title: 'Winter Melon Tea', desc: 'A light kitchen drink built around a market vegetable.' },
      { url: 'article-sour-plum-drink.html', title: 'Sour Plum Drink', desc: 'A darker summer jar with a shopfront history.' }
    ]
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
    if (sidebarNotes[page]) return sidebarNotes[page];

    var fallback = getPublishedArticles().filter(function (a) {
      return a.url !== page;
    }).sort(function (a, b) {
      return b.date.localeCompare(a.date);
    }).slice(0, 3);

    return fallback.map(function (a) {
      return {
        url: a.url,
        title: a.title,
        desc: shortText(a.desc, 82)
      };
    });
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
            '<li><a href="/" class="nav-link' + isActive('index.html') + '"' + ariaCurrent('index.html') + '>Home</a></li>' +
            '<li><a href="categories.html" class="nav-link' + isActive('categories.html') + '"' + ariaCurrent('categories.html') + '>All Remedies</a></li>' +
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

    var notes = getSidebarNotesFor(path);
    var objects = objectNotes[path] || [];
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
    var sidebarUrls = getSidebarNoteUrls(path);
    var filtered = articles.filter(function (a) {
      if (a.date > today) return false;
      if (a.url === path) return false;
      if (path && a.url === path + '.html') return false;
      if (a.url.replace(/\.html$/, '') === path.replace(/\.html$/, '')) return false;
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
    }).slice(0, 5);

    var html = '<ul>';
    sorted.forEach(function (a) {
      html += '<li><a href="' + a.url + '">' + a.title + '</a> &mdash; ' + a.desc + '</li>';
    });
    html += '</ul>';
    el.innerHTML = html;
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    injectPerformanceTags();
    injectBanner();
    injectHeader();
    injectFooter();
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
