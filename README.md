# Folk Calm

Folk Calm is an English-language, static-first archive of traditional Chinese household practices. The public pages are plain HTML, CSS, and JavaScript, while Cloudflare Pages Functions provide the small server-side boundary required for scheduled publishing, subscriptions, payment verification, and protected downloads.

## Runtime architecture

| Area | Responsibility |
| --- | --- |
| Root `*.html`, `css/`, `images/`, `pdfs/` | Static pages and assets served by Cloudflare Pages |
| `js/articles-data.js` | Shared article manifest used by search, related/latest cards, the publication gate, and the dynamic sitemap |
| `js/main.js` | Browser search plus category/archive hiding for future entries, using the Asia/Shanghai calendar date |
| `functions/[[path]].js` and `functions/_lib/publication.js` | Server-authoritative article date gate, request-time sitemap filtering, and blocking of repository-only paths |
| `functions/subscribe.js`, `functions/unsubscribe.js` | Resend contact and welcome-email flows |
| `functions/capture-order.js`, `functions/pdfs/[[path]].js` | PayPal capture verification and expiring HMAC-signed access to the paid guide |
| `_headers`, `_redirects`, `_routes.json` | Cloudflare response, redirect, and Function invocation rules |
| `tools/` and root Python scripts | Local publishing checks and PDF generation; these are not public application routes |

The browser-side date filter is a presentation feature, not the security boundary. A direct request for a scheduled article is checked by the catch-all Function and returns `404` until its manifest date. `/sitemap.xml` is generated from the deployed static sitemap at request time and omits future entries. Both decisions use the Asia/Shanghai date and `js/articles-data.js` as the publication allowlist.

Cloudflare's default `ASSETS` binding is used by Functions to return approved static files; no database is required.

## Local setup

The website itself has no framework build step. Python 3.10 or newer is recommended for the repository checks and PDF helpers. Install the current Node.js LTS release with npm for the Function regression test and Wrangler.

```bash
python -m venv .venv
python -m pip install -r requirements.txt
```

For local Pages/Functions development, copy `.env.example` to `.env` (or `.dev.vars`), fill only the values required for the flow you are exercising, and run Wrangler from the repository root. The mocked regression test below requires no credentials.

```bash
npx wrangler pages dev .
```

The repository does not yet have a Node package manifest/lockfile, and the Python package list is intentionally unpinned because no tested version baseline has been recorded. Pin a tested Wrangler release and generate Python constraints in CI before treating either toolchain as reproducible; do not invent version pins without running the full checks.

Do not commit `.env`, `.dev.vars`, or real credentials. Cloudflare supports local secrets in either file format, but only one format should be used at a time. See [Pages bindings and local secrets](https://developers.cloudflare.com/pages/functions/bindings/).

## Environment variables

Configure variables separately for Cloudflare's Preview and Production environments.

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | For subscribe/unsubscribe | Creates or updates contacts and sends the welcome guide; also enables purchase email delivery |
| `RESEND_FROM` | Optional | Welcome-email sender; defaults to `Folk Calm <guide@folkcalm.com>` |
| `PAYPAL_CLIENT_ID` | For paid checkout | PayPal OAuth and order capture |
| `PAYPAL_CLIENT_SECRET` | For paid checkout | PayPal OAuth; legacy fallback for download signing |
| `PAYPAL_MERCHANT_ID` | Unless payee email is set | Expected PayPal merchant; `PAYPAL_PAYEE_MERCHANT_ID` remains a supported legacy alias |
| `PAYPAL_PAYEE_EMAIL` | Unless merchant ID is set | Expected PayPal payee email; may be set with the merchant ID for a stricter check |
| `PDF_TOKEN_SECRET` | Strongly recommended | Independent high-entropy HMAC secret for expiring paid-PDF links |
| `PUBLIC_SITE_URL` | Recommended | Canonical origin used when creating signed download URLs |
| `ASSETS` | Automatic | Cloudflare Pages binding for deployed static assets; do not create this manually |

Use Cloudflare Variables and Secrets for production values. `PDF_TOKEN_SECRET`, PayPal credentials, and the Resend key should be stored as secrets rather than plaintext variables.

`RESEND_FROM` controls the subscriber welcome email only; the purchase email sender is currently fixed in `functions/capture-order.js`. The PayPal browser client ID is currently embedded in `remedies-guide.html` and must belong to the same live application/account as the server credentials. `capture-order.js` calls PayPal's production API; a sandbox flow requires an explicit code/configuration change for both browser and server endpoints.

The public forms currently enforce source verification, a small body limit, and email validation. The subscribe form intentionally avoids a hidden honeypot because browser autofill can silently block real signups; the unsubscribe form still uses one. Source verification accepts a matching Origin or Referer, or an explicit `Sec-Fetch-Site: same-origin` fallback. The forms do not have a persistent per-IP rate limiter or Turnstile challenge. If automated abuse becomes material, add a stateful Cloudflare control (for example, Turnstile plus KV/Durable Object or a rate-limiting rule).

## Verification

Run both checks from the repository root before every content or runtime deployment:

```bash
python verify_articles_data.py
python tools/check_publish_sync.py
node --experimental-default-type=module tools/test_cloudflare_functions.mjs
```

The first command dynamically compares the article HTML set with `js/articles-data.js`, validates shared metadata/assets, and checks the static preconnect declarations. It contains no expected article count or machine-specific path.

The publish guard validates all of the inputs used by scheduled publishing:

- article HTML, `categories.html`, `sitemap.xml`, and shared-manifest membership;
- shared date, `article:published_time`, and JSON-LD `datePublished` equality;
- `data-publish-date` on any category entry that is still in the future;
- existence and Git/release membership of every referenced article and image.

The Node regression uses only built-in modules and mocks external calls. It checks the server publication boundary, dynamic sitemap, route coverage, form protections, payment verification, signed/retired PDF behavior, and security headers without sending email or capturing a real PayPal order.

For a deterministic release check, pass the intended Asia/Shanghai deployment date:

```bash
python tools/check_publish_sync.py --today 2026-07-23
```

If new files have not been staged yet, declare each one explicitly. This permits a pre-stage check without weakening the tracked-file guard:

```bash
python tools/check_publish_sync.py --today 2026-07-23 --release-file article-example.html --release-file images/example.webp
```

## Pre-deploying future articles

Future articles are deliberately included in one deployment so they can publish without a daily manual deploy. For each scheduled article:

1. Add the article HTML and every referenced image.
2. Add one record to `js/articles-data.js` with the intended `YYYY-MM-DD` publication date.
3. Use that same date in the article's `article:published_time` meta tag and JSON-LD `datePublished` value.
4. Add the article to `categories.html`. While it is future-dated, put the same `data-publish-date` on the containing `<li>`.
5. Include the article in the static `sitemap.xml`; the Function removes it from the response until publication day.
6. Run both verification commands, then deploy the complete static and Function artifact together.

At midnight on the scheduled Asia/Shanghai calendar date, the server gate begins serving the already-deployed article, the browser archive/search can display it, and the dynamic sitemap can include it. No new deployment is required. Knowing the URL early does not bypass the server-side `404` gate.

## Deployment

Git integration is preferred: connect the repository to Cloudflare Pages, leave the framework build command empty, and use the repository root (`.`) as the output directory. A push to the configured production branch creates one atomic deployment containing both static assets and the root `functions/` directory. See [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/).

Before a Git deployment, confirm `_routes.json`, every imported `functions/_lib/` helper, the article manifest, and all referenced release assets are committed. Git-connected Pages cannot deploy files that exist only in a local working tree.

In **Settings > Runtime > Fail open / closed**, choose **Fail closed**. The article Function is a publication access control: fail-open behavior can bypass it if the free Functions allowance is exhausted, whereas fail-closed returns an error instead of exposing the static asset. `_routes.json` limits Function invocations to scheduled/protected routes. See [Pages Function routing and fail modes](https://developers.cloudflare.com/pages/functions/routing/#fail-open--closed).

For an existing Pages project that is intentionally deployed from a workstation, use Wrangler from a clean checkout containing only the intended release files. The command must run at the project root so the `functions/` folder is compiled and uploaded:

```bash
npx wrangler pages deploy . --project-name=<PROJECT_NAME>
```

Do not use dashboard drag-and-drop for this project. Cloudflare's dashboard Direct Upload does not compile a Pages `functions/` directory, so a drag-and-drop release would omit the scheduled-article gate and the protected server endpoints. Wrangler and Git-connected deployments support Functions; see [Direct Upload and Functions](https://developers.cloudflare.com/pages/get-started/direct-upload/#functions).

After a preview deployment, verify at minimum:

- an already-published article returns `200`;
- a future article returns `404` for both `GET` and `HEAD`;
- `/sitemap.xml` excludes the future URL;
- a random missing URL returns a real `404` page;
- subscription/payment smoke tests do not send a real welcome email or capture a live order. `capture-order.js` currently targets PayPal's production API, so use mocks for routine regression tests.

## Publication boundary

The current deployment is atomic: content, the publication manifest, Functions, and payment code share one Pages release. Keep content-only releases in separate commits or pull requests from changes to subscription, payment, routing, and security code. This makes preview verification and rollback much safer even when they ultimately deploy together.

If content publishing later needs a fully independent release boundary, move the versioned article manifest and content assets behind a dedicated content pipeline or store (for example, a reviewed object-store/KV manifest) while keeping the stable gate/payment Functions in their own deployment. Until that migration is designed and tested, the repository manifest plus one pre-deployment is the supported publishing model.

## Editorial and legal scope

The site records cultural and household history and avoids presenting the material as medical advice. Review editorial, privacy, payment, and email-compliance changes with the appropriate professional before production use.
