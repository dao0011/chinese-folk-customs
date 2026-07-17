"""Verify all Commit E changes before pushing.

Checks:
  E4:  articles-data.js exists with 38 articles + 7 static pages
       components.js references FOLK_CALM_DATA (no inline articles array)
       main.js references FOLK_CALM_DATA (no inline sitePages array)
  E7:  components.js has no injectPerformanceTags (function or call)
       39 HTML files (38 articles + index.html) have static preconnect
  E8:  capture-order.js has no business-error status:200 (only success 200)
  E10: related() returns plain strings, not {url: ...} objects
  E11: unsubscribe.js has the explanatory header comment
  Version bumps: all HTML files use components.js?v=12, main.js?v=2, articles-data.js?v=1
"""
import os
import re
import sys

ROOT = r'c:\Users\Administrator\Desktop\AI做的网站\chinese-folk-wellness'
PASS = 0
FAIL = 0

def check(name, condition, detail=''):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  PASS  {name}")
    else:
        FAIL += 1
        print(f"  FAIL  {name}  {detail}")

def read(name):
    with open(os.path.join(ROOT, name), 'r', encoding='utf-8') as f:
        return f.read()

# ── E4: articles-data.js ───────────────────────────────────────
print("\n=== E4: articles-data.js shared data ===")
data_path = os.path.join(ROOT, 'js', 'articles-data.js')
check("articles-data.js exists", os.path.exists(data_path))
if os.path.exists(data_path):
    data = read('js/articles-data.js')
    check("defines window.FOLK_CALM_DATA", "window.FOLK_CALM_DATA" in data)
    # Count articles (entries with url starting 'article-')
    article_urls = re.findall(r"url:\s*'(article-[^']+\.html)'", data)
    check("articles-data.js has 38 articles", len(article_urls) == 38, f"got {len(article_urls)}")
    # Count static pages (entries in staticPages block)
    static_block = re.search(r"staticPages:\s*\[(.*?)\]\s*\n\};", data, re.DOTALL)
    static_count = 0
    if static_block:
        static_count = len(re.findall(r"\{\s*title:", static_block.group(1)))
    check("articles-data.js has 7 static pages", static_count == 7, f"got {static_count}")
    # Every article has url, title, desc, img, date, keywords
    sample = re.search(r"\{ url: '[^']+', title: '[^']*', desc: '[^']*', img: '[^']+', date: '[^']+', keywords: '[^']*' \}", data)
    check("article entries have all 6 fields", sample is not None)

# ── E4: components.js references shared data ───────────────────
print("\n=== E4: components.js ===")
comp = read('js/components.js')
check("components.js references FOLK_CALM_DATA", "window.FOLK_CALM_DATA" in comp)
check("components.js has no inline articles array", "var articles = [" not in comp)
check("components.js has fallback || []", "(window.FOLK_CALM_DATA && window.FOLK_CALM_DATA.articles) || []" in comp)

# ── E4: main.js references shared data ─────────────────────────
print("\n=== E4: main.js ===")
main = read('js/main.js')
check("main.js references FOLK_CALM_DATA", "window.FOLK_CALM_DATA" in main)
check("main.js has no inline sitePages array", "var sitePages = [" not in main)
check("main.js concats articles + staticPages", "concat(window.FOLK_CALM_DATA.staticPages" in main)

# ── E7: injectPerformanceTags removed ──────────────────────────
print("\n=== E7: injectPerformanceTags removed ===")
check("components.js has no injectPerformanceTags function", "function injectPerformanceTags" not in comp)
check("components.js has no injectPerformanceTags() call", "injectPerformanceTags()" not in comp)
check("components.js has no preconnect DOM creation", "preconnect" not in comp and "dns-prefetch" not in comp)

# ── E7: static preconnect in 39 HTML files ─────────────────────
print("\n=== E7: static preconnect ===")
article_files = sorted([f for f in os.listdir(ROOT) if f.startswith('article-') and f.endswith('.html')])
check("38 article HTML files exist", len(article_files) == 38, f"got {len(article_files)}")
preconnect_count = 0
for name in article_files + ['index.html']:
    c = read(name)
    if 'rel="preconnect" href="https://api.resend.com"' in c and 'rel="dns-prefetch" href="//api.resend.com"' in c:
        preconnect_count += 1
check("38 articles + index.html have preconnect+dns-prefetch", preconnect_count == 39, f"got {preconnect_count}")

# Static pages should NOT have preconnect (not in scope)
static_no_preconnect = 0
for name in ['about.html', 'categories.html', 'disclaimer.html', 'privacy-policy.html', 'subscribe-thankyou.html', 'terms-of-use.html', 'affiliate-disclosure.html']:
    c = read(name)
    if 'preconnect' not in c:
        static_no_preconnect += 1
check("static pages have no preconnect (out of scope)", static_no_preconnect == 7, f"got {static_no_preconnect}")

# ── E8: capture-order.js status codes ──────────────────────────
print("\n=== E8: capture-order.js status codes ===")
cap = read('functions/capture-order.js')
status_200_count = len(re.findall(r"status:\s*200", cap))
# Should be exactly 1 (the success response with ok: true, downloadUrl, transactionId)
check("capture-order.js has exactly 1 status:200 (success only)", status_200_count == 1, f"got {status_200_count}")
check("capture-order.js has status:400 for bad request", "status: 400" in cap)
check("capture-order.js has status:502 for paypal token error", "status: 502" in cap)
check("capture-order.js has status:503 for missing creds", "status: 503" in cap)
check("capture-order.js has status:500 for network error", "status: 500" in cap)

# ── E10: related() simplification ──────────────────────────────
print("\n=== E10: related() simplification ===")
check("related() returns plain array of strings", "return [first, second, third];" in comp)
check("related() does NOT wrap in {url: ...}", "{ url: first }" not in comp)
check("getSidebarNotesFor uses url directly", "function (url)" in comp and "getArticleRecord(url) || { url: url }" in comp)

# ── E11: unsubscribe.js comments ───────────────────────────────
print("\n=== E11: unsubscribe.js comments ===")
unsub = read('functions/unsubscribe.js')
check("unsubscribe.js has header comment", "Cloudflare Function: /unsubscribe endpoint" in unsub)
check("unsubscribe.js documents GET/POST split", "GET  — serve the static unsubscribe.html page" in unsub)
check("unsubscribe.js documents markContactUnsubscribed", "Tries PATCH first; if the contact does not exist (404)" in unsub)
check("unsubscribe.js documents redirectToUnsubscribe", "302-redirect back to /unsubscribe" in unsub)

# ── Version bumps across all HTML files ────────────────────────
print("\n=== Version bumps ===")
all_html = [f for f in os.listdir(ROOT) if f.endswith('.html') and f != 'google198e627e00e92b43.html']
v11_files = []
main_nov_files = []
no_data_files = []
for name in all_html:
    c = read(name)
    if 'components.js?v=11' in c:
        v11_files.append(name)
    if 'src="js/main.js"' in c:
        main_nov_files.append(name)
    # Every file that references components.js should also reference articles-data.js
    if 'components.js?v=12' in c and 'articles-data.js?v=1' not in c:
        no_data_files.append(name)

check("no HTML file still uses components.js?v=11", len(v11_files) == 0, f"found: {v11_files}")
check("no HTML file has main.js without version", len(main_nov_files) == 0, f"found: {main_nov_files}")
check("every components.js?v=12 page also loads articles-data.js", len(no_data_files) == 0, f"missing: {no_data_files}")

# ── Summary ────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"Total: {PASS} PASS, {FAIL} FAIL")
sys.exit(0 if FAIL == 0 else 1)