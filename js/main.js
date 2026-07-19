document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    /* ==========================================================
       1. Search (only on pages that have the search form)
       ========================================================== */
    var searchInput  = document.getElementById('search-input');
    var searchButton = document.getElementById('search-button');
    var searchResults = document.getElementById('search-results');

    if (searchInput && searchButton && searchResults) {
        // Site pages come from js/articles-data.js (shared with components.js).
        // articles (with title/url/keywords/date) + staticPages (title/url/keywords).
        var sharedData = (window.FOLK_CALM_DATA && (window.FOLK_CALM_DATA.articles || []).concat(window.FOLK_CALM_DATA.staticPages || [])) || [];
        var sitePages = sharedData.map(function (p) {
            // Only carry fields search actually uses; ignore desc/img carried by articles.
            return { title: p.title, url: p.url, date: p.date, keywords: p.keywords || '' };
        });

        function performSearch(query) {
            var q = query.toLowerCase().trim();
            if (q.length < 2) { hideResults(); return; }

            var today = new Date().toLocaleDateString('en-CA');
            var hits = sitePages.filter(function (p) {
                if (p.date && p.date > today) return false;
                return p.title.toLowerCase().indexOf(q) !== -1 || p.keywords.indexOf(q) !== -1;
            });

            searchResults.innerHTML = '';
            if (hits.length === 0) {
                var noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'no-results';
                noResultsDiv.textContent = 'No results found for "' + query + '". Try: foot soak, mugwort, ginger tea.';
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
            var pinMedia = img.getAttribute('data-pin-media') || img.src;
            pinBtn.href = 'https://pinterest.com/pin/create/button/?url=' + pageUrl + '&media=' + encodeURIComponent(pinMedia) + '&description=' + pageTitle;
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

    document.querySelectorAll('[data-publish-date]').forEach(function (el) {
        var today = new Date().toLocaleDateString('en-CA');
        if (el.getAttribute('data-publish-date') > today) {
            el.hidden = true;
        }
    });
});
