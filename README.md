# iTop Pools website v3

A website for iTop Pools (Jacksonville, FL), an authorized Barrier Reef Pools USA dealer. It tells one story: **choose your Barrier Reef pool → see it in 3D → know the cost → book a free visit with iTop's own crew.**

It's a static site with one real HTML page per URL. Interactive features (3D studio, color lab, estimator, finder, form) run on top of fully rendered pages.

## Quick start

1. Install [Node.js](https://nodejs.org), then run `npm install`.
2. Run one of these:
   ```bash
   npm run dev        # builds dist/ and rebuilds when you save a file in src/
   npm run build      # a single build. Fails on invalid metadata or structured data
   npm run seo-check  # checks every built page. Run after a build
   npm test           # checks key pages at 7 screen sizes (needs Chrome)
   ```
3. Serve `dist/` with a static server, such as `npx serve dist`. Pages use root-relative URLs, so opening a file directly won't work.

> **Always edit files in `src/`.** `dist/` is generated.

The first build takes under a minute because it generates all the photo sizes. Later builds take a second or two.

## How SEO data flows

| Source | What it controls |
|---|---|
| `src/data/pages.json` | Title and description for each page and guide |
| `src/data/models.json` | Official specs: finder, model pages, Product schema, `llms-full.txt` |
| `src/content/models.js` | Unique copy for each model page |
| `src/data/faq.json` | FAQ page, FAQPage schema, home and cost page FAQs, `llms-full.txt` |
| `src/data/articles.json`, `src/content/articles.js` | Pool School guides and Article schema |
| `src/content/pages.js` | Cost guide, comparison, financing, About, service areas, privacy, terms, shape hubs |
| `src/data/site.json` | Business details, tracking IDs, verification tags, `sameAs`, lead webhook |

`build.js` turns these into HTML, JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt` and `llms-full.txt`, so nothing can drift out of step.

## Project structure

```
src/
  body.html       Shared shell and the markup for most pages
  data/           JSON data (see above)
  content/        Written content used at build time
  css/            Joined in name order and minified
  js/             One module per feature. BUNDLES in build.js decides which pages load which
    base.js       Every page: menus, drawer, FAQ, animations, tracking
    data.js       Models and photos, for pages that use them
    engine.js     3D scenes, only loaded when a 3D scene nears the screen
  assets/         Photos, fonts, favicon
  vendor/         three.js r149
scripts/          seo-check.js, indexnow.js
tests/check.js    Overflow, JS errors and tap targets at 7 screen sizes
qa/               Acceptance test report and scripts
vercel.json       Redirects, security and cache headers
```

## How to add things

**A pool model**
1. Add it to `src/data/models.json`.
2. Add its copy to `src/content/models.js`.
3. Put its photo in `src/assets/img/models/`, and add an entry to `src/data/photos.json`.
4. Build. The build fails if the copy is missing.

**A guide**
1. Add it to `newArticles` in `src/content/articles.js`, with an `answer`, `take` and `b`.
2. Add its title and description to `articles` in `src/data/pages.json`.
3. Build, and link to it from a related page.

**A FAQ**
Add it to a group in `src/data/faq.json`, starting with a direct answer. `top: true` also shows it on the home page, `why: true` on the process page, and `cost: true` adds a "Get my firm price" button.

**A city page** (only with real local material; see `CONTENT-PLAN.md`)
1. Add its content to `src/content/pages.js`.
2. Add a `page({...})` call near the service areas page in `build.js`, with `Service` schema.
3. Add its title and description to `src/data/pages.json`.
4. Link to it from `/service-areas/`.

**Common edits**

| What | Where |
|---|---|
| Hero slides | `hero` in `src/data/site.json` |
| Photos | `src/data/photos.json`, see `PHOTOS-NEEDED.md` |
| Estimator prices (**demo numbers**) | `PRICE` in `src/js/estimator.js` |
| Phone, address, email | `src/body.html`, `src/data/site.json`, `src/content/pages.js`, `build.js` (`NAP`, `llms.txt`) |
| Brand colors | `:root` in `src/css/01-base.css` |

## Enquiry form

Put a GoHighLevel inbound webhook URL in `leadWebhook` in `src/data/site.json`, then rebuild. The form posts its answers as JSON, including `utm_*`, `referrer` and `landing_page`, and fires `generate_lead` on success.

While `leadWebhook` is empty, nothing is sent automatically. The last screen asks the visitor to email or call, so nobody believes a request went through when it didn't. Yard photos stay in the browser until a file upload endpoint exists.

## Tracking

Events pushed to `window.dataLayer`: `generate_lead` (model, budget, ZIP), `form_complete`, `phone_click`, `email_click`, `estimator_complete`, `design_3d_interaction`, `color_lab_use`. Add `gtm` or `ga4`, plus `googleVerify` and `bingVerify`, in `src/data/site.json`.

## Going live

See `OFF-SITE-CHECKLIST.md` for the full order.

1. Set `SITE_ENV=live` in Vercel. This removes the `noindex` tag. `*.vercel.app` addresses also send `X-Robots-Tag: noindex`, so previews stay out of search either way.
2. Point itoppools.com at this project, and confirm the old URLs in `vercel.json` redirect to their new pages. Old `.html` URLs take two permanent hops (308, then 301), because Vercel's `cleanUrls` runs before the redirect rules.
3. Submit `sitemap.xml` to Google and Bing, then run `node scripts/indexnow.js`.

Automatic deploys are off for this Vercel project, so pushes to GitHub don't publish by themselves. The Vercel project deploys from `AliMasood077/itop-pools`.

## TODO before launch

- **Everything marked `[CONFIRM]` in `CONTENT-PLAN.md`**, especially real photos, prices, the webhook and the dealer listing
- Replace the demo pricing in `PRICE`
- Have the privacy policy and terms reviewed

**Barrier Reef data to double-check.** `models.json` matches brpoolsusa.com as of November 2026, except for the first two corrections below. Some shape groups are based on its product descriptions.
- Aussie 35 length was listed as `35` with no unit, and is stored as 35'
- Sydney Harbour width was listed as `16"`, and is stored as 16'
- Whitsunday "30" versions are listed at 31'2" long
- Grande 23 and Laguna 23 are listed with different deep ends (5'10.5" and 5'1.5") but otherwise match
- Oasis has no shallow depth listed, so the site shows "See spec sheet"

## Notes

- Plan drawings and 3D shapes are to scale for length and width, but the outlines are simplified.
- Adding `?test` to a URL slows the 3D render loop, for automated screenshots.
- Animations respect the visitor's *reduce motion* setting.
