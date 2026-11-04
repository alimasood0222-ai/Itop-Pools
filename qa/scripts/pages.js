// C1/C3/C5/B4/B5: every page at every viewport. Overflow, tap targets, small text, stuck-hidden content, axe, screenshots.
const { serve, ALL, CORE, VIEWPORTS, ctxOpts, launch, log, shot, settle, fs, path } = require('./lib');
const AXE = fs.readFileSync(path.join(process.argv[2], 'qatools/node_modules/axe-core/axe.min.js'), 'utf8');
(async () => {
  const { srv, base } = await serve(); const br = await launch();
  const res = { overflow: [], errors: [], tap: {}, small: {}, hidden: {}, inputs: {}, h1: {}, axe: {}, fonts: new Set(), emoji: {}, reduced: {} };
  for (const [w, h] of VIEWPORTS) {
    const ctx = await br.newContext(ctxOpts(w, h));
    const routes = (w === 390 || w === 1440) ? ALL : (w === 360 ? ALL : CORE);
    for (const [name, url] of Object.entries(routes)) {
      const p = await ctx.newPage(); const where = `${name}@${w}`;
      p.on('pageerror', e => res.errors.push(`${where}: ${e.message}`));
      p.on('console', m => { if (m.type() === 'error' && !/GL_/.test(m.text())) res.errors.push(`${where}: console ${m.text().slice(0, 140)}`); });
      p.on('response', r => { if (r.status() >= 400) res.errors.push(`${where}: HTTP ${r.status()} ${r.url().replace(base, '')}`); if (/\.woff2?|fonts\.g/.test(r.url())) res.fonts.add(r.url().replace(base, '')); });
      await settle(p, url, base, /studio|colours/.test(name) ? 1800 : 1100);
      const isCore = CORE[name] !== undefined;
      const over = await p.evaluate((iw) => { return { widened: innerWidth, sw: document.documentElement.scrollWidth, iw, els: [...document.querySelectorAll('body *')].filter(e => { if (!e.offsetParent || e.closest('.hs-stage,.r2-track,.g-track,.fq-nav,.r2-fil,.drawer,.fp-side,canvas,svg,.q-steps')) return false; const r = e.getBoundingClientRect(); return r.width && r.right > iw + 1 && r.left < iw; }).slice(0, 3).map(e => e.tagName + '.' + String(e.className).slice(0, 24)) }; }, w);
      if (over.sw > over.iw || over.widened > over.iw) res.overflow.push(`${where}: content ${over.sw}px, browser widened page to ${over.widened}px, screen ${over.iw}px: ${over.els.join(',')}`);
      if (isCore && w !== 1440) await p.screenshot({ path: shot(`${name}-${w}`) });
      if (isCore && w === 1440) await p.screenshot({ path: shot(`${name}-${w}`) });
      if (isCore && (w === 360 || w === 390 || w === 1440)) {
        // scroll the whole page like a person
        const H = await p.evaluate(() => document.documentElement.scrollHeight); const V = h; let y = 0, n = 0;
        while (y < H && n < 40) { await p.evaluate(v => scrollTo({ top: v, behavior: 'instant' }), y); await p.waitForTimeout(170); y += V - 60; n++; }
        await p.waitForTimeout(1300);
        const m = await p.evaluate((w) => {
          const route = document.querySelector('.route.on');
          const vis = e => { const c = getComputedStyle(e); return e.offsetParent && c.visibility !== 'hidden' && c.display !== 'none'; };
          const label = e => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 30);
          const tap = [...route.querySelectorAll('a[href],button,input,select,textarea,[role=switch]'), ...document.querySelectorAll('#nav button,#nav a,#mbar a')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return { l: label(e), w: Math.round(r.width), h: Math.round(r.height), inline: !!e.closest('.ans,.prose,.crumbs,p') }; }).filter(x => x.w && (x.w < 44 || x.h < 44));
          const inputs = [...route.querySelectorAll('input:not([type=range]):not([type=checkbox]):not([type=file]),select,textarea')].map(e => ({ id: e.id, size: parseFloat(getComputedStyle(e).fontSize) })).filter(x => x.size < 16);
          const small = new Map(); route.querySelectorAll('*').forEach(e => { if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; if (!vis(e) || e.closest('svg')) return; const s = parseFloat(getComputedStyle(e).fontSize); if (s < 12) { const k = s + 'px ' + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : e.tagName) + ' in ' + (e.parentElement.className || '').toString().split(' ')[0]; small.set(k, e.textContent.trim().slice(0, 30)); } });
          const hidden = [...route.querySelectorAll('.rv,.flow,.mtx,.tli,.sh,.stg-g,.ir,.stg-g>*,h1,h2,h3,p,li,img')].filter(e => { if (!e.offsetParent || e.closest('.fd-q,.qs,.hs,.ans,.r2c,.fd-res')) return false; let a = e, op = 1; while (a && a !== route) { op *= parseFloat(getComputedStyle(a).opacity); a = a.parentElement; } return op < .05; }).slice(0, 8).map(e => e.tagName + '.' + String(e.className).slice(0, 20) + ' "' + e.textContent.trim().slice(0, 30) + '"');
          const text = route.innerText; const emoji = [...new Set(text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}]/gu) || [])];
          const h1 = route.querySelector('h1'); const hr = h1 && h1.getBoundingClientRect();
          return { tap, inputs, small: [...small.entries()], hidden, emoji, h1: h1 && { text: h1.innerText.replace(/\n/g, ' | '), over: h1.scrollWidth > h1.clientWidth + 1, right: Math.round(hr.right), lines: Math.round(hr.height / parseFloat(getComputedStyle(h1).lineHeight)) }, bodyFont: parseFloat(getComputedStyle(document.body).fontSize), pFont: [...route.querySelectorAll('p')].filter(vis).reduce((a, e) => { const s = parseFloat(getComputedStyle(e).fontSize); a[s] = (a[s] || 0) + 1; return a; }, {}) };
        }, w);
        res.tap[where] = m.tap; res.small[where] = m.small; res.hidden[where] = m.hidden; res.inputs[where] = m.inputs; res.h1[where] = { ...m.h1, bodyFont: m.bodyFont, pFont: m.pFont }; res.emoji[where] = m.emoji;
        if (w === 360) { await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(250); const h1 = p.locator('.route.on h1').first(); if (await h1.count()) await h1.screenshot({ path: shot(`h1-${name}-360`) }).catch(() => {}); }
        if (w === 390 || w === 1440) { await p.addScriptTag({ content: AXE }); const a = await p.evaluate(async () => { const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] }); return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes.slice(0, 3).map(x => x.target.join(' ').slice(0, 70)) })); }); res.axe[where] = a; }
      }
      await p.close();
    }
    await ctx.close(); console.log('done', w);
  }
  // reduced motion
  const rm = await br.newContext({ ...ctxOpts(1440, 900), reducedMotion: 'reduce' });
  for (const [name, url] of Object.entries(CORE)) { const p = await rm.newPage(); await settle(p, url, base, 900); res.reduced[name] = await p.evaluate(() => { const route = document.querySelector('.route.on'); const hid = [...route.querySelectorAll('h1,h2,h3,p,li,img')].filter(e => { if (!e.offsetParent || e.closest('.fd-q,.qs,.hs,.ans,.fd-res')) return false; let a = e, op = 1; while (a && a !== route) { op *= parseFloat(getComputedStyle(a).opacity); a = a.parentElement; } return op < .05; }).length; const anim = document.getAnimations().filter(a => a.playState === 'running').length; return { hiddenWithoutScrolling: hid, runningAnimations: anim }; }); await p.close(); }
  await br.close(); srv.close();
  res.fonts = [...res.fonts]; log('pages', res);
  const uniq = o => { const c = {}; Object.values(o).flat().forEach(x => { const k = typeof x === 'string' ? x : `${x.l} ${x.w}x${x.h}`; c[k] = (c[k] || 0) + 1; }); return Object.entries(c).sort((a, b) => b[1] - a[1]); };
  console.log(JSON.stringify({ overflow: res.overflow, errors: [...new Set(res.errors)].slice(0, 30), fonts: res.fonts, hidden: Object.fromEntries(Object.entries(res.hidden).filter(([, v]) => v.length)), inputs: Object.fromEntries(Object.entries(res.inputs).filter(([, v]) => v.length)), tapUniqueCount: uniq(res.tap).length, tapTop: uniq(res.tap).slice(0, 45), axe: res.axe, reduced: res.reduced, emoji: [...new Set(Object.values(res.emoji).flat())], h1: Object.fromEntries(Object.entries(res.h1).filter(([k]) => k.endsWith('@360'))) }, null, 0));
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
