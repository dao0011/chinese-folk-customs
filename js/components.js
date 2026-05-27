/**
 * Folk Calm — Shared Component Injection
 * Injects header, footer, disclaimer banner, and article widgets
 * across all pages. Edit once, update everywhere.
 */
(function () {
  'use strict';

  var path = window.location.pathname.replace(/^.*[\\/]/, '');
  if (!path) path = 'index.html';

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
            '<li><a href="#subscribe" class="nav-link">Free Guide</a></li>' +
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
      '<div class="email-cta-inner">' +
        '<h3>Enjoyed this article? Get our free cultural guide</h3>' +
        '<p>A beautifully designed PDF documenting 10 ancient Chinese evening routines — delivered to your inbox.</p>' +
        '<form id="cta-email-form" class="email-cta-form" action="https://app.convertkit.com/forms/PLACEHOLDER/subscriptions" method="post">' +
          '<input type="email" name="email_address" placeholder="Your email address" required aria-label="Email address">' +
          '<label class="gdpr-consent"><input type="checkbox" required> I agree to receive emails. Unsubscribe anytime. <a href="privacy-policy.html">Privacy Policy</a></label>' +
          '<button type="submit">Send Me the Free Guide</button>' +
        '</form>' +
        '<p class="privacy-note">Your email will only be used to send the cultural guide. No spam, ever.</p>' +
      '</div>';
  }

  // ── Related Articles ─────────────────────────────────────────────
  function injectRelatedArticles() {
    var el = document.getElementById('related-articles');
    if (!el) return;
    el.className = 'related-articles';

    var articles = [
      { url: 'article-mugwort-foot-soak.html', title: 'Dried Mugwort Foot Soak', desc: 'A quiet evening basin ritual from southern Chinese homes.', img: 'images/dried-mugwort-bundle.webp' },
      { url: 'article-ginger-tea.html', title: 'Ginger & Date Warm Sip', desc: 'The most ordinary after-meal moment in Chinese family life.', img: 'images/ginger-tea-cup.webp' },
      { url: 'article-rice-congee.html', title: 'Plain Rice Congee', desc: 'The comfort bowl that travels through every Chinese kitchen.', img: 'images/rice-congee-kitchen.webp' },
      { url: 'article-salt-warm-pack.html', title: 'Coarse Salt Warm Pack', desc: 'Grandmother\'s cloth heat pad — simple warmth from the kitchen.', img: 'images/warm-foot-soak-basin.webp' }
    ];

    // Filter out current page
    var filtered = articles.filter(function (a) { return a.url !== path; });

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

    // Cache-Control meta
    var meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'public, max-age=3600';
    document.head.appendChild(meta);

    // Preconnect to Resend API
    var pc = document.createElement('link');
    pc.rel = 'preconnect';
    pc.href = 'https://api.resend.com';
    pc.crossOrigin = 'anonymous';
    document.head.appendChild(pc);

    // DNS prefetch for Resend
    var dns = document.createElement('link');
    dns.rel = 'dns-prefetch';
    dns.href = '//api.resend.com';
    document.head.appendChild(dns);

    // Preload banner image
    var preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = 'images/tcm-herbs-banner.webp';
    document.head.appendChild(preload);
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    injectPerformanceTags();
    injectBanner();
    injectHeader();
    injectFooter();
    injectEmailCta();
    injectRelatedArticles();
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
