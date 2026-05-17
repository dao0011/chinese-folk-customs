document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    /* ==========================================================
       1. Mobile hamburger menu (fallback — components.js also binds this)
       ========================================================== */
    var navToggle = document.querySelector('.nav-toggle');
    var navUl = document.querySelector('.main-nav ul');
    if (navToggle && navUl && !navToggle._bound) {
        navToggle._bound = true;
        navToggle.addEventListener('click', function () {
            navUl.classList.toggle('open');
            var isOpen = navUl.classList.contains('open');
            this.textContent = isOpen ? '✕ Close' : '☰ Menu';
            this.setAttribute('aria-expanded', isOpen);
        });
    }

    /* ==========================================================
       2. Search (only on pages that have the search form)
       ========================================================== */
    var searchInput  = document.getElementById('search-input');
    var searchButton = document.getElementById('search-button');
    var searchResults = document.getElementById('search-results');

    if (searchInput && searchButton && searchResults) {
        var sitePages = [
            { title: 'Evening Foot Soak Tradition',     url: 'index.html',                       keywords: 'foot soak evening basin warm water household practice' },
            { title: 'Dried Mugwort Foot Soak',          url: 'article-mugwort-foot-soak.html',   keywords: 'mugwort foot soak dried herb bundle steps materials safety' },
            { title: 'Categories — Folk Habits',         url: 'categories.html',                  keywords: 'categories kitchen comforts compresses cloth warmth ginger tea' },
            { title: 'Disclaimer',                       url: 'disclaimer.html',                  keywords: 'disclaimer legal cultural record boundaries' },
            { title: 'Ginger Tea Preparation',           url: 'article-ginger-tea.html',          keywords: 'ginger tea cup warm sip kitchen' },
            { title: 'Cloth Warmth — Household Compresses', url: 'article-salt-warm-pack.html',  keywords: 'compress warm pack cloth salt rice bag' },
            { title: 'Plain Rice Congee',                url: 'article-rice-congee.html',         keywords: 'rice congee porridge breakfast comfort bowl' },
            { title: 'About Folk Calm',                  url: 'about.html',                       keywords: 'about cultural archive mission methodology' },
            { title: 'Privacy Policy',                   url: 'privacy-policy.html',              keywords: 'privacy gdpr ccpa data email policy' },
            { title: 'Affiliate Disclosure',             url: 'affiliate-disclosure.html',        keywords: 'affiliate amazon disclosure transparency' },
        ];

        function performSearch(query) {
            var q = query.toLowerCase().trim();
            if (q.length < 2) { hideResults(); return; }

            var hits = sitePages.filter(function (p) {
                return p.title.toLowerCase().indexOf(q) !== -1 || p.keywords.indexOf(q) !== -1;
            });

            searchResults.innerHTML = '';
            if (hits.length === 0) {
                var noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'no-results';
                noResultsDiv.textContent = 'No results found for "' + escHtml(query) + '". Try: foot soak, mugwort, ginger tea.';
                noResultsDiv.style.cssText = 'padding:12px;color:#666;font-size:0.9rem;';
                searchResults.appendChild(noResultsDiv);
            } else {
                hits.forEach(function (h) {
                    var link = document.createElement('a');
                    link.href = h.url;
                    var titleSpan = document.createElement('span');
                    titleSpan.className = 'search-title';
                    titleSpan.textContent = h.title;
                    link.appendChild(titleSpan);
                    searchResults.appendChild(link);
                });
            }
            searchResults.style.display = 'block';
        }

        function hideResults() {
            searchResults.style.display = 'none';
        }

        function escHtml(s) {
            var div = document.createElement('div');
            div.textContent = s;
            return div.textContent;
        }

        searchButton.addEventListener('click', function () {
            performSearch(searchInput.value);
        });

        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') performSearch(this.value);
        });

        document.addEventListener('click', function (e) {
            if (!searchResults.contains(e.target) && e.target !== searchInput && e.target !== searchButton) {
                hideResults();
            }
        });
    }

    /* ==========================================================
       3. Pinterest Save Button on article images
       ========================================================== */
    var articleImages = document.querySelectorAll('.article-image img, .custom-image img, .category-image img');
    if (articleImages.length > 0) {
        var pageUrl = encodeURIComponent(window.location.href);
        var pageTitle = encodeURIComponent(document.title);

        articleImages.forEach(function (img) {
            var wrapper = img.parentElement;
            if (!wrapper || wrapper.querySelector('.pinterest-save')) return;

            var pinBtn = document.createElement('a');
            pinBtn.className = 'pinterest-save';
            pinBtn.href = 'https://pinterest.com/pin/create/button/?url=' + pageUrl + '&media=' + encodeURIComponent(img.src) + '&description=' + pageTitle;
            pinBtn.target = '_blank';
            pinBtn.rel = 'noopener noreferrer';
            pinBtn.title = 'Save to Pinterest';
            pinBtn.setAttribute('aria-label', 'Save this image to Pinterest');
            pinBtn.textContent = 'Pin';
            wrapper.style.position = 'relative';
            wrapper.appendChild(pinBtn);
        });
    }

    /* ==========================================================
       4. Smooth scroll for anchor links
       ========================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var id = this.getAttribute('href');
            if (id === '#') return;
            var el = document.querySelector(id);
            if (el) {
                e.preventDefault();
                window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });
});
