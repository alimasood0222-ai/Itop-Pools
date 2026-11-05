# Off-site checklist for Mahnoor and Fabio

The website can't do these for you, and several matter as much as the site itself for local search. Do them in this order. Use exactly this name, address and phone everywhere:

> iTop Pools
> 6510 Columbia Park Drive, Suite 206, Jacksonville, FL 32258
> (904) 685-2555

## 1. Before launch: record where you stand today

Without this, you can't show whether the new site helped.

1. Ask ChatGPT, Perplexity, Gemini and Google the 15 questions in step 8.
2. Save the answers and note whether iTop is mentioned.
3. Connect Google Search Console to the current itoppools.com and export the top pages and queries.

## 2. Barrier Reef dealer listing

1. Find iTop in the dealer finder at brpoolsusa.com. **Confirm this first, because the site says "authorized dealer" on every page.**
2. Ask Barrier Reef to fix any details that don't match the box above.
3. Ask for a link to the iTop site. It's a highly relevant link from the manufacturer.

## 3. Launch the new site

1. Set `SITE_ENV=live` in Vercel, then redeploy.
2. Point itoppools.com to the project, and check that `/pool-models.html` and `/get-a-quote.html` redirect.
3. In Search Console and Bing Webmaster Tools, verify the site and submit `https://itoppools.com/sitemap.xml`.
4. Run `node scripts/indexnow.js` to notify Bing and other IndexNow search engines.
5. Watch Search Console's indexing and 404 reports weekly for the first two months.

## 4. Google Business Profile

This is likely the biggest factor for local rankings.

1. Claim or verify the profile, and set the primary category to "Swimming pool contractor". Add relevant secondary categories.
2. Add every service and service area.
3. Link the website with tracking: `https://itoppools.com/?utm_source=google&utm_medium=gbp`.
4. Add photos of real projects every week.
5. Answer common customer questions, using the FAQ as a guide.
6. Post twice a month.
7. Reply to every review.

## 5. Reviews

1. Set up a GoHighLevel automation that asks for a review after each project milestone.
2. Ask customers, without scripting them, to mention what you built and where: the model, the city, the crew.
3. Never buy reviews or offer rewards for them. It breaks Google's rules.
4. Tell us once there are real reviews, so we can show them on the site.

## 6. Citations

Create or fix these listings with the exact details above:

- [ ] Bing Places
- [ ] Apple Business Connect
- [ ] Yelp
- [ ] BBB
- [ ] Houzz
- [ ] Angi
- [ ] Nextdoor
- [ ] Facebook
- [ ] Jacksonville Chamber of Commerce
- [ ] Florida Swimming Pool Association `[CONFIRM membership]`

Send us the URLs, and we'll add them to the site's structured data (`sameAs`).

## 7. Local links and PR

- [ ] HOA newsletters in Nocatee, Julington Creek and Ponte Vedra
- [ ] Sponsoring local home shows
- [ ] Partner links with landscapers, realtors and enclosure suppliers
- [ ] Project features on Houzz

## 8. Monthly AI visibility check

Once a month, ask ChatGPT, Perplexity, Gemini and Google (AI Overviews) these questions. Log whether iTop is cited, and which page.

1. Best fiberglass pool builder in Jacksonville
2. How much is a fiberglass pool in Jacksonville
3. Barrier Reef pool dealer near Jacksonville
4. Fiberglass vs concrete pool in Florida
5. Fiberglass pool builder in Ponte Vedra
6. Fiberglass pool builder in Nocatee
7. Fiberglass pool builder in St. Augustine
8. How long does it take to install a fiberglass pool
9. Are fiberglass pools good in Florida
10. Fiberglass pools and high water tables
11. Barrier Reef pool warranty
12. Best pool size for a Jacksonville backyard
13. Do I need a permit for a pool in St. Johns County
14. How much maintenance does a fiberglass pool need
15. Pool financing options in Florida

AI answers vary between runs and users, so look at the trend over months, not a single result.
