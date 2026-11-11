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

**A gallery photo**
The gallery at `/our-work/` reads `src/data/gallery.json`. Each entry is `{ f, t, m, c, o }`: file name, title, model id (or empty), finish id (or empty), and extra tags (`spa`, `aerial`, `outdoor`, `install`).
1. Save two WebP files in `src/assets/gallery/`: `<f>-640.webp` and `<f>-1280.webp`.
2. Add the entry to `gallery.json`. Its position sets the order.
3. Build. The build fails if a file, model or finish is missing.

The 425 Barrier Reef photos came from Barrier Reef's own gallery, which iTop is authorized to use as a dealer. Model pages link to their photos with `/our-work/?model=<id>`. The filters work the same way for `shape`, `color` and `other`.

**Pool model cards**
The Pools page, the shape pages and "Similar shells" use cards copied from Barrier Reef's own pool models section (brpoolsusa.com/fiberglass-pools-spas/), at the client's request. The card text, shapes, features and "2026 New Model" badges are in `src/data/model-cards.json`, and the drawings and shape icons are in `src/assets/models-br/`. The Length and Width filters use the sizes printed on each card and treat "31' / 40'" as covering everything between, so the results match Barrier Reef's own filter. To add a model, add it to `models.json` and `model-cards.json`, and put its drawing in `src/assets/models-br/<id>.webp`.

**Tremron pavers in the 3D studio**
The 3D studio offers 12 Tremron paver lines (75 colors) and 5 bullnose coping colors, listed in `src/data/pavers.json`. Each color has a small image in `src/assets/pavers/`:
- `<line>-<color>.jpg`: 12 clean patches cut from Tremron's swatch photo. The 3D view lays the line's real pattern at true scale and fills each paver with one of these patches.
- `<line>-chips.webp`: one 64px chip per color, for the picker.

To change a line's laying pattern, edit its `pattern` in `pavers.json`. Sizes are in inches: `rows` takes a row height `h` and piece lengths `l`, and `herringbone` takes a brick width `a`. Tremron textures are darkened by `PAVER_TONE` in `src/js/engine.js`, so the bright scene lighting renders them close to the real swatch. The library was made from tremron.com in November 2026, at the client's request.

**Common edits**

| What | Where |
|---|---|
| Hero slides | `hero` in `src/data/site.json` |
| Photos | `src/data/photos.json`, see `PHOTOS-NEEDED.md` |
| Estimator prices (**demo numbers**) | `PRICE` in `src/js/estimator.js` |
| Phone, address, email | `src/body.html`, `src/data/site.json`, `src/content/pages.js`, `build.js` (`NAP`, `llms.txt`) |
| Brand colors | `:root` in `src/css/01-base.css` |
| Overall look (radii, buttons, labels, section backgrounds) | `src/css/07-refine.css`, which loads last and overrides earlier files |

## Enquiry form and GoHighLevel

The form and the chat post to `/api/lead` (`api/lead.js`, a Vercel function), which forwards each lead to GoHighLevel. To connect it:
1. In GoHighLevel, create a workflow with the **Inbound Webhook** trigger and copy its URL.
2. In Vercel, open the project, go to Settings > Environment Variables, and add `GHL_WEBHOOK_URL` with that URL. Optionally add `GHL_CHAT_WEBHOOK_URL` to send chat messages to a different workflow.
3. Redeploy. Submit a test lead, then map the fields in the workflow (for example `first_name`, `last_name`, `phone`, `email`, `address1`, `city`, `state`, `postal_code`).

The relay keeps the webhook URL out of the site code, adds `full_name`, a `+1` phone and `submitted_at`, and drops spam caught by a hidden field. The form posts the contact details after step 1 (`stage: contact_only`) and the full lead at the end (`stage: complete`). After Submit the visitor always sees "You're all set". The lead is sent in the background and retried twice; if it still fails, it is kept in the visitor's browser (up to 5 leads, 14 days) and re-sent on their next page view. Until `GHL_WEBHOOK_URL` is set, the relay rejects every lead, so set it before launch.

Fields sent: `first_name`, `last_name`, `phone`, `email`, `address1`, `address2`, `city`, `state`, `postal_code`, `full_address`, `project`, `model`, `must_haves`, `timing`, `budget`, `hoa`, `existing`, `contact_pref`, `notes`, `sms_consent`, `estimate`, `photo_count`, `photo_urls`, `photo_1`…`photo_6`, `stage`, `utm_*`, `referrer`, `landing_page`.

Yard photos: the form shrinks each photo in the browser (max 1600px JPEG) and posts it to `/api/photo/` as soon as it's picked; `api/photo.js` checks it really is an image (max 4 MB) and stores it in Vercel Blob, then the lead carries the public URLs. This needs a Blob store connected to the project (Vercel > Storage > Create > Blob, public access), which sets `BLOB_READ_WRITE_TOKEN`. Without it, leads still go through, just without photos. In GoHighLevel, map `photo_urls` (or `photo_1`…) to a text custom field.

## Chat widget

A chat button sits in the bottom right of every page. To connect GoHighLevel, either:
- put GoHighLevel's chat widget ID in `ghlChatWidgetId` in `src/data/site.json`, and its official widget loads in place of ours, or
- put an inbound webhook URL in `chatWebhook`, and messages from our panel post to it as JSON (`name`, `phone`, `message`, `page`, `source`).

Until one is set, the panel asks the visitor to send their message by text or email, so nobody is told it went through when it didn't. Events: `chat_open`, `chat_message`, `chat_call`, `chat_free_design`.

The free design form asks for contact details first. With `leadWebhook` set, it posts those details as soon as step 1 is done (`stage: contact_only`, plus a `lead_started` event), then the full lead at the end (`stage: complete`), so a visitor who stops partway is still a lead.

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

## Equipment brands, social links and license numbers

All three live in `src/data/site.json`:

- `brands`: the "Equipment we install" strip on the home page, as `[file, name, width, height]`. Logos are in `src/assets/brands/<file>.webp`.
- `social.facebook` / `social.instagram`: the footer icons. While a URL is empty, its icon opens a search for iTop Pools on that network; paste the real profile URL to link it directly (it is also added to the business schema's `sameAs`).
- `licenses`: the license numbers shown in the footer on every page.
