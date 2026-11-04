const { serve, ctxOpts, launch } = require('./lib');
(async () => {
  const { srv, base } = await serve(); const br = await launch();
  const phone = await br.newContext(ctxOpts(390, 844)); phone.setDefaultTimeout(12000);
  for (const u of ['/pool-cost/', '/3d-pool-design/?test', '/3d-pool-design/']) {
    const p = await phone.newPage(); await p.goto(base + u, { waitUntil: 'load' }); await p.waitForTimeout(1500);
    const fps = await p.evaluate(() => new Promise(r => { let n = 0; const t = performance.now(); (function f() { n++; if (performance.now() - t > 1500) r(Math.round(n / 1.5)); else requestAnimationFrame(f); })(); }));
    const res = [];
    for (let i = 0; i < 3; i++) { const t = Date.now(); const ok = await p.tap('#burger', { timeout: 12000 }).then(() => true).catch(() => false); res.push((ok ? 'open ' : 'TIMEOUT ') + (Date.now() - t) + 'ms menu=' + await p.evaluate(() => document.body.classList.contains('menu-open'))); await p.waitForTimeout(500); await p.keyboard.press('Escape'); await p.waitForTimeout(500); }
    console.log(u, 'fps', fps, res.join(' | ')); await p.close();
  }
  await br.close(); srv.close();
})().catch(e => { console.error(e.message.slice(0, 400)); process.exit(1); });
