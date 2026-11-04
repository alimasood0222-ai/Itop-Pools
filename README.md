# iTop Pools website v3

A website for iTop Pools (Jacksonville, FL), an authorized Barrier Reef Pools USA dealer. It tells one story: **choose your Barrier Reef pool → see it in 3D → know the cost → book a free visit with iTop's own crew.**

It includes a photo hero, all 22 official models with their specs, a 3D pool design studio (three.js), a color lab, a cost estimator, Pool School articles, a full FAQ and a 6-step enquiry form.

## Quick start

1. Install [Node.js](https://nodejs.org), then run `npm install` in this folder.
2. Run one of these:
   ```bash
   npm run dev      # builds dist/ and rebuilds whenever you save a file in src/
   npm run build    # a single build
   npm test         # checks key pages at 7 screen sizes (needs Chrome installed)
   npm test -- --clicks            # also clicks every button and link
   npm test -- --shots screenshots # also saves screenshots
   ```
3. Serve `dist/` with any static server, such as `npx serve dist`. Pages use root-relative URLs, so opening a file directly won't work.

> **Always edit files in `src/`.** `dist/` is generated, so changes made there are overwritten on the next build.

The first build takes under a minute because it generates all the photo sizes. Later builds reuse them from `.cache/` and take a second or two.

## How it works

Every page has a real URL and its own HTML file containing that page's content, metadata and structured data, so it reads fine with JavaScript off. The shared app script then takes over and carries the other pages' markup, so moving between pages doesn't reload.

| URL | Page |
|---|---|
| `/` | Home |
| `/fiberglass-pools/`, `/fiberglass-pools/<model>/` | Finder and 22 model pages |
| `/3d-pool-design/` | 3D studio |
| `/pool-colors/` | Color lab |
| `/pool-cost/` | Estimator and financing |
| `/pool-school/`, `/pool-school/<article>/` | Guides |
| `/our-work/` | Gallery |
| `/why-itop/` | Process and warranty |
| `/free-3d-design/` | Enquiry form |
| `/faq/` | FAQ |

Old `#/…` links redirect in the browser. Old itoppools.com paths redirect in `vercel.json`.

## Project structure

```
src/
  body.html                All page markup (each page is a <div class="route" data-route="…">)
  data/
    models.json            The 22 official Barrier Reef models, with every size and spec
    photos.json            Every photo: file, alt, caption, location, model, category, credit
    faq.json               FAQ groups, questions, answers and the comparison table
    pages.json             Title and description for every page and article
    site.json              Hero slides, lead webhook, tracking IDs, business details
  css/                     Joined in name order
  js/                      Joined in name order into ONE scope
    01-engine.js           Page loader, photo helpers and the three.js pool scene
    02-data-studio-lab.js  Articles, pricing, studio and color-lab UI
    03-pages-router.js     Hero carousel, drawer, pages, enquiry form, router
  assets/img/projects/     iTop's project photos
  assets/img/models/       Official Barrier Reef model photos
  assets/fonts/            Inter Tight, Inter, Instrument Serif (self-hosted)
  vendor/three.min.js      three.js r149, loaded only when a 3D scene is about to be seen
tests/check.js             Browser checks: overflow, JS errors, tap targets, click-everything
scripts/indexnow.js        Notifies search engines of all pages. Run by hand after launch
build.js                   Builds dist/
vercel.json                Redirects and headers
qa/                        Acceptance test report, evidence and scripts
PHOTOS-NEEDED.md           Shot list for the real photos
KEYWORD-MAP.md             Draft target keyword for each page
```

## Common edits

| What | Where |
|---|---|
| Hero slides | `hero` in `src/data/site.json` |
| Photos | `src/data/photos.json`, see `PHOTOS-NEEDED.md` |
| Pool models and specs | `src/data/models.json`. Counts across the site update automatically |
| FAQ | `src/data/faq.json`. `top: true` shows it on the home page, `why: true` on the Why iTop page, `cost: true` adds the "Get my firm price" button |
| Page titles and descriptions | `src/data/pages.json`. The build warns if a title is over 60 characters or a description is outside 140–155 |
| Phone, address, email | `src/body.html` and `business` in `src/data/site.json` |
| Estimator prices (**demo numbers**) | `PRICE` in `src/js/02-data-studio-lab.js` |
| Pool School articles | `ARTS` in `src/js/02-data-studio-lab.js`. Add metadata in `pages.json` |
| Tracking IDs and verification tags | `gtm`, `ga4`, `googleVerify`, `bingVerify` in `src/data/site.json` |
| Social and Google profile links | `sameAs` in `src/data/site.json` |

## Enquiry form

Put a GoHighLevel inbound webhook URL in `leadWebhook` in `src/data/site.json`, then rebuild. The form then posts its answers as JSON, including `utm_*`, `referrer` and `landing_page`, and fires a `generate_lead` event on success.

While `leadWebhook` is empty, nothing is sent automatically. The last screen asks the visitor to email their request or call, and "We call you" is hidden, so nobody believes a request went through when it didn't. The same fallback appears if the webhook returns an error.

Yard photos stay in the visitor's browser and are not sent yet. They need a file upload endpoint first.

## Tracking

These events are pushed to `window.dataLayer`, ready for Google Tag Manager: `generate_lead`, `form_complete`, `phone_click`, `estimator_complete`, `design_3d_interaction`.

## Going live

1. Set `SITE_ENV=live` in Vercel. This removes the `noindex` tag. `*.vercel.app` addresses also send an `X-Robots-Tag: noindex` header, so previews stay out of search either way.
2. Point itoppools.com at this project and confirm the redirects in `vercel.json` return 301.
3. Submit `sitemap.xml` to Google Search Console and Bing, and run `node scripts/indexnow.js`.

## TODO before launch

**Must have**
- [ ] Connect the enquiry form (`leadWebhook`)
- [ ] Replace the demo pricing in `PRICE` with iTop's real price book
- [ ] Fabio to confirm the cost figures in `src/data/faq.json`
- [ ] Fabio to confirm iTop may use the Barrier Reef and current-site photos
- [ ] Real family and project photos (`PHOTOS-NEEDED.md`). Rename "Gallery" back to "Our Work" once they're iTop's own builds

**Fabio to confirm**
- [ ] Installed cost ranges and ownership costs. They come from published guides of mixed quality, and the vinyl range is national rather than Florida-specific
- [ ] Concrete resurfacing cost. No reliable Florida figure was found, so the site gives no number
- [ ] "2–6 weeks", "within one business day" and "every call is answered by someone who builds pools"
- [ ] FAQ wording, including filled-in placeholders for build time and energy options
- [ ] Financing: the site describes common loan types and doesn't claim iTop offers financing directly
- [ ] Workmanship warranty terms
- [ ] License number, then add it to the footer

**To add**
- [ ] Google reviews, once real reviews are connected
- [ ] Social and Google Business Profile URLs (`sameAs`)
- [ ] GA4 or GTM IDs, and Search Console and Bing verification
- [ ] City pages, only with real local projects, permit notes and reviews, so they aren't near-duplicates

**Barrier Reef data to double-check**

`models.json` matches brpoolsusa.com as of November 2026, except for the first two corrections below. Feature tags are worded from Barrier Reef's listed features, and some shape groups are based on its product descriptions.
- Aussie 35 length was listed as `35` with no unit, and is stored as 35'
- Sydney Harbour width was listed as `16"`, and is stored as 16'
- Whitsunday "30" versions are listed at 31'2" long
- Grande 23 and Laguna 23 are listed with different deep ends (5'10.5" and 5'1.5") but otherwise match
- Oasis has no shallow depth listed, so the site shows "See spec sheet"
- Spas, sundecks and tanning ledges have no published specs, so that section is descriptive only

## Notes

- Plan drawings and 3D shapes are to scale for length and width, but the outlines are simplified. Exact shapes are on the Barrier Reef spec sheets.
- Adding `?test` to the URL slows the 3D render loop. It's used for automated screenshots.
- Animations respect the visitor's *reduce motion* setting. The hero then stops auto-advancing and doesn't zoom.
