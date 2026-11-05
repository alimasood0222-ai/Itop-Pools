# iTop Pools SEO and AEO audit

Audited 5 November 2026 against the live preview (commit `e099cf9`) and the current itoppools.com. Raw results are in `qa/logs/seo-audit.json`. An "after" section will be added once the work is done.

## Summary

The brief assumes a single page with hash routes. That was true until the last round of fixes. **The preview now has 43 real pages, so most of Step 1 and Step 2 exists.** The biggest remaining gaps are:

1. Content depth and pages the brief asks for that don't exist yet
2. Phone speed
3. Facts and first-hand detail that only Fabio can supply

Nothing here changes rankings until the new site replaces the old one on itoppools.com. The preview is deliberately `noindex`.

## 1. Crawlability

| Site | Pages a crawler can reach | Notes |
|---|---|---|
| Old itoppools.com | 3 | `/`, `/pool-models.html`, `/get-a-quote.html` |
| Preview | 43 | One HTML file per URL, 0 `#/` links, blocked from indexing until launch |

**Problem on the old site today:** its sitemap and canonical tags point to `/pool-models/`, `/services/` and `/get-a-quote/`, and all three return 404. The working pages are the `.html` versions. So it's telling search engines that its real pages are broken URLs.

**What's actually indexed is unconfirmed.** A `site:itoppools.com` search through my tool returned nothing from the domain, which doesn't prove much, because that tool doesn't behave like Google. Search Console will settle it.

**"Fabio shows up first in ChatGPT" is unconfirmed.** I haven't tested it, and my general search found no pages about iTop Pools as a Barrier Reef dealer or any reviews of it. The closest result was a BuildZoom listing for iTop Builder LLC in St. Johns, with no reviews. Log the real answers before launch, so there's a baseline to compare against.

## 2. Text available without JavaScript

| Template | Words in raw HTML | Words visible with JS off (390px) |
|---|---|---|
| Home | 1,770 | 241 (see note) |
| Finder | 646 | 431 |
| Model (Bondi) | 458 | 330 |
| Cost | 500 | 380 |
| FAQ | 1,692 | 1,560 |
| Pool School hub | 613 | 493 |
| Article (cost guide) | 601 | 480 |
| Comparison article | 665 | 540 |
| Why iTop | 1,008 | 886 |
| Gallery | 405 | 286 |
| Form | 711 | 189 |

Note: the home figure is probably low because its lower sections use `content-visibility`, which that measurement may skip. I'll verify this when building `seo-check`.

The content is there, but it's thin for the goal. Model pages share 87% of their vocabulary with each other, and each has only a one-sentence description.

## 3. Performance

Live site, mobile Lighthouse, median of 3 runs on 4 November, on a busy test machine.

| Template | Perf | LCP | TBT | CLS | Weight | Target met? |
|---|---|---|---|---|---|---|
| Home | 65 | 3.0 s | 888 ms | 0.013 | 463 KiB | No |
| Model | 80 | 3.0 s | 417 ms | 0 | 364 KiB | No |
| Cost | 81 | 2.3 s | 493 ms | 0.075 | 233 KiB | Perf no, LCP yes |
| FAQ | 76 | 2.3 s | 582 ms | 0.081 | 237 KiB | Perf no, LCP yes |
| Form | 78 | 1.4 s | 540 ms | 0.028 | 235 KiB | Perf no, LCP yes |

Accessibility and Best Practices are 100 on all five. SEO measures 100 in a launch build, and the preview loses points only because it's `noindex`.

The brief's 1.7 MB figure is out of date: pages now weigh 233–463 KiB. The current problem is **main-thread work**, from one 261 KB script that carries every page's markup on every page.

## 4. Old URLs to redirect

| Old URL | Status today | New target | Redirect in place? |
|---|---|---|---|
| `/` | 200 | `/` | Not needed |
| `/pool-models.html` | 200 | `/fiberglass-pools/` | Yes, 301 |
| `/get-a-quote.html` | 200 | `/free-3d-design/` | Yes, 301 |
| `/pool-models/` | 404, but in its sitemap | `/fiberglass-pools/` | Yes, 301 |
| `/get-a-quote/` | 404, but in its sitemap | `/free-3d-design/` | Yes, 301 |
| `/services/` | 404, but in its sitemap | `/process-and-warranty/` | Yes, target will change |
| `/#faq` | Home page section | `/faq/` | Partly: lands on the shorter home FAQ |

`/#faq` can't be redirected by the server, because browsers don't send the `#` part. It needs a small script on the home page.

## 5. Gaps against the brief

### Pages

| Required | Status |
|---|---|
| Home, finder, 22 models, colors, 3D, FAQ, Pool School, gallery, form | Exist |
| `/pool-cost-jacksonville/` | Exists as `/pool-cost/`: rename and expand |
| `/process-and-warranty/` | Exists as `/why-itop/`: rename |
| `/fiberglass-vs-concrete-vs-vinyl/` | Exists as an article: move and expand |
| `/pool-financing/` | Missing: financing is a section of the cost page |
| Shape hubs (4) | Missing |
| `/about/`, `/service-areas/`, `/privacy/`, `/terms/` | Missing |

Renaming costs nothing now, because the preview isn't indexed.

### Technical

| Item | Status |
|---|---|
| `sitemap.xml`, image entries, `robots.txt` with AI bots, `llms.txt`, `llms-full.txt`, IndexNow, 404, 301s, canonicals, preview `noindex`, breadcrumbs | Done |
| `lang` | `en`: change to `en-US` |
| Image width and height | **Missing on all images** |
| Descriptive image filenames | Not yet: images are named like `m-bondi-1200.webp` |
| `apple-touch-icon` | Missing |
| `<address>` for NAP | Missing |
| Security headers | HSTS only: no `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` or `Permissions-Policy` |
| `cleanUrls` | Not set |
| Critical CSS inlined | No: the full stylesheet blocks rendering |
| three.js only where used | Partly: it loads on demand, but the 3D code is in the shared script |
| `npm run seo-check` with JSON-LD lint | Missing |

### Structured data

| Item | Status |
|---|---|
| WebSite, Organization, BreadcrumbList, FAQPage, Article | Present |
| Product per model | Present, no fake offers. Needs `isRelatedTo` |
| Business | **Weaker than the old site:** no `geo`, `logo`, `image` or `hasOfferCatalog`, and `areaServed` is plain text where the old site used `City` |
| `sameAs`, `founder`, Article author (a person) | Need Fabio's details |
| HowTo, Service | Missing |

### On-page and content

| Item | Now | Brief |
|---|---|---|
| Home H1 | "Dive into your backyard, before we dig it." No keyword | Keyword led |
| Old home title | "Pool Builder in Jacksonville, FL \| Fiberglass Pools & Pavers \| iTop Pools" | Keep its ranking strengths |
| FAQ questions | 21, in buttons rather than headings | 30–40, as H2/H3 headings |
| FAQ answers | 5 of 20 sampled had 40–60 word openings | All answer-first |
| Model description | About 20 words | 150–300 unique words, plus who it suits, yard size and its own FAQ |
| Articles | 11, about 92–248 words of body text before takeaways were added | 16 now, 20 over time |
| Cost page | Estimator and financing basics | Full guide with line items and ownership tables |
| Service area | Includes Middleburg, omits Fernandina Beach | Brief's 12 cities |
| Map embed | None | Footer or contact block |
| Events | 5 fire | Add email click and color lab use, plus ZIP on `generate_lead` |

## 6. What won't work without Fabio

These can't be written honestly from here, and the brief rules out inventing them:

- HOA approval times, permitting experience and local project detail
- Named author, bio and photo for articles, and the "Reviewed by" person
- City pages' local projects, reviews and lot-size advice
- Real prices and example project price bands
- Confirmation that iTop is listed in Barrier Reef's dealer finder. My search didn't confirm this, and the site states it on every page

## 7. Realistic expectations

- **No one can guarantee ranking first or being cited by AI answers.** This work makes the site eligible and easy to quote. Off-site signals, especially the Google Business Profile and reviews, will likely matter as much for local searches.
- **FAQ rich results won't appear in Google**, as the brief notes. The markup is still useful for machine reading.
- **`llms.txt` is low cost and low certainty.** I'm not aware of evidence that major engines rely on it, so treat it as a small extra.
- **The launch itself is the riskiest step.** It's when the old URLs move, so it needs a checklist and monitoring.

Sources for the search notes: [BuildZoom: iTop Builder LLC](https://www.buildzoom.com/contractor/itop-builder-llc)
