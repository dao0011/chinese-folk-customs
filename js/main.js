document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    /* ==========================================================
       1. Search (only on pages that have the search form)
       ========================================================== */
    var searchInput  = document.getElementById('search-input');
    var searchButton = document.getElementById('search-button');
    var searchResults = document.getElementById('search-results');

    if (searchInput && searchButton && searchResults) {
        var sitePages = [
            { title: 'Evening Foot Soak Tradition',             url: 'index.html',                                   keywords: 'foot soak evening basin warm water household practice' },
            { title: 'Dried Mugwort Foot Soak',                  url: 'article-mugwort-foot-soak.html',               keywords: 'mugwort foot soak dried herb bundle steps materials safety' },
            { title: 'Ginger and Date Warm Sip',                 url: 'article-ginger-tea.html',                      keywords: 'ginger tea date warm sip kitchen after dinner' },
            { title: 'Plain Rice Congee',                        url: 'article-rice-congee.html',                     keywords: 'rice congee porridge breakfast comfort bowl kitchen' },
            { title: 'Coarse Salt Warm Pack',                    url: 'article-salt-warm-pack.html',                  keywords: 'compress warm pack cloth salt rice bag household warmth' },
            { title: 'Chinese Yam and Millet Porridge',          url: 'article-yam-millet-porridge.html',             keywords: 'yam millet porridge congee gentle stomach soothing breakfast' },
            { title: 'Sichuan Peppercorn Foot Soak',             url: 'article-sichuan-peppercorn-foot-soak.html',    keywords: 'sichuan peppercorn foot soak cold feet comfort winter warmth' },
            { title: 'Sour Jujube Seed Tea',                     url: 'article-sour-jujube-seed-tea.html',            keywords: 'sour jujube seed tea suan zao ren restful evening bedtime' },
            { title: 'Post-Meal Walk',                           url: 'article-post-meal-walk.html',                  keywords: 'post meal walk after eating daily habit digestion stroll' },
            { title: 'Goji Berry Tea',                           url: 'article-goji-berry-tea.html',                  keywords: 'goji berry tea afternoon cup dried berries kitchen' },
            { title: 'Scallion White Root Tea',                  url: 'article-scallion-white-root.html',             keywords: 'scallion white root tea cong bai ginger kitchen' },
            { title: 'Moxibustion at Home',                      url: 'article-moxibustion-home.html',                keywords: 'moxibustion moxa stick mugwort knees winter warmth' },
            { title: 'Ginger Foot Soak',                         url: 'article-ginger-foot-soak.html',                keywords: 'ginger foot soak cold feet warm basin evening' },
            { title: 'Winter Melon Throat Comfort Tea',          url: 'article-winter-melon-tea.html',                keywords: 'winter melon tea throat comfort rock sugar autumn kitchen' },
            { title: 'Morning Warm Water',                       url: 'article-morning-warm-water.html',           keywords: 'morning warm water kitchen ritual gentle start grandmother routine' },
            { title: 'Rice Water Rinse',                         url: 'article-rice-water-rinse.html',            keywords: 'rice water rinse hair leftover kitchen habit grandmother' },
            { title: 'Bedding Airing Ritual',                    url: 'article-bedding-airing.html',              keywords: 'bedding airing sun dry duvet quilt cotton seasonal sleep habit' },
            { title: 'Post-Lunch Pause',                         url: 'article-post-lunch-pause.html',            keywords: 'post lunch pause midday reset rest afternoon quiet break' },
            { title: 'Soap Pods by the Kitchen Sink',          url: 'article-soap-pods.html',                   keywords: 'soap pods honey locust gleditsia zao jiao natural washing Chinese household traditional cleaning folk custom saponin hair dishes sink' },
            { title: 'Mung Bean Soup for Summer Afternoons',   url: 'article-mung-bean-soup.html',             keywords: 'mung bean soup green bean summer cooling Chinese folk food traditional kitchen seasonal eating heat relief afternoon' },
            { title: 'Chrysanthemum Tea for Autumn Dryness',     url: 'article-chrysanthemum-tea.html',          keywords: 'chrysanthemum tea autumn ritual autumn dryness cooling tea Chinese folk tea seasonal habits traditional beverage zao chrysanthemum flower steam' },
            { title: "A Warm Towel Over the Eyes", url: "article-warm-towel-compress.html", keywords: 'warm towel compress eye rest evening ritual quiet reset hot water grandmother sewing' },
            { title: "When the Cough Wouldn't Stop, Grandma Went to the Kitchen", url: "article-pear-water-night-cough.html", keywords: 'pear water rock sugar night cough Chinese kitchen remedy grandmother folk' },
            { title: "The Pale Fungus That Made a Beauty of Every Woman in the Hutong", url: "article-tremella-soup.html", keywords: 'tremella soup snow fungus white fungus beauty food hutong kitchen collagen' },
            { title: "The Dark Amber Drink That Cooled a Beijing Summer", url: "article-sour-plum-drink.html", keywords: 'sour plum drink suan mei tang smoked plum hawthorn osmanthus summer drink Beijing hutong' },
            { title: "Salt Water Gargle: The Glass by Every Toothbrush", url: "article-salt-water-gargle.html", keywords: 'salt water gargle morning rinse throat cleaning everyday ritual coarse salt grandmother' },
            { title: "Longan Red Date Tea: The Goddess Tea of the Hutong", url: "article-longan-red-date-tea.html", keywords: 'longan red date tea goddess tea hutong kitchen blood nourishment dried longan simmered drink' },
            { title: "The Bamboo Wife — China's Forgotten Summer Cooler", url: "article-bamboo-wife.html", keywords: 'bamboo wife zhu furen bamboo body pillow summer cooling Chinese folk object traditional sleep aid' },
            { title: 'Categories - Folk Habits',                 url: 'categories.html',                              keywords: 'categories kitchen comforts compresses cloth warmth ginger tea' },
            { title: 'About Folk Calm',                          url: 'about.html',                                   keywords: 'about cultural archive mission methodology' },
            { title: 'Disclaimer',                               url: 'disclaimer.html',                              keywords: 'disclaimer legal cultural record boundaries' },
            { title: 'Privacy Policy',                           url: 'privacy-policy.html',                          keywords: 'privacy gdpr ccpa data email policy' },
            { title: 'Affiliate Disclosure',                     url: 'affiliate-disclosure.html',                    keywords: 'affiliate disclosure transparency' },
            { title: 'Terms of Use',                             url: 'terms-of-use.html',                            keywords: 'terms of use legal policy' },
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
