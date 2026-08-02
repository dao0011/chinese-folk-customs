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

  // Article metadata is loaded from js/articles-data.js (shared with main.js search).
  // That script runs before components.js (both use `defer`, which preserves order).
  var articles = (window.FOLK_CALM_DATA && window.FOLK_CALM_DATA.articles) || [];

  function related(first, second, third) {
    return [first, second, third];
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
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date());
      var date = {};
      parts.forEach(function (part) {
        if (part.type !== 'literal') date[part.type] = part.value;
      });
      if (date.year && date.month && date.day) {
        return date.year + '-' + date.month + '-' + date.day;
      }
    } catch (error) {
      // Older browsers use the local calendar day below.
    }

    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return now.getFullYear() + '-' + month + '-' + day;
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
      return sidebarNotes[page].map(function (url) {
        var article = getArticleRecord(url) || { url: url };
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

  // ── Latest Articles (homepage only) ─────────────────────────────
  function injectLatestArticles() {
    var el = document.getElementById('latest-articles');
    if (!el) return;

    var today = currentDateString();

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
    injectBanner();
    injectEditorialHeader();
    injectEditorialFooter();
    injectEmailCta();
    enhanceArticlePage();
    injectRelatedArticles();
    injectLatestArticles();
    injectSocialShare();
    injectAffiliateDisclosure();

  }

  // Run as soon as DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
