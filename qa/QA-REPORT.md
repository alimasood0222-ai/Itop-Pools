# iTop Pools acceptance test

Tested 4 November 2026, source commit `6572c7a` on branch `v3`. No source files were changed. All evidence is in `qa/`.

## 1. Verdict

**Yes with caveats: it can be shown to Fabio as a preview, but it isn't ready for customers or for the itoppools.com domain.** His requests about models, FAQ, structure and competitor names largely hold up, and the main visitor journeys work. Fix the phone bug on the fiberglass comparison article first, and tell him that the photos, prices and form are not final. Section D is mostly FAIL because that SEO work hasn't been built, not because something broke: there are only two real URLs, and the SEO reference files don't exist. Launching on his domain in this state would risk the search rankings he cares about.

## 2. Scorecard

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| A1 | Photo carousel hero | PARTIAL | `logs/func-output.txt`, `screens/hero-slide*` | 6 slides, auto-advance, arrows, dots, swipe, keyboard, tab-hidden pause and reduced motion all pass. Gaps: no families in any photo; captions have no location; hover over the photo doesn't pause, by your earlier request; unused `#heroCanvas` rule at `src/css/01-base.css:86`; a right swipe can trigger browser Back (issue 5). |
| A2 | Educational FAQ | PARTIAL | `logs/static.json`, `screens/faq-*` | 20 questions in 7 categories; all 9 required questions present; comparison table and 4 cost CTAs present. 10 of Fabio's 11 live-site questions kept; "Will my pool be a lot of work to maintain?" was replaced, and some answers were edited. Cost figures are unconfirmed drafts. |
| A3 | Models match Barrier Reef | PARTIAL | `logs/a3.json`, `screens/model-*-tab2-1440.png` | Live list has 22, ours has 22, no differences, no Daydream model. All 42 versions compared across live, data and rendered; the only differences are 3 deliberate typo corrections. All 4 spot-checks match. Tabs switch specs, plan and profile on Bondi and Aussie. Counts agree everywhere. Gap: feature tags and some shape categories are inferred, not official, e.g. Bondi is tagged "Tanning ledge" while Barrier Reef lists a "sloped entry ledge". |
| A4 | Home section order | PASS | `logs/func.json` | Hero, trust, models, quiz, 3D studio, colours, cost, why fiberglass, maintenance and warranty, add-ons, why iTop, process, gallery, Pool School, FAQ, CTA, footer. Page is long (about 21,000 px on a phone). |
| A5 | No competitor names | PASS | `logs/static.json` | 0 hits for all 8 names in `src/`, `dist/` and the docs. |
| A6 | Original, authentic photos | BLOCKED | Appendix A | Real photos, no placeholders, no AI images found. 22 are Barrier Reef's and 11 come from itoppools.com. Needs Fabio's permission, family shots and confirmation of which are iTop builds. `PHOTOS-NEEDED.md` is complete. |
| A7 | Site makes sense | PARTIAL | `logs/func.json` | Story is consistent and no demo text is visible. Gaps: 23 button labels, including "Start my free design" and "Start my design" for the same action; "60 seconds" vs "90 seconds"; "Five quick steps" vs a 6-step form. |
| B1 | Every button and link | PARTIAL | `logs/clicks-output.txt`, `logs/func2-output.txt` | 515 clicks at 390 and 1440 on 12 pages: no errors, dead links or 404s, no orphan pages. Links on all 22 models and 11 articles also validated. In a sandboxed iframe, navigation and the form work, but fonts are blocked (CORS) and fall back to system fonts. The iframe test covered menus and the form, not every button. |
| B2 | CTAs reach the form | PASS | `logs/func-output.txt` | All 13 checks pass. Model, quiz, studio and estimate carry over; `?m=bondi` preselects. |
| B3 | Enquiry form | PARTIAL | `screens/form-*`, `logs/func-output.txt` | Passes at both sizes: validation, ZIP in and out of area, upload and remove, visit, Back, step pills, phone formatting, live summary. **Not connected to GoHighLevel: 0 POST requests, and no UTM, referrer or landing-page fields.** Gaps: step 1 needs Continue, though the page promises "a single tap"; Enter on a selected tile deselects it; done screen conflicts (issue 1). Continue bar with the iOS keyboard open wasn't testable. |
| B4 | Fonts and typography | PARTIAL | `logs/pages.json`, `screens/h1-*` | Only 4 self-hosted font files load. Body 16px; form inputs 16px; H1s fit at 360. Gaps: finder sort menu is 14px, which makes iOS zoom; many smaller text sizes; ◆ ⏱ ✓ used as UI icons. |
| B5 | Animations | PARTIAL | `logs/diag3.json`, `logs/diag5.json` | Nothing stays hidden after scrolling. CLS is 0. Reduced motion shows all content. Smoothness can't be judged on this test machine, which has no graphics card. |
| B6 | Home model carousel | PARTIAL | `logs/func2-output.txt`, `logs/diag4.json` | Arrows, keyboard, phone swipe, chips, ticks, info panel and centred-card click (3 of 3 on a fresh page) pass. **Mouse drag fails at all 3 speeds:** it stays on card 01. A click right after a failed drag opened nothing. A faint ring at the left edge isn't explained (`screens/carousel-edges-1440.png`). |
| C1 | No sideways scroll | FAIL | `logs/pages.json`, `screens/table-article-table-390.png` | **Fiberglass vs concrete article widens to 444px at 360 and 390.** The other 32 pages are clean at those sizes; the 12 core pages are clean at 414, 768, 844 and 1440. This article wasn't in the core set at 414, 768 or 844. |
| C2 | Mobile drawer | PARTIAL | `screens/drawer-expanded-390.png`, `logs/func2-output.txt` | Passes logo, 44x44 close, 7 icons, expanding Pools, active indicator, pinned buttons, backdrop, scroll lock, Esc, backdrop tap, route change, focus trap, aria. Swipe right triggered browser Back in Chrome touch emulation. Visual quality: good and clean, a big improvement. |
| C3 | Tap targets 44x44 | FAIL | `logs/pages.json` | 93 unique undersized items at 360 and 390. Worst: range sliders (6px tall), inline FAQ links (20px), breadcrumbs (21px), carousel ticks (24x28), hero dots (24x32), pause (32x32), swatches (38x38). |
| C4 | Mobile layout | PARTIAL | `logs/func2-output.txt` | Hero clear of caption, studio canvas 74vh, lab thumb drag, filter sheet, tray above sticky bar, FAQ table stacked. Gaps: Pool School and article tables aren't stacked; "Fiberglass" header overflows its cell; compare table clips 12px; hero stats removed at your request, not 2x2; about 130px of empty navy under the hero at 844 tall. |
| C5 | Readability and contrast | FAIL | `logs/diag3.json` | Axe finds contrast failures on 8 of 12 pages, up to 67 elements on Pools. Worst pairs: orange on cream 2.36:1, grey on white 2.86:1, blue on white 3.07:1. Much text is 9.5–11.5px. Axe scanned page content only, not the nav or footer. |
| C6 | Mobile performance | PARTIAL | Section 4 | Performance target met on 4 of 5 pages, but LCP target met only on the form. Model page is the weakest. |
| D1 | Real URLs | FAIL | `logs/static.json`, `screens/nojs-*` | Only 2 HTML files; 138 `#/` links per page. **With JS off, both pages show only nav and footer (820 characters), not even the FAQ.** The text is in the raw HTML, which helps crawlers that read HTML, but it's hidden from anyone without JS. |
| D2 | Per-page metadata | FAIL | `logs/static.json` | Titles 61 and 71 characters (limit 60); home description 136 (minimum 140). Canonical, OG and `lang` present. No Twitter tags. 11 H1s in raw HTML because every route is in one file. Other pages have no HTML of their own. |
| D3 | Crawl files | FAIL | `logs/live-urls.log` | No sitemap on the preview; live build would list only 2 URLs and no `lastmod`, no image sitemap. Robots doesn't name AI bots. No `llms.txt`, `llms-full.txt` or IndexNow. Preview is `noindex` by meta tag only, not by header. |
| D4 | Redirects | FAIL | `logs/live-urls.log` | No `vercel.json`. All legacy URLs tested return 404, not 301, and there's no custom 404 page. `vercel dev` skipped for this reason. |
| D5 | Structured data | PARTIAL | `logs/static.json`, `logs/claims.json` | All JSON-LD parses. Present: business, WebSite, 22 Products with no fake prices, FAQPage. Missing: `sameAs`, Organization, Article, BreadcrumbList, Service. The schema.org validator listed no errors but returned no totals, and didn't list the business block, so that's not a clean bill of health. Image URLs point to itoppools.com paths that don't exist yet. |
| D6 | NAP consistency | PARTIAL | `logs/static.json` | Name and phone consistent. CTA block abbreviates the address ("Columbia Park Dr, Ste 206") at `src/body.html:311`. No `llms.txt` to check. |
| D7 | AEO quality | PARTIAL | Section 8 | 5 of 20 answers fall in the 40–60 word range for their first two sentences. No article has question headings, an "Updated" date or key takeaways; 4 of 11 name sources; length 92–248 words. |
| D8 | City pages | FAIL | none exist | No city pages have been built. |
| D9 | Links and keywords | PARTIAL | `logs/clicks-output.txt` | No broken links, no orphans, every page links to the form. `KEYWORD-MAP.md` doesn't exist, so keywords couldn't be checked. |
| D10 | Tracking | FAIL | `logs/static.json` | No GA4, GTM, dataLayer, Search Console or Bing tags, and no events. |
| E1 | No invented facts | PARTIAL | `logs/claims.json`, Section 9 | No fake reviews or license numbers. Warranty wording matches Barrier Reef. Several claims are unverified (Section 9). |
| E2 | Placeholders and demo content | BLOCKED | `src/js/02-data-studio-lab.js:132` | No `[CONFIRM]` remains, but estimator prices are demo numbers shown as "example ranges". Needs the real price book. |

## 3. Totals

| Section | PASS | PARTIAL | FAIL | BLOCKED |
|---|---|---|---|---|
| A. Client feedback | 2 | 4 | 0 | 1 |
| B. Regression | 1 | 5 | 0 | 0 |
| C. Mobile | 0 | 3 | 3 | 0 |
| D. SEO and AEO | 0 | 4 | 6 | 0 |
| E. Accuracy | 0 | 1 | 0 | 1 |
| **Total (31)** | **3** | **17** | **9** | **2** |

## 4. Lighthouse

Run locally against a launch-mode build with compression, using Lighthouse's simulated throttling. Live rows use the real URL, where SEO drops only because the preview is deliberately `noindex`. Bold marks a missed target. INP can't be measured in Lighthouse, so TBT is shown.

| Page | Device | Perf | A11y | BP | SEO | LCP | CLS | TBT | Weight |
|---|---|---|---|---|---|---|---|---|---|
| Home | Mobile | 88 | 100 | 100 | 100 | **2.7 s** | 0 | 160 ms | 436 KiB |
| Model (Bondi) | Mobile | **74** | **93** | 100 | 100 | **3.8 s** | 0 | 370 ms | 609 KiB |
| Cost | Mobile | 85 | 95 | 100 | 100 | **2.6 s** | 0 | 240 ms | 391 KiB |
| FAQ | Mobile | 89 | 100 | 100 | 100 | **2.6 s** | 0 | 180 ms | 390 KiB |
| Form | Mobile | 93 | 100 | 100 | 100 | 2.0 s | 0 | 130 ms | 391 KiB |
| Home | Desktop | 96 | 96 | 100 | 100 | 0.6 s | 0 | 0 ms | 795 KiB |
| Model (Bondi) | Desktop | 99 | **89** | 100 | 100 | 0.6 s | 0 | 0 ms | 835 KiB |
| Cost | Desktop | 98 | **91** | 100 | 100 | 0.6 s | 0 | 0 ms | 726 KiB |
| FAQ | Desktop | 99 | 96 | 100 | 100 | 0.8 s | 0 | 0 ms | 725 KiB |
| Form | Desktop | 98 | **94** | 100 | 100 | 0.5 s | 0 | 0 ms | 726 KiB |
| Home (live) | Mobile | **84** | 100 | 100 | **69** | **3.0 s** | 0 | 210 ms | 448 KiB |
| FAQ (live) | Mobile | 89 | 100 | 100 | **66** | 2.4 s | 0 | 140 ms | 402 KiB |

**Water shimmer impact:** none measurable. Home scored 88 with LCP 2.7 s both with and without it.

**Desktop accessibility:** the phone link in the header has no accessible name at Lighthouse's desktop width, because its text is hidden below 1360px.

## 5. Top 10 issues by client impact

1. **The form's last screen contradicts itself, and leads don't send automatically.**
   Reproduce: finish the form. It says "One last tap", then "We call you within one business day", even if the visitor never taps Email or Call.
   Fix: connect the GoHighLevel webhook with UTM, referrer and landing-page fields. Until then, show "We call you" only after the webhook succeeds.
2. **The comparison article breaks on phones.**
   Reproduce: open `#/learn/fiberglass-vs-concrete` at 390. The page widens to 444px and the menu button moves off-screen. It's linked from the FAQ.
   Fix: stack article tables on phones.
3. **"Our Work" may overstate what iTop built, and the hero has no families.**
   Reproduce: open `#/work`. It says "Real yards. Real pools." using photos with unconfirmed origins. Fabio's first request was families in backyards.
   Fix: get his photos and permission. Until then, relabel the page as examples of Barrier Reef pools.
4. **The site can't yet replace itoppools.com for SEO.**
   Reproduce: turn off JS on `/faq/`: only the nav and footer show. `/pool-models/`, `/services/` and `/get-a-quote/` return 404.
   Fix: generate a real HTML page for each model, article and section, with metadata, a sitemap, redirects and a 404 page. This is the largest item.
5. **Swiping right can leave the page.**
   Reproduce: at phone size in Chrome touch emulation, swipe right on the hero headline or inside the drawer. The browser goes Back. Android Chrome is the likely risk, and it's unconfirmed on real devices.
   Fix: `overscroll-behavior-x: none`, plus `touch-action: pan-y` across the hero and drawer.
6. **Carousel drag doesn't work on desktop.**
   Reproduce: mouse-drag the home model carousel. It moves 15–60px and returns to card 01.
   Fix: correct the drag handling, and let a click work straight after a drag.
7. **Low contrast and very small text.**
   Reproduce: Pools page tags and types, estimator prices, timeline badges.
   Fix: use a darker blue for text on light backgrounds, set a 12px minimum, fix the desktop phone link name.
8. **Unconfirmed claims are stated as fact.** See Section 9.
   Fix: Fabio confirms or supplies each one, or the wording is softened.
9. **Model pages are slow on phones.**
   Reproduce: Lighthouse on `#/pools/bondi`: performance 74, LCP 3.8 s.
   Fix: preload the model photo, and defer the "Similar shells" images and plan rendering.
10. **Small polish items.**
    - A 3px sliver of the hidden toast shows at the bottom of every page (`screens/bottom-edge-*`).
    - Finder sort menu is 14px, which makes iOS zoom.
    - "60 seconds" vs "90 seconds", and "Five quick steps" vs 6 steps.
    - Button labels vary, and the step 1 "single tap" promise is wrong.
    - Tap targets are undersized (C3).
    - Fonts fail in a sandboxed iframe.
    - Photo order changes between builds, so the gallery order may change too.

## 6. Content needed from Fabio

- [ ] Family and project photos, with signed releases where people appear (`PHOTOS-NEEDED.md`)
- [ ] Permission to use the Barrier Reef photos and those from itoppools.com, and which ones are iTop's own builds
- [ ] Neighborhood for each project photo, for captions
- [ ] Approval of the FAQ wording, including the replaced maintenance question
- [ ] Confirmed installed cost ranges and long-term costs for fiberglass, concrete and vinyl
- [ ] Real price book for the estimator
- [ ] GoHighLevel webhook URL
- [ ] License number
- [ ] iTop's workmanship warranty terms
- [ ] Financing: does iTop offer it directly or through a partner?
- [ ] Confirmation of "2–6 weeks", "within one business day" and "every call is answered by someone who builds pools"
- [ ] Social media and Google Business Profile URLs
- [ ] Access to Google Analytics, Tag Manager, Search Console and Bing Webmaster Tools
- [ ] Real Google reviews, if they should appear
- [ ] Which pages rank today and the target keywords, for the SEO work

## 7. Screenshots index

Files are in `qa/screens/`.

| Page | 390 | 1440 |
|---|---|---|
| Home | `home-390.png` | `home-1440.png` |
| Hero, second slide | `hero-slide2-390.png` | `hero-slide4-1440.png` |
| Model | `model-bondi-390.png` | `model-bondi-1440.png` |
| FAQ | `faq-390.png` | `faq-1440.png` |
| Cost | `cost-390.png` | `cost-1440.png` |
| Form | `quote-390.png`, `form-done-390.png` | `quote-1440.png`, `form-done-1440.png` |
| Mobile drawer | `drawer-expanded-390.png` | Not applicable |

Also there: every core page at 360, 414, 768 and 844, and every H1 at 360 (`h1-*-360.png`).

## 8. AEO sample

The 20 FAQ answers checked include the requested 10. Weak openings, by first sentence:

| Question | First sentence |
|---|---|
| Do you offer energy-efficient options? | "Yes." |
| Can I get a tanning ledge, spa, heater or salt system? | "Yes." |
| Can I see a pool you already built? | "Yes." |
| Do I need permits, and will you handle them? | "Yes, and yes." |
| Why are your prices better…? | "Because we don't subcontract." |

Several of these are Fabio's own wording, so changing them is his call. Strongest are the cost, ownership and warranty answers, which include numbers and name Jacksonville or Barrier Reef.

Articles: all 11 were scanned by script, including the 3 requested. The byline is "iTop Pools crew", a team rather than a named author.

## 9. Claims check

| Claim | Result |
|---|---|
| Lifetime Limited Structural Warranty, transferable once | Matches [Barrier Reef's warranty page](https://www.brpoolsusa.com/support/our-warranty/) |
| 15-year finish warranty against blistering | Matches the same page |
| US plant in Timmonsville, opened 2009 | Matches [Barrier Reef's About page](https://www.brpoolsusa.com/about/) |
| Founded 1984; 3,500+ pools a year | Found via a search of brpoolsusa.com, labelled as a manufacturer figure. Not on the About page, and I didn't confirm it on the source page |
| **2–6 week install** | **Not found on the Barrier Reef pages checked.** It came from your brief |
| 15+ years, hundreds of projects | Matches itoppools.com's own text, not independently verified |
| "Licensed & insured" | No license number to support it yet |
| iTop warrants its installation work; terms "in your written agreement" | Unconfirmed |
| "Within one business day"; "every call is answered by someone who builds pools" | Unconfirmed |
| Cost ranges, liner costs, "Typically 1–3 weeks" for deck work | Published guides of mixed quality, or unconfirmed |
| "Typical builder" comparison (rotating subs, web form only) | Generalisations about competitors, unverified |

## 10. Test limits

- **Browsers:** Chrome with touch emulation and software 3D. No real phones, and no Safari engine in this run, so Android and iOS behaviour isn't fully proven.
- **Build tested:** a rebuild of `6572c7a`. It differs from the committed and live files at the photo index, whose order changes each build. I compared only up to that first difference. The live site was checked by URL and Lighthouse in this run, and by page load and slideshow tests after the last deploy.
- **Click test:** buttons on 12 core pages at 2 sizes. Other models and articles had their links validated, and all 22 models had their tabs clicked.
- **Not testable here:** iOS keyboard with the sticky Continue bar, and the full-screen button on iPhone, where Safari's support for this is limited.
- **Reference files missing:** `SEO-AUDIT.md`, `KEYWORD-MAP.md`, `CONTENT-PLAN.md` and `vercel.json`.
- **Test artifacts, not graded as bugs:** the Colour lab intro appeared slowly but did appear; a centred-card click failed only straight after a broken drag or in a timing-sensitive run; a Full screen "no effect" came from a scripted click, and a real tap worked.

## Appendix A: Image inventory

All 33 are real photographs from the sources listed. No leftover social-media crops remain, and no placeholders are in use. Whether they look stock or AI-made was judged by eye and by source, not by a detector.

| File | Where used | Alt text | Source |
|---|---|---|---|
| models/aussie.jpg | hero; home carousel, finder card, model page | Aussie fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/billabong-cove.jpg | home carousel, finder card, model page | Billabong Cove fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/billabong-splash.jpg | home carousel, finder card, model page | Billabong Splash fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/bondi.jpg | home carousel, finder card, model page; article image | Bondi fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/castaway.jpg | hero; home carousel, finder card, model page; article image | Castaway fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/coral-cay.jpg | home carousel, finder card, model page; article image | Coral Cay Plunge fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/coral-sea.jpg | hero; home carousel, finder card, model page | Coral Sea fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/crispin.jpg | home carousel, finder card, model page | Crispin Plunge fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/outback-escape.jpg | home carousel, finder card, model page | Escape Plunge fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/grande.jpg | home carousel, finder card, model page | Grande fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/laguna.jpg | home carousel, finder card, model page | Laguna fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/milano.jpg | home carousel, finder card, model page | Milano fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/oasis.jpg | hero; home carousel, finder card, model page | Oasis fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/opal.jpg | home carousel, finder card, model page | Opal fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/outback-dundee.jpg | home carousel, finder card, model page | Outback Dundee fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/outback.jpg | home carousel, finder card, model page; article image | Outback Lounger fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/oyster.jpg | home carousel, finder card, model page | Oyster fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/pixie.jpg | home carousel, finder card, model page | Pixie Plunge fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/southport.jpg | hero; home carousel, finder card, model page | Southport fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/sudbury.jpg | home carousel, finder card, model page | Sudbury fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/sydney-harbour.jpg | home carousel, finder card, model page | Sydney Harbour fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| models/whitsunday.jpg | hero; home carousel, finder card, model page; article image | Whitsunday fiberglass pool installed in a backyard | Barrier Reef Pools USA |
| projects/castaway-1.webp | home gallery, Our Work | Castaway with pavilion and outdoor kitchen | iTop Pools website |
| projects/billabong-cove-1.webp | home gallery, Our Work | Billabong Cove above a rural fenced yard | iTop Pools website |
| projects/crispin-plunge-1.webp | home gallery, Our Work | Crispin plunge pool with stone wall and fire pit | iTop Pools website |
| projects/outback-dundee-1.webp | home gallery, Our Work | Outback Dundee between lawn and pool deck | iTop Pools website |
| projects/whitsunday-1.webp | home gallery, Our Work; article image | Whitsunday with raised spa and outdoor living | iTop Pools website |
| projects/cube-sundeck-1.webp | home gallery, Our Work | Freeform pool with cube sundeck and pavers | iTop Pools website |
| projects/bondi-1.webp | home gallery, Our Work | Bondi on a travertine deck by the water | iTop Pools website |
| projects/sydney-harbour-1.webp | home gallery, Our Work | Sydney Harbour on a travertine deck | iTop Pools website |
| projects/oyster-1.webp | home gallery, Our Work | Oyster behind a safety fence | iTop Pools website |
| projects/grande-1.webp | home gallery, Our Work; article image | Grande with spa inside a screen enclosure | iTop Pools website |
| projects/coral-sea-1.webp | home gallery, Our Work | Coral Sea with paver deck | iTop Pools website |
