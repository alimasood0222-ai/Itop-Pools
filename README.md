# iTop Pools website v3

A website for iTop Pools (Jacksonville, FL), an authorized Barrier Reef Pools USA dealer. It tells one story: **choose your Barrier Reef pool → see it in 3D → know the cost → book a free visit with iTop's own crew.**

It includes a photo hero, all 22 official models with their specs, a 3D pool design studio (three.js), a colour lab, a cost estimator, Pool School articles, a full FAQ and a 6-step enquiry form.

## Quick start

1. Install [Node.js](https://nodejs.org), then run `npm install` in this folder.
2. Run one of these:
   ```bash
   npm run dev      # builds dist/ and rebuilds whenever you save a file in src/
   npm run build    # a single build
   npm test         # checks every page at 7 screen sizes (needs Chrome installed)
   npm test -- --clicks            # also clicks every button and link
   npm test -- --shots screenshots # also saves screenshots
   ```
3. Serve `dist/` with any static server, such as `npx serve dist` or VS Code's Live Server. Opening the file directly won't load everything.

> **Always edit files in `src/`.** `dist/` is generated, so changes made there are overwritten on the next build.

The first build takes under a minute because it generates all the photo sizes. Later builds reuse them from `.cache/` and take a second or two.

## Project structure

```
src/
  body.html                All page markup (each page is a <div class="route" data-route="…">)
  data/
    models.json            The 22 official Barrier Reef models, with every size and spec
    photos.json            Every photo: file, alt, caption, location, model, category, credit
    faq.json               FAQ groups, questions, answers and the comparison table
    site.json              Hero slides, lead webhook, business details for search engines
  css/                     Joined in name order. 05-v3.css holds the hero, drawer, FAQ and mobile rules
  js/                      Joined in name order into ONE scope
    01-engine.js           Photo helpers and the three.js pool scene
    02-data-studio-lab.js  Articles, pricing, studio and colour-lab UI
    03-pages-router.js     Hero carousel, drawer, pages, enquiry form, hash router
  assets/img/projects/     iTop's project photos
  assets/img/models/       Official Barrier Reef model photos
  assets/fonts/            Inter Tight, Inter, Instrument Serif (self-hosted)
  vendor/three.min.js      three.js r149, loaded only when a 3D scene is about to be seen
tests/check.js             Browser checks: overflow, JS errors, tap targets, click-everything
build.js                   Builds dist/
PHOTOS-NEEDED.md           Shot list for the real photos
```

The build produces:

```
dist/index.html        The app, with only the first hero photo inlined
dist/faq/index.html    The same app opening on the FAQ, at a real URL search engines can read
dist/img/              Each photo as WebP and AVIF at up to 3 widths
dist/fonts/, dist/js/  Fonts and three.js
```

## Common edits

| What | Where |
|---|---|
| Hero slides | `hero` in `src/data/site.json` |
| Photos | `src/data/photos.json`, see `PHOTOS-NEEDED.md` |
| Pool models and specs | `src/data/models.json`. Counts across the site update automatically |
| FAQ | `src/data/faq.json`. `top: true` shows it on the home page, `why: true` on the Why iTop page, `cost: true` adds the "Get my firm price" button |
| Phone, address, email | `src/body.html` and `business` in `src/data/site.json` |
| Brand colours | `:root` at the top of `src/css/01-base.css` |
| Estimator prices (**demo numbers**) | `PRICE` in `src/js/02-data-studio-lab.js` |
| Pool School articles | `ARTS` in `src/js/02-data-studio-lab.js` |
| Enquiry form steps | `data-route="quote"` in `body.html`, and the `QUOTE` section of `03-pages-router.js` |

## Connecting the enquiry form

Put a GoHighLevel inbound webhook URL in `leadWebhook` in `src/data/site.json`, then rebuild. The form posts its answers as JSON to that URL.

While `leadWebhook` is empty, nothing is sent automatically. The last screen asks the visitor to email their request or call instead, so nobody believes a request went through when it didn't. The same fallback appears if the webhook returns an error.

Yard photos stay in the visitor's browser and are not sent yet. They need a file upload endpoint first.

## Going live

1. Build with `SITE_ENV=live`, for example as an environment variable in Vercel. This removes the `noindex` tag and adds `sitemap.xml`. Without it, search engines are told not to index the site, so a preview can't compete with the live itoppools.com.
2. Keep `https://itoppools.com/#faq` working. The home page FAQ keeps the `#faq` anchor for this reason. Point the domain at this site only after checking it.
3. Add redirects for the current site's `/pool-models/`, `/services/` and `/get-a-quote/` pages, which are in its sitemap, so existing search rankings aren't lost.

## TODO before launch

**Must have**
- [ ] Connect the enquiry form (`leadWebhook`)
- [ ] Replace the demo pricing in `PRICE` with iTop's real price book
- [ ] Fabio to confirm the cost figures in `src/data/faq.json` (see below)
- [ ] Fabio to confirm iTop may use the Barrier Reef and current-site photos
- [ ] Real family and project photos (`PHOTOS-NEEDED.md`)

**Fabio to confirm**
- [ ] Installed cost ranges and ownership costs. They come from published guides of mixed quality, and the vinyl range is national rather than Florida-specific
- [ ] Concrete resurfacing cost. No reliable Florida figure was found, so the site gives no number
- [ ] FAQ wording: his current FAQ had placeholders for build time and energy options. Build time now uses Barrier Reef's 2–6 weeks. Energy options now name salt systems, variable-speed pumps and automation
- [ ] Financing answer: the site describes common loan types and doesn't claim iTop offers financing directly
- [ ] Workmanship warranty terms. The site says terms are "set out in your written agreement"
- [ ] License number, then add it to the footer. The current site also has a placeholder for this
- [ ] Pool types: the FAQ keeps his wording that iTop works with fiberglass and concrete/gunite, while the rest of the site focuses on Barrier Reef fiberglass

**To add**
- [ ] Google reviews. The sample review section was removed so visitors don't see fake reviews. Add it back once real reviews are connected
- [ ] Social media links. The placeholder icons in the footer were removed

**Barrier Reef data to double-check**

`models.json` matches brpoolsusa.com as of November 2026, except for the first two corrections below.
- Aussie 35 length was listed as `35` with no unit, and is stored as 35'
- Sydney Harbour width was listed as `16"`, and is stored as 16'
- Whitsunday "30" versions are listed at 31'2" long
- Grande 23 and Laguna 23 are listed with different deep ends (5'10.5" and 5'1.5") but otherwise match
- Oasis has no shallow depth listed, so the site shows "See spec sheet"
- Spas, sundecks and tanning ledges have no published specs, so that section is descriptive only

## Notes

- Routing uses `#/…` hashes (e.g. `#/pools/bondi`, `#/quote?m=bondi`). Clicks are handled in JS, so it also works inside sandboxed previews. The exception is `/faq/`, a real URL.
- Plan drawings and 3D shapes are to scale for length and width, but the outlines are simplified. Exact shapes are on the Barrier Reef spec sheets.
- Adding `?test` to the URL slows the 3D render loop. It's used for automated screenshots.
- Animations respect the visitor's *reduce motion* setting. The hero then stops auto-advancing and doesn't zoom.
