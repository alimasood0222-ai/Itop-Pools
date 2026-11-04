# Photos needed

Every photo on the site is listed in `src/data/photos.json`. To replace one, put the new file in `src/assets/img/projects/` (iTop's own work) or `src/assets/img/models/` (official Barrier Reef photos), update its entry and run `npm run build`. Originals should be at least 2000 px wide. The build makes the smaller sizes.

## What's on the site today

These are stand-ins until Fabio supplies or approves final photos.

| Used for | Files | Source | Needs |
|---|---|---|---|
| Hero and every model page | `models/*.jpg` (22) | brpoolsusa.com | Fabio to confirm iTop may use them as a Barrier Reef dealer |
| Gallery, Our Work | `projects/*.webp` (11) | itoppools.com | Fabio to confirm which are iTop's own builds, and the neighborhood for each |

Several of the `projects/` photos are only 640 px wide, so they look soft when opened full screen.

None of the photos show families or kids. Fabio asked for families in the hero, so that's the most important gap.

## Priority 1: hero slides (6)

Full-bleed, landscape, at least 2400 px wide. Keep the left third fairly calm, because the headline sits there. On phones the center of the photo is what shows.

| Slot | Ideal shot |
|---|---|
| Hero 1 | Family in a finished iTop pool, wide shot from the lanai, golden hour |
| Hero 2 | Kids jumping in or playing on the tanning ledge, parents nearby, midday sun |
| Hero 3 | Couple or friends lounging on an in-water ledge with drinks, afternoon |
| Hero 4 | Grandparents and grandkids on the steps, relaxed and candid |
| Hero 5 | Evening with LED pool lights on and a family at the outdoor kitchen |
| Hero 6 | Aerial of a finished iTop pool, deck and screen enclosure, with people in the water |

Get a signed release from any family shown, especially for children. Add each slide's ID to `hero` in `src/data/site.json`.

## Priority 2: Our Work gallery

Real iTop projects, with a caption, model and neighborhood for each:

- Fiberglass pool: wide shot and aerial
- Spa or water feature, running
- Paver or travertine deck, close enough to show the craftsmanship
- Screen enclosure, from inside and outside
- Outdoor kitchen next to a finished pool
- Before and after of the same yard
- The iTop crew on site: excavation, the shell being set, the deck going in

## Priority 3: model pages

One iTop install per model is ideal, shown as an aerial plus a poolside shot. Start with the models Fabio sells most. If there's no iTop install, the Barrier Reef photo stays.

Aussie, Billabong Cove, Billabong Splash, Bondi, Castaway, Coral Cay Plunge, Coral Sea, Crispin Plunge, Escape Plunge, Grande, Laguna, Milano, Oasis, Opal, Outback Dundee, Outback Lounger, Oyster, Pixie Plunge, Southport, Sudbury, Sydney Harbour, Whitsunday

## Priority 4: Pool School articles

Each article currently borrows a model photo. Better matches:

| Article | Ideal shot |
|---|---|
| Fiberglass vs concrete vs vinyl | A shell being lifted into place |
| Cost guide | Finished pool with deck and enclosure |
| Permits | Crew member with plans at a site |
| Choosing a finish | Three pools side by side in different finishes |
| Your first 30 days | Water testing at handover |
| Hurricane prep | A pool and enclosure, in calm weather |
