// A3: live Barrier Reef pages vs models.json vs what the site renders. Also every list of models on the site.
const { serve, models, ctxOpts, launch, log, settle, shot, fs, path } = require('./lib');
const UA = { headers: { 'User-Agent': 'Mozilla/5.0' } };
const clean = s => s.replace(/&#8242;|&#8217;/g, "'").replace(/&#8221;/g, '"').replace(/&#8243;/g, '"').replace(/&#038;/g, '&').replace(/â€™/g, "'").replace(/[’′]/g, "'").replace(/[”″]/g, '"').replace(/''/g, '"').replace(/½/g, '.5').trim();
const strip = h => h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, '\n').split('\n').map(s => clean(s)).filter(Boolean);
const key = s => (s || '').replace(/\s+/g, '').replace(/^Walkin:/i, 'Walk-in').toLowerCase().replace('walk-in', 'walkin');
(async () => {
  const designs = await (await fetch('https://www.brpoolsusa.com/fiberglass-pools-spas/pool-designs/', UA)).text();
  const liveSlugs = [...new Set([...designs.matchAll(/brpoolsusa\.com\/pools\/([\w-]+)\//g)].map(m => m[1]))].filter(s => s !== 'pool-designs');
  const dataSlugs = models.map(m => m.id);
  const list = { liveCount: liveSlugs.length, onLiveNotOurs: liveSlugs.filter(s => !dataSlugs.includes(s)), oursNotOnLive: dataSlugs.filter(s => !liveSlugs.includes(s)) };
  const diffs = [], rows = [];
  const { srv, base } = await serve();
  const br = await launch(); const ctx = await br.newContext(ctxOpts(1440, 900));
  for (const m of models) {
    let raw = ''; for (let a = 0; a < 3; a++) { const r = await fetch(`https://www.brpoolsusa.com/pools/${m.id}/`, UA); raw = await r.text(); if (raw.includes('>Length<')) break; console.error('retry', m.id, r.status, raw.length); await new Promise(z => setTimeout(z, 3000)); } const lines = strip(raw);
    const LBL = ['Length', 'Width', 'Shallow', 'Deep', 'Lounger', 'Gallons']; const live = []; let cur = null;
    lines.forEach((l, i) => { if (l === 'Length') { cur = {}; live.push(cur); } if (cur && LBL.includes(l)) cur[l] = lines[i + 1]; });
    const p = await ctx.newPage(); await settle(p, `/fiberglass-pools//${m.id}`, base, 700);
    const tabs = await p.locator('#mdSizes button').count();
    const rendered = [];
    for (let i = 0; i < tabs; i++) { await p.locator('#mdSizes button').nth(i).click(); await p.waitForTimeout(40); rendered.push(await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('#mdSpec>div')].map(d => [d.querySelector('small').textContent.trim(), d.querySelector('b').textContent.trim()])))); }
    await p.close();
    if (live.length !== m.sizes.length) diffs.push(`${m.n}: live has ${live.length} sizes, data has ${m.sizes.length}`);
    if (tabs !== m.sizes.length) diffs.push(`${m.n}: site shows ${tabs} tabs, data has ${m.sizes.length}`);
    m.sizes.forEach((z, i) => {
      const L = live[i] || {}, R = rendered[i] || {};
      const cmp = [['Length', L.Length, z.Ls, R.Length], ['Width', L.Width, z.Ws, R.Width], ['Shallow', L.Shallow, z.Ss, R['Shallow end']], ['Deep', L.Deep, z.Ds, R['Deep end']], ['Lounger', L.Lounger, z.lounger, R.Lounger], ['Gallons', L.Gallons, z.gal == null ? null : String(z.gal), R.Water]];
      for (const [f, a, d, r] of cmp) {
        const liveV = f === 'Gallons' ? (a || '').replace(/\D/g, '') : key(a);
        const dataV = f === 'Gallons' ? (d || '') : key(d);
        const rendV = f === 'Gallons' ? (r || '').replace(/\D/g, '') : key(r);
        const noLive = !a || a === '-';
        if (noLive && (r && !/spec sheet/i.test(r))) diffs.push(`${z.label} ${f}: not on live, site shows "${r}"`);
        else if (!noLive && liveV !== dataV) diffs.push(`${z.label} ${f}: live "${a}" vs data "${d}"`);
        else if (!noLive && rendV !== dataV) diffs.push(`${z.label} ${f}: data "${d}" vs rendered "${r}"`);
      }
      rows.push({ version: z.label, live: L, rendered: R });
    });
  }
  // every list of models on the site
  const p = await ctx.newPage(); await settle(p, '/', base, 2500);
  const counts = await p.evaluate(() => { const c = s => document.querySelectorAll(s).length; return { carouselCards: c('#r2Track .r2c'), ticks: c('#r2Ticks button'), chips: [...document.querySelectorAll('#r2Fil button')].map(b => b.textContent.trim()), studioList: c('#mList .mbtn'), estimator: c('#esModels button'), quotePicker: c('#qModels button:not(.ns)'), megaMenuLinks: [...document.querySelectorAll('.mega a')].map(a => a.textContent.trim().slice(0, 28)), headlines: [...document.querySelectorAll('h2,p.lead,.feat-row span,.sp-tips span')].map(e => e.textContent).filter(t => /\b\d+\s+(shells|models|real|Barrier)/.test(t)).map(t => t.trim().slice(0, 90)) }; });
  await p.goto(base + '/fiberglass-pools/'); await p.waitForTimeout(1300);
  counts.finder = await p.textContent('#fpCount'); counts.finderCards = await p.locator('#fpCards .pc').count();
  counts.finderFilters = {};
  for (const v of ['rect', 'free', 'kidney', 'roman', 'plunge']) { await p.evaluate(x => { document.querySelector(`.fp-chips[data-f=shape] [data-v=${x}]`).click(); }, v); await p.waitForTimeout(40); counts.finderFilters[v] = (await p.textContent('#fpCount')).trim(); await p.evaluate(x => { document.querySelector(`.fp-chips[data-f=shape] [data-v=${x}]`).click(); }, v); }
  // quiz considers all
  counts.quizPool = await p.evaluate(() => 'ranked from MODELS in code, see src/js/03-pages-router.js qzShow');
  // size tabs: specs, plan, profile
  const tabsTest = {};
  for (const id of ['bondi', 'aussie']) { await p.goto(base + `/fiberglass-pools//${id}`); await p.waitForTimeout(1300); const snap = () => p.evaluate(() => ({ spec: document.querySelector('#mdSpec').innerText.replace(/\s+/g, ' '), plan: document.querySelector('#mdPlan').innerHTML, elev: document.querySelector('#mdElev').innerHTML })); const a = await snap(); await p.locator('#mdSizes button').nth(0).click(); await p.waitForTimeout(100); const x = await snap(); await p.locator('#mdSizes button').nth(1).click(); await p.waitForTimeout(100); const y = await snap(); tabsTest[id] = { a: x.spec, b: y.spec, specChanges: x.spec !== y.spec, planChanges: x.plan !== y.plan, profileChanges: x.elev !== y.elev }; await p.screenshot({ path: shot(`model-${id}-tab2-1440`) }); }
  await br.close(); srv.close();
  const res = { list, diffs, counts, tabsTest, versionsChecked: rows.length, rows };
  log('a3', res);
  console.log(JSON.stringify({ list, diffs, counts, tabsTest, versionsChecked: rows.length }, null, 1));
})().catch(e => { console.error('CRASH', e); process.exit(1); });
