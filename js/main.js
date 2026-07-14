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
            { title: 'Dried Mugwort and the Evening Foot Basin',               url: 'article-mugwort-foot-soak.html',               keywords: 'dried mugwort, Chinese household custom, evening foot basin, Dragon Boat Festival, Folk Calm' },
            { title: 'Ginger and Red Dates After Dinner',                 url: 'article-ginger-tea.html',                      keywords: 'ginger red date drink, Chinese after dinner custom, kitchen tea history, Folk Calm' },
            { title: 'Plain Rice Congee and the Everyday Pot',                  url: 'article-rice-congee.html',                     keywords: 'plain rice congee, Chinese household food, rice porridge history, everyday kitchen, Folk Calm' },
            { title: 'The Coarse Salt Warming Bag',                    url: 'article-salt-warm-pack.html',                  keywords: 'coarse salt bag, Chinese household warmth, cloth warming custom, winter home object, Folk Calm' },
            { title: 'Yam and Millet in the Northern Porridge Pot',          url: 'article-yam-millet-porridge.html',             keywords: 'yam millet porridge, northern Chinese breakfast, Chinese yam food history, Folk Calm' },
            { title: 'Sichuan Peppercorn in the Winter Foot Basin',             url: 'article-sichuan-peppercorn-foot-soak.html',    keywords: 'Sichuan peppercorn foot basin, Chinese winter custom, warm water household practice, Folk Calm' },
            { title: 'Sour Jujube Seeds at the Bedside',                     url: 'article-sour-jujube-seed-tea.html',            keywords: 'sour jujube seed history, suan zao ren, Chinese evening cup, household record, Folk Calm' },
            { title: 'The Evening Walk After the Meal',                           url: 'article-post-meal-walk.html',                  keywords: 'Chinese post meal walk, evening courtyard custom, household daily rhythm, Folk Calm' },
            { title: 'Goji Berries in the Glass Tea Jar',                           url: 'article-goji-berry-tea.html',                  keywords: 'goji berry tea history, Chinese glass tea jar, dried goji household use, Folk Calm' },
            { title: 'Fresh Ginger at the Dressing Table',                         url: 'article-ginger-scalp-rub.html',                keywords: 'ginger scalp custom, Chinese grooming history, dressing table objects, Folk Calm' },
            { title: 'Scallion White in the Early-Cold Kitchen',                  url: 'article-scallion-white-root.html',             keywords: 'scallion white drink, Chinese kitchen custom, spring onion root, ginger household drink, Folk Calm' },
            { title: 'Moxa Smoke in the Winter Room',                      url: 'article-moxibustion-home.html',                keywords: 'moxa stick history, Chinese household custom, mugwort smoke, winter room, Folk Calm' },
            { title: 'Ginger in the Winter Foot Basin',                         url: 'article-ginger-foot-soak.html',                keywords: 'ginger foot basin, Chinese winter household custom, warm water practice, Folk Calm' },
            { title: 'Winter Melon Tea on the Autumn Counter',          url: 'article-winter-melon-tea.html',                keywords: 'winter melon tea history, dong gua cha, Chinese autumn drink, household kitchen record, Folk Calm' },
            { title: 'The First Cup of Warm Water',                       url: 'article-morning-warm-water.html',           keywords: 'morning warm water custom, Chinese kitchen thermos, enamel cup, daily household record, Folk Calm' },
            { title: 'Rice Water Between Kitchen and Washroom',                         url: 'article-rice-water-rinse.html',            keywords: 'rice water rinse history, Chinese household reuse, kitchen water custom, hair washing record, Folk Calm' },
            { title: 'Bedding Across the Courtyard Rail',                    url: 'article-bedding-airing.html',              keywords: 'Chinese bedding airing, quilt sunning custom, bamboo beater, household laundry history, Folk Calm' },
            { title: 'The Midday Rest After Lunch',                         url: 'article-post-lunch-pause.html',            keywords: 'Chinese midday rest, post lunch pause, xie shang, household daily rhythm, Folk Calm' },
            { title: 'Soap Pods at the Wash Basin',          url: 'article-soap-pods.html',                   keywords: 'Chinese soap pods, zao jiao history, Gleditsia sinensis, household washing custom, Folk Calm' },
            { title: 'The Summer Pot of Mung Bean Soup',   url: 'article-mung-bean-soup.html',             keywords: 'mung bean soup history, Chinese summer food, green bean soup, household kitchen record, Folk Calm' },
            { title: 'Chrysanthemum Flowers in the Autumn Teacup',     url: 'article-chrysanthemum-tea.html',          keywords: 'chrysanthemum tea history, Chinese autumn drink, dried flower tea, household tea custom, Folk Calm' },
            { title: 'The Warm Towel Folded Over the Eyes', url: "article-warm-towel-compress.html", keywords: 'warm eye towel custom, Chinese evening household habit, cotton cloth warmth, Folk Calm' },
            { title: 'Snow Pear Water in the Night Kitchen', url: "article-pear-water-night-cough.html", keywords: 'snow pear water, Chinese kitchen custom, rock sugar pear, night kitchen, Folk Calm' },
            { title: 'Tremella Soup and the Long Simmer', url: "article-tremella-soup.html", keywords: 'tremella soup history, snow fungus dessert, Chinese sweet soup, household kitchen record, Folk Calm' },
            { title: 'Sour Plum Drink in the Beijing Summer', url: "article-sour-plum-drink.html", keywords: 'sour plum drink history, suan mei tang, Beijing summer drink, Chinese household record, Folk Calm' },
            { title: 'The Salt-Water Glass Beside the Toothbrush', url: "article-salt-water-gargle.html", keywords: 'salt water gargle custom, Chinese morning routine, household washing record, Folk Calm' },
            { title: 'Longan and Red Date Tea in the Women\'s Room', url: "article-longan-red-date-tea.html", keywords: 'longan red date tea, Chinese women\'s household drink, dried fruit tea history, Folk Calm' },
            { title: 'The Bamboo Wife in the Summer Bed', url: "article-bamboo-wife.html", keywords: 'bamboo wife history, Chinese summer bedding, bamboo bolster, household object, Folk Calm' },
            { title: 'Lotus Root Water: The Pale Summer Sip', url: 'article-lotus-root-water.html', date: '2026-07-06', keywords: 'lotus root water, Chinese summer kitchen, lotus root drink history, household food record, Folk Calm' },
            { title: 'Fresh Mint Cloth by the Summer Door', url: 'article-mint-cool-cloth.html', date: '2026-07-07', keywords: 'fresh mint cloth, Chinese summer household, cool basin custom, potted mint, Folk Calm' },
            { title: 'Black Sesame Walnut Paste: The Dark Sweet Bowl', url: 'article-black-sesame-walnut-paste.html', date: '2026-07-08', keywords: 'black sesame walnut paste, Chinese sweet bowl, stone mortar kitchen, household food record, Folk Calm' },
            { title: 'Cassia Seed Pillow: An Old Summer Bedroom Object', url: 'article-cassia-seed-pillow.html', date: '2026-07-09', keywords: 'cassia seed pillow, Chinese summer bedroom, jue ming zi pillow, household object, Folk Calm' },
            { title: 'Water Chestnut and Sugarcane in the Summer Pot', url: 'article-water-chestnut-sugarcane-water.html', date: '2026-07-10', keywords: 'water chestnut sugarcane water, southern Chinese summer drink, household kitchen record, Folk Calm' },
            { title: 'Corn Silk Water at the Edge of the Summer Stove', url: 'article-corn-silk-water.html', date: '2026-07-13', keywords: 'corn silk water, Chinese summer kitchen, fresh corn custom, household food record, Folk Calm' },
            { title: 'Ginger Beneath the Folded Belly Cloth', url: 'article-ginger-on-the-belly.html', date: '2026-07-14', keywords: 'ginger belly cloth, Chinese warmth custom, cotton kitchen square, household record, Folk Calm' },
            { title: 'Honey and White Radish in a Lidded Jar', url: 'article-honey-white-radish-water.html', date: '2026-07-15', keywords: 'honey white radish water, Chinese kitchen jar, market vegetable custom, household record, Folk Calm' },
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

            var today = new Date().toISOString().split('T')[0];
            var hits = sitePages.filter(function (p) {
                if (p.date && p.date > today) return false;
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
        var today = new Date().toISOString().split('T')[0];
        if (el.getAttribute('data-publish-date') > today) {
            el.hidden = true;
        }
    });
});
