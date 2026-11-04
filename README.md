# iTop Pools: website v2 (design mockup)

A multi-page, single-file website for iTop Pools (Jacksonville, FL). It includes an underwater hero, a 3D pool design studio (three.js), a colour lab, a model finder and carousel, a cost estimator, Pool School articles and a 6-step enquiry form.

## Quick start (VS Code)

1. Open this folder in VS Code.
2. Install [Node.js](https://nodejs.org) (any recent version). There are no npm packages to install.
3. In the terminal:
   ```bash
   npm run dev      # builds dist/index.html and rebuilds whenever you save a file in src/
   ```
4. Open `dist/index.html` in Chrome. The **Live Server** extension is handy: right-click the file and choose *Open with Live Server*. It reloads on every rebuild.

Run `npm run build` for a single build.

> **Always edit files in `src/`.** `dist/index.html` is generated, so changes made there are overwritten on the next build.

## Project structure

```
src/
  body.html                    All page markup (every route is a <div class="route" data-route="…">)
  css/
    01-base.css                Design tokens (colours, radii, fonts), buttons, nav, hero, home sections
    02-pages.css               Inner pages: finder, model page, colour lab, learn, estimator, work, why, quote
    03-type-motion-form.css    Typography polish, scroll animations, enquiry form
    04-carousel.css            Home "collection" 3D carousel
  js/                          Joined in name order into ONE scope (01 opens it, the build closes it)
    01-engine.js               three.js scenes: 3D backyard (PoolScene), underwater hero, finishes
    02-data-studio-lab.js      Data (models, articles, FAQ, pricing), studio + colour-lab UI
    03-pages-router.js         Page logic, enquiry form, motion layer, hash router
  assets/img/                  Photos. Reference one as {{IMG:filename}} in CSS/HTML, or IMG.filename in JS
  assets/fonts/                Inter Tight, Inter, Instrument Serif (self-hosted, inlined at build)
  vendor/three.min.js          three.js r149
build.js                       Zero-dependency build: inlines everything into dist/index.html
dist/index.html                The finished site (send this file / upload it)
```

## Common edits

| What | Where |
|---|---|
| Phone, address, email | `src/body.html` (search `685-2555`, `Columbia Park`) |
| Brand colours | `:root` at the top of `src/css/01-base.css` |
| Pool models and specs | `MODELS` in `src/js/02-data-studio-lab.js` |
| Finish colours (3D + lab) | `FINISH` in `src/js/01-engine.js`, names/descriptions in `FIN_META` |
| Estimator prices (**demo numbers**) | `PRICE` in `src/js/02-data-studio-lab.js` |
| Pool School articles | `ARTS` in `src/js/02-data-studio-lab.js` |
| FAQ | `FAQ` in `src/js/02-data-studio-lab.js` |
| Gallery photos | add a file to `src/assets/img/`, then add it to `GAL` in `02-data-studio-lab.js` |
| Enquiry form steps | `data-route="quote"` in `body.html` + the `QUOTE` section of `03-pages-router.js` |

## Connecting the form to GoHighLevel

The form currently shows the success screen without sending anything. To connect it, open `src/js/03-pages-router.js` and find `function qGo`. When `Q.step` reaches `6`, POST the brief to a GHL inbound webhook (Automation, then Workflow, then trigger *Inbound Webhook*):

```js
fetch('YOUR_GHL_WEBHOOK_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: $('#qFn').value, last_name: $('#qLn').value,
    phone: $('#qPh').value, email: $('#qEm').value,
    postal_code: $('#qZip').value,
    project: [...Q.project].join(', '), model: Q.model, must_haves: [...Q.musts].join(', '),
    timing: Q.when, budget: Q.budget, hoa: Q.hoa, existing: Q.existing,
    visit_day: Q.day, visit_slot: Q.slot, call_first: Q.callFirst,
    contact_pref: Q.contact, notes: $('#qNotes').value, sms_consent: $('#qSms').checked
  })
});
```

Yard photos (`Q.files`) are data URLs held in the browser. Upload them to GHL media, or send them to a file endpoint, before including them.

## Before going live

- Replace the demo pricing in `PRICE` with iTop's real price book.
- Fill in the `[iTop to confirm term]` placeholders (workmanship warranty) and the license number in the footer.
- Add real project photos and connect the Google reviews widget (the reviews section is a layout preview).
- Remove the "Design mockup · v2" badge: `.mock-flag` in `body.html`.
- Gallon figures marked "≈ est." are estimates. Only the Bondi's 17,600 gal comes from the Barrier Reef spec sheet.

## Notes

- Routing uses `#/…` hashes (e.g. `#/pools/bondi`, `#/quote?m=bondi`). Clicks are handled in JS, so it also works inside sandboxed previews.
- Adding `?test` to the URL slows the render loop. It's used for automated screenshots.
- Animations respect the visitor's *reduce motion* setting.
