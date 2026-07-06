# Folk Calm — Chinese Folk Practices (static site)

English-only static site about **traditional Chinese household wellness habits** (foot soaks, gentle kitchen customs, warm compress ideas). Built for **Cloudflare Pages**: plain HTML, CSS, and JavaScript — no server.

## Deploy

1. Upload the folder contents to your Pages project root (or connect this directory via Git).
2. Replace `https://chinese-folk-customs.pages.dev` in `sitemap.xml`, `robots.txt`, and each `<link rel="canonical">` with your real public URL (find & replace).
3. Add your own `favicon.ico` next to `index.html` (optional).

## Daily Article Publish Guard

Draft future articles may stay in the working tree, but public sync files must only mention articles that are ready to publish that day. Before committing any daily article release, run:

```bash
python tools/check_publish_sync.py --today YYYY-MM-DD
```

When the day's article or images are new and have not been added to git yet, list exactly the files planned for that release:

```bash
python tools/check_publish_sync.py --today YYYY-MM-DD --release-file article-example.html --release-file images/example.webp --release-file images/pin-example.webp
```

The guard checks `categories.html`, `sitemap.xml`, `js/components.js`, and `js/main.js`. It fails if a public sync file points to a future-dated article, a missing article or image, or a file that is neither tracked nor listed as part of the current release.

## Files

| File | Role |
|------|------|
| `index.html` | Home |
| `categories.html` | Category hub |
| `article-mugwort-foot-soak.html` | Sample long-form article |
| `disclaimer.html` | Standalone disclaimer |
| `css/styles.css` | Shared styles + dark theme |
| `js/main.js` | Theme toggle + client search index |
| `sitemap.xml` / `robots.txt` | SEO helpers |

## Legal tone

All copy avoids strong health claims and banned wording requested by the publisher; each page repeats a plain-English disclaimer. Review with your own counsel before going live.
