// B1 + D9: validates every internal link target, finds dead links and buttons that do nothing, builds the link graph.
const { serve, ALL, CORE, models, ARTICLES, ctxOpts, launch, log, settle } = require('./lib');
const IDS = new Set(models.map(m => m.id)), ARTS = new Set(ARTICLES), ROUTES = new Set(['pools', 'studio', 'colours', 'learn', 'cost', 'work', 'why', 'quote', 'faq']);
const SL = { 'fiberglass-pools': 'pools', 'pool-school': 'learn', '3d-pool-design': 1, 'pool-colors': 1, 'pool-cost': 1, 'our-work': 1, 'why-itop': 1, 'free-3d-design': 1, faq: 1 };
const valid = h => { const p = h.split(/[?#]/)[0].split('/').filter(Boolean); if (!p.length) return true; if (!SL[p[0]]) return false; if (p[0] === 'fiberglass-pools' && p[1]) return IDS.has(p[1]); if (p[0] === 'pool-school' && p[1]) return ARTS.has(p[1]); return true; };
(async () => {
  const { srv, base } = await serve(); const br = await launch();
  const out = { deadHref: [], invalidTargets: [], noEffect: {}, errors: [], clicked: {}, graph: {}, noFormLink: [], anchors: [] };
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const ctx = await br.newContext(ctxOpts(w, h));
    for (const [name, url] of Object.entries(w === 1440 ? ALL : CORE)) {
      const p = await ctx.newPage(); const where = `${name}@${w}`;
      p.on('pageerror', e => out.errors.push(`${where}: ${e.message}`));
      p.on('response', r => { if (r.status() >= 400) out.errors.push(`${where}: HTTP ${r.status()} ${r.url().replace(base, '')}`); });
      await settle(p, url, base, 1000);
      const route = await p.evaluate(() => document.querySelector('.route.on')?.dataset.route);
      const links = await p.evaluate(() => [...document.querySelectorAll('.route.on a[href], footer a[href], #nav a[href]')].map(a => ({ h: a.getAttribute('href'), t: a.textContent.trim().slice(0, 30), faq: a.hasAttribute('data-faq') })));
      links.forEach(l => { if (l.h === '#' || l.h === '') out.deadHref.push(`${where}: "${l.t}"`); else if (l.h.startsWith('/') && !valid(l.h)) out.invalidTargets.push(`${where}: ${l.h}`); else if (l.h.startsWith('#')) out.anchors.push(`${where}: ${l.h}`); });
      if (w === 1440) { out.graph[url] = [...new Set(await p.evaluate(() => [...document.querySelectorAll('.route.on a[href]')].map(a => a.getAttribute('href')).filter(h => h.startsWith('/'))))]; if (!out.graph[url].some(x => x.startsWith('/free-3d-design/')) && route !== 'quote') out.noFormLink.push(url); }
      if (name.startsWith('article-') && name !== 'article-cost-guide' || (name.startsWith('model-') && name !== 'model-bondi')) { await p.close(); continue; }
      // click every visible button; anything that neither mutates the DOM nor changes the URL did nothing
      const tag = () => p.evaluate(() => { document.querySelectorAll('[data-ck]').forEach(e => e.removeAttribute('data-ck')); const els = [...document.querySelectorAll('.route.on button:not([disabled])')].filter(e => e.offsetParent); els.forEach((e, i) => e.setAttribute('data-ck', i)); return els.length; });
      const n = await tag(); let done = 0;
      await p.evaluate(() => { window.__m = 0; new MutationObserver(l => window.__m += l.length).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true }); });
      for (let i = 0; i < n; i++) {
        const el = p.locator(`[data-ck="${i}"]`).first(); if (!(await el.count())) continue;
        const lab = await el.evaluate(e => (e.getAttribute('aria-label') || e.textContent).trim().replace(/\s+/g, ' ').slice(0, 28)).catch(() => '?');
        const before = await p.evaluate(() => [window.__m, location.href, document.querySelector('.route.on')?.dataset.route]);
        await el.evaluate(e => e.click()).catch(() => {}); await p.waitForTimeout(40); done++;
        const after = await p.evaluate(() => [window.__m, location.href, document.querySelector('.route.on')?.dataset.route]);
        if (after[0] === before[0] && after[1] === before[1]) (out.noEffect[name] = out.noEffect[name] || []).push(lab);
        if (after[2] !== route) { await p.goto(base + url); await p.waitForTimeout(600); await tag(); await p.evaluate(() => { window.__m = 0; new MutationObserver(l => window.__m += l.length).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true }); }); }
      }
      out.clicked[where] = done; await p.close();
    }
    await ctx.close(); console.log('done', w);
  }
  // orphans: pages nobody links to, starting from all pages' + nav links
  const all = Object.values(out.graph).flat().map(h => h.split(/[?#]/)[0]); out.orphans = Object.values(ALL).filter(u => u !== '/' && !all.includes(u));
  await br.close(); srv.close(); log('clicks', out);
  console.log(JSON.stringify({ deadHref: [...new Set(out.deadHref)], invalid: [...new Set(out.invalidTargets)], errors: [...new Set(out.errors)].slice(0, 30), noEffect: out.noEffect, totalClicks: Object.values(out.clicked).reduce((a, b) => a + b, 0), clicked: out.clicked, noFormLink: out.noFormLink, orphans: out.orphans, anchors: [...new Set(out.anchors.map(a => a.split(': ')[1]))] }));
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
