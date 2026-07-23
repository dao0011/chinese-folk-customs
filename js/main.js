document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Publication dates follow Folk Calm's editorial day in Shanghai. If a
    // browser lacks time-zone formatting, fall back to its local calendar day.
    function currentPublishDate() {
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
            // Older browsers use the local date below.
        }

        var now = new Date();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');
        return now.getFullYear() + '-' + month + '-' + day;
    }

    /* ==========================================================
       1. Search (only on pages that have the search form)
       ========================================================== */
    var searchInput  = document.getElementById('search-input');
    var searchButton = document.getElementById('search-button');
    var searchResults = document.getElementById('search-results');

    if (searchInput && searchButton && searchResults) {
        var searchForm = searchInput.closest('form');
        // Site pages come from js/articles-data.js (shared with components.js).
        // articles (with title/url/keywords/date) + staticPages (title/url/keywords).
        var sharedData = (window.FOLK_CALM_DATA && (window.FOLK_CALM_DATA.articles || []).concat(window.FOLK_CALM_DATA.staticPages || [])) || [];
        var sitePages = sharedData.map(function (p) {
            // Only carry fields search actually uses; ignore desc/img carried by articles.
            return {
                title: String(p.title || ''),
                url: String(p.url || ''),
                date: String(p.date || ''),
                keywords: String(p.keywords || '')
            };
        }).filter(function (p) {
            return p.title && p.url;
        });

        function normalise(value) {
            return String(value || '').toLocaleLowerCase('en-US');
        }

        function setResultsVisible(visible) {
            searchResults.hidden = !visible;
            searchInput.setAttribute('aria-expanded', String(visible));
        }

        function appendMessage(message) {
            var messageElement = document.createElement('p');
            messageElement.className = 'no-results';
            messageElement.textContent = message;
            searchResults.appendChild(messageElement);
        }

        function performSearch(query) {
            var trimmedQuery = String(query || '').trim();
            var q = normalise(trimmedQuery);
            searchResults.replaceChildren();

            if (q.length < 2) {
                appendMessage('Enter at least two letters to search the archive.');
                setResultsVisible(true);
                return;
            }

            var today = currentPublishDate();
            var hits = sitePages.filter(function (p) {
                if (p.date && p.date > today) return false;
                return normalise(p.title).indexOf(q) !== -1 || normalise(p.keywords).indexOf(q) !== -1;
            });

            if (hits.length === 0) {
                appendMessage('No results found for "' + trimmedQuery + '". Try foot basin, mugwort, or ginger.');
            } else {
                var summary = document.createElement('p');
                summary.className = 'search-summary';
                summary.textContent = hits.length + (hits.length === 1 ? ' result' : ' results') + ' for "' + trimmedQuery + '"';
                searchResults.appendChild(summary);

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
            setResultsVisible(true);
        }

        function hideResults() {
            setResultsVisible(false);
        }

        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                performSearch(searchInput.value);
            });
        } else {
            searchButton.addEventListener('click', function () {
                performSearch(searchInput.value);
            });
        }

        searchInput.addEventListener('input', function () {
            var query = this.value.trim();
            if (!query) {
                searchResults.replaceChildren();
                hideResults();
            } else if (query.length >= 2) {
                performSearch(query);
            } else {
                searchResults.replaceChildren();
                hideResults();
            }
        });

        searchInput.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                hideResults();
            } else if (event.key === 'ArrowDown' && !searchResults.hidden) {
                var firstResult = searchResults.querySelector('a');
                if (firstResult) {
                    event.preventDefault();
                    firstResult.focus();
                }
            }
        });

        searchResults.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                hideResults();
                searchInput.focus();
                return;
            }
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

            var resultLinks = Array.prototype.slice.call(searchResults.querySelectorAll('a'));
            var currentIndex = resultLinks.indexOf(document.activeElement);
            if (currentIndex === -1) return;

            event.preventDefault();
            var nextIndex = event.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
            if (nextIndex < 0) {
                searchInput.focus();
            } else if (nextIndex >= resultLinks.length) {
                resultLinks[0].focus();
            } else {
                resultLinks[nextIndex].focus();
            }
        });

        document.addEventListener('click', function (e) {
            if (searchForm ? !searchForm.contains(e.target) : (!searchResults.contains(e.target) && e.target !== searchInput && e.target !== searchButton)) {
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
        var today = currentPublishDate();
        if (el.getAttribute('data-publish-date') > today) {
            el.hidden = true;
        }
    });
});
