// Final check on the real live URL: all 43 pages in Safari's engine (phone) and Chrome (laptop).
const { launch, pw, models, ARTICLES, log, shot } = require('./lib');
const B = 'https://itop-pools.vercel.app';
const R = []; const ok = (c, m, x = '') => { R.push({ c, m, x }); console.log((c ? 'PASS ' : 'FAIL ') + m + (x ? ' -> ' + x : '')); };
const watch = async (p, ms) => { const s = new Set(); const t = Date.now(); while (Date.now() - t < ms) { s.add(await p.textContent('#hsCap')); await p.waitForTimeout(400); } return s; };
const PAGES = ['/', '/fiberglass-pools/', '/3d-pool-design/', '/pool-colors/', '/pool-cost/', '/pool-school/', '/our-work/', '/why-itop/', '/free-3d-design/', '/faq/', ...models.map(m => `/fiberglass-pools/${m.id}/`), ...ARTICLES.map(a => `/pool-school/${a}/`)];
(async () => {
  const wk = await pw.webkit.launch(), cr = await launch();
  const iphone = await wk.newContext({ ...pw.devices['iPhone 13'] }), laptop = await cr.newContext({ viewport: { width: 1440, height: 900 } });
  iphone.setDefaultTimeout(40000); laptop.setDefaultTimeout(40000);
  const a = await iphone.newPage(); await a.goto(B + '/', { waitUntil: 'load', timeout: 60000 }); await a.waitForTimeout(800); await a.screenshot({ path: shot('live-home-iphone') }); await a.tap('.h-title'); let s = await watch(a, 15000); ok(s.size >= 3, 'iPhone engine: slideshow runs after a tap', [...s].join(', '));
  await a.tap('#burger'); await a.waitForTimeout(600); await a.tap('#drawer a[href="/pool-cost/"]'); await a.waitForTimeout(1800); ok(a.url().endsWith('/pool-cost/'), 'iPhone engine: drawer navigates to real URL', a.url()); await a.close();
  const d = await laptop.newPage(); await d.goto(B + '/', { waitUntil: 'load', timeout: 60000 }); await d.mouse.move(700, 400); s = await watch(d, 15000); ok(s.size >= 3, 'laptop: slideshow runs with mouse on hero', [...s].join(', ')); await d.screenshot({ path: shot('live-home-1440') }); await d.close();
  const nf = await laptop.newPage(); const r = await nf.goto(B + '/nope-404/', { timeout: 60000 }); ok(r.status() === 404 && (await nf.textContent('h1')).includes("isn't here"), 'custom 404 page', String(r.status())); await nf.close();
  const fonts = new Set();
  for (const [dev, ctx] of [['iPhone engine', iphone], ['laptop', laptop]]) {
    let bad = 0;
    for (const path of PAGES) {
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message)); p.on('response', x => { if (x.status() >= 400) errs.push(x.status() + ' ' + x.url().replace(B, '')); if (/\.woff2/.test(x.url())) fonts.add(x.url().replace(B, '')); });
      await p.goto(B + path, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(path.includes('3d-pool') ? 3000 : 900);
      const m = await p.evaluate(() => ({ r: document.querySelector('.route.on')?.dataset.route, over: document.documentElement.scrollWidth > innerWidth + 1, no3d: document.body.classList.contains('no3d'), broken: [...document.images].filter(i => i.complete && i.currentSrc && !i.naturalWidth).length, h1: document.querySelectorAll('.route.on h1').length }));
      if (errs.length || m.over || m.no3d || m.broken || !m.r || m.h1 !== 1) { bad++; console.log('  PROBLEM', dev, path, JSON.stringify(m), errs.slice(0, 2).join(' | ')); }
      await p.close();
    }
    ok(!bad, `${dev}: all ${PAGES.length} live pages clean`);
  }
  ok(fonts.size <= 4, 'self-hosted fonts only', [...fonts].join(' '));
  await wk.close(); await cr.close(); log('livefinal', R); console.log(`\n${R.filter(x => x.c).length} passed, ${R.filter(x => !x.c).length} failed`);
})().catch(e => { console.error('CRASH', e.message.slice(0, 400)); process.exit(1); });
