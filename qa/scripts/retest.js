// Re-test after fixes: every URL, JS off, gestures, drag, forms, lead payload, events, metadata.
const { serve, models, ARTICLES, ctxOpts, launch, log, shot, DIST, fs, path } = require('./lib');
const R = []; const rec = (id, ok, note = '') => { R.push({ id, ok, note }); console.log(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : 'INFO'} ${id}: ${note}`.slice(0, 260)); };
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const URLS = walk(DIST).filter(f => f.endsWith('index.html')).map(f => '/' + path.relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, ''));
async function swipe(cdp, x1, y1, x2, y2) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y1 }] }); for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / 8, y: y1 + (y2 - y1) * i / 8 }] }); await new Promise(r => setTimeout(r, 16)); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
const wait = (p, r) => p.waitForFunction(x => document.querySelector('.route.on')?.dataset.route === x, r, { timeout: 7000 }).then(() => true).catch(() => false);
const safe = async (id, fn) => { try { await fn(); } catch (e) { rec(id, false, 'test error: ' + e.message.split('\n')[0]); } };
(async () => {
  const { srv, base } = await serve(); const br = await launch();
  const phone = await br.newContext(ctxOpts(390, 844)), lap = await br.newContext(ctxOpts(1440, 900)); phone.setDefaultTimeout(30000); lap.setDefaultTimeout(30000);
  const nojs = await br.newContext({ ...ctxOpts(390, 844), javaScriptEnabled: false });

  await safe('D1', async () => { // every URL
    rec('D1', URLS.length === 43, 'HTML pages in dist: ' + URLS.length);
    let bad = 0; const titles = {}, descs = {};
    for (const u of URLS) {
      const raw = fs.readFileSync(path.join(DIST, u, 'index.html'), 'utf8');
      const g = re => (raw.match(re) || [])[1] || '';
      const t = g(/<title>([^<]*)/).replace(/&amp;/g, '&'), d = g(/name="description" content="([^"]*)/).replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      const ld = [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
      const prob = [];
      if (t.length > 60) prob.push('title ' + t.length); if (d.length < 140 || d.length > 155) prob.push('desc ' + d.length);
      if ((raw.match(/<h1[\s>]/g) || []).length !== 1) prob.push('h1 x' + (raw.match(/<h1[\s>]/g) || []).length);
      if (g(/rel="canonical" href="([^"]*)/) !== 'https://itoppools.com' + u) prob.push('canonical');
      if (!raw.includes('name="twitter:card"') || !raw.includes('property="og:image"')) prob.push('og/twitter');
      if (raw.includes('href="#/')) prob.push('hash link');
      if (!ld.length) prob.push('no json-ld');
      (titles[t] = titles[t] || []).push(u); (descs[d] = descs[d] || []).push(u);
      const q = await nojs.newPage(); await q.goto(base + u, { waitUntil: 'load' }); const vis = (await q.locator('body').innerText()).length, h = await q.locator('h1:visible').count(); await q.close();
      if (h !== 1) prob.push('JS off: visible h1 ' + h); if (vis < 1000) prob.push('JS off: only ' + vis + ' chars');
      if (prob.length) { bad++; console.log('   ', u, prob.join(', ')); }
    }
    rec('D1/D2', bad === 0, `${URLS.length - bad} of ${URLS.length} pages clean on title, description, one H1, canonical, OG/Twitter, JSON-LD, no hash links, visible without JS`);
    rec('D2', !Object.values(titles).some(a => a.length > 1) && !Object.values(descs).some(a => a.length > 1), 'no duplicate titles or descriptions');
    const b = fs.readFileSync(path.join(DIST, 'fiberglass-pools/bondi/index.html'), 'utf8'); rec('D1', b.includes('17,600') && b.includes('12,832') && b.includes('Walk-in 11'), 'Bondi specs for both sizes in raw HTML');
    const f = fs.readFileSync(path.join(DIST, 'faq/index.html'), 'utf8'); rec('D1', f.includes('$58,000') && f.includes('Will my pool be a lot of work'), 'FAQ text in raw HTML, including restored question');
    const a = fs.readFileSync(path.join(DIST, 'pool-school/cost-guide/index.html'), 'utf8'); rec('D7', a.includes('Key takeaways') && a.includes('Updated') && /<h2>[^<]*\?<\/h2>/.test(a), 'article has takeaways, Updated date, question headings');
    const ty = (u, x) => fs.readFileSync(path.join(DIST, u, 'index.html'), 'utf8').includes(`"@type":"${x}"`);
    rec('D5', ty('fiberglass-pools/bondi', 'Product') && ty('fiberglass-pools/bondi', 'BreadcrumbList') && ty('pool-school/cost-guide', 'Article') && ty('faq', 'FAQPage') && ty('', 'Organization') && ty('', 'WebSite'), 'Product, BreadcrumbList, Article, FAQPage, Organization, WebSite present');
    for (const x of ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt', '404.html']) rec('D3', fs.existsSync(path.join(DIST, x)), x);
    const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8'); rec('D3', (sm.match(/<loc>/g) || []).length === 43 && sm.includes('<lastmod>') && sm.includes('image:image'), 'sitemap: 43 URLs, lastmod, images');
  });

  await safe('nav', async () => { // client navigation with real URLs
    const p = await lap.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + '/', { waitUntil: 'load' }); await p.waitForTimeout(1000);
    await p.click('#navLinks a[data-r="why"]'); await wait(p, 'why'); await p.waitForTimeout(800); rec('nav', p.url().endsWith('/why-itop/') && /Process/.test(await p.title()), 'menu goes to /why-itop/, title: ' + await p.title());
    await p.goBack(); await wait(p, 'home'); await p.waitForTimeout(800); rec('nav', p.url() === base + '/' && await p.evaluate(() => document.querySelector('.hs.on img')?.naturalWidth > 0), 'Back returns home, hero image present');
    await p.goto(base + '/#/pools/bondi', { waitUntil: 'load' }); await wait(p, 'model'); await p.waitForTimeout(500); rec('nav', p.url().endsWith('/fiberglass-pools/bondi/') && (await p.textContent('#mdName')) === 'Bondi', 'old #/pools/bondi link lands on new URL');
    await p.goto(base + '/why-itop/', { waitUntil: 'load' }); await p.goto(base + '/#faq', { waitUntil: 'load' }); await p.waitForTimeout(3200); rec('nav', await p.evaluate(() => Math.abs(document.querySelector('#faq').getBoundingClientRect().top) < 150), 'old /#faq anchor still lands on home FAQ');
    await p.goto(base + '/faq/', { waitUntil: 'load' }); await p.waitForTimeout(800); await p.click('#nav .logo'); await wait(p, 'home'); await p.waitForTimeout(800); await p.locator('.v3-why .v3-more .btn').scrollIntoViewIfNeeded(); await p.waitForTimeout(1200); await p.locator('.v3-why .v3-more .btn').click(); await p.waitForTimeout(1900); rec('nav', p.url().includes('/faq/') && await p.evaluate(() => Math.abs(document.querySelector('#g-compare').getBoundingClientRect().top) < 200), 'Compare pool types goes to FAQ comparison: ' + p.url());
    await p.goto(base + '/fiberglass-pools/bondi/', { waitUntil: 'load' }); await p.waitForTimeout(1000); const a = await p.textContent('#mdSpec'); await p.locator('#mdSizes button').nth(1).click(); await p.waitForTimeout(150); rec('nav', a !== await p.textContent('#mdSpec') && (await p.textContent('#mdAll')).includes('12,832'), 'direct model page: tabs and all-versions table work');
    await p.goto(base + '/pool-school/cost-guide/', { waitUntil: 'load' }); await p.waitForTimeout(800); await p.click('#artBody a[href="/pool-cost/"]'); rec('nav', await wait(p, 'cost'), 'link inside an article navigates');
    rec('nav', !errs.length, 'no JS errors ' + errs.slice(0, 2).join('|')); await p.close();
  });

  await safe('gesture', async () => {
    const p = await phone.newPage(); const cdp = await phone.newCDPSession(p); await p.goto(base + '/why-itop/'); await p.waitForTimeout(600); await p.goto(base + '/', { waitUntil: 'load' }); await p.waitForTimeout(1000);
    const u = p.url(), y = await p.evaluate(() => Math.round(document.querySelector('.h-title').getBoundingClientRect().top + 30)); await swipe(cdp, 60, y, 320, y + 4); await p.waitForTimeout(2500); rec('A1/C2', p.url() === u, 'swipe right on hero headline stays on page: ' + p.url());
    const b = await p.evaluate(() => document.querySelector('#hsCap').textContent); const py = 180; await swipe(cdp, 320, py, 80, py + 3); await p.waitForTimeout(500); await swipe(cdp, 80, py, 320, py + 3); await p.waitForTimeout(2200); rec('A1', p.url() === u && b === await p.textContent('#hsCap'), 'photo swipe forward and back works, no Back navigation');
    await p.tap('#burger'); await p.waitForTimeout(500); const d = await p.locator('#drawer').boundingBox(); await swipe(cdp, d.x + 60, 450, d.x + 290, 455); await p.waitForTimeout(2500); rec('C2', p.url() === u && await p.evaluate(() => !document.body.classList.contains('menu-open')), 'swipe closes drawer, stays on page: ' + p.url()); await p.close();
  });

  await safe('B6', async () => {
    const p = await lap.newPage(); await p.goto(base + '/', { waitUntil: 'load' }); await p.waitForTimeout(1500); await p.evaluate(() => document.querySelector('#r2Track').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(1300);
    const bx = await p.locator('#r2Track').boundingBox(), y = bx.y + bx.height * .45, x0 = bx.x + bx.width * .72; await p.mouse.move(x0, y); await p.mouse.down(); for (let i = 1; i <= 20; i++) { await p.mouse.move(x0 - 600 * i / 20, y); await p.waitForTimeout(25); } await p.mouse.up(); await p.waitForTimeout(1500); const c = await p.textContent('#r2Cur'); rec('B6', +c > 1, 'mouse drag moves carousel to card ' + c);
    const name = await p.textContent('#r2Info h3'), cb = await p.locator('#r2Track .r2c.on').boundingBox(); await p.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); const ok = await wait(p, 'model'); await p.waitForTimeout(600); rec('B6', ok && (await p.textContent('#mdName')) === name, `click after drag opens ${name}, url ${p.url()}`); await p.close();
  });

  await safe('C', async () => {
    for (const w of [360, 390, 414]) { const c = await br.newContext(ctxOpts(w, 800)); const p = await c.newPage(); await p.goto(base + '/pool-school/fiberglass-vs-concrete/', { waitUntil: 'load' }); await p.waitForTimeout(900); const m = await p.evaluate(() => [innerWidth, document.documentElement.scrollWidth, getComputedStyle(document.querySelector('.prose td')).display]); rec('C1', m[0] === w && m[1] <= w && m[2] === 'flex', `article @${w}: page ${m[0]}, content ${m[1]}, cells ${m[2]}`); if (w === 390) { await p.evaluate(() => document.querySelector('.prose table').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(500); await p.screenshot({ path: shot('after-article-table-390') }); } await c.close(); }
    const p = await phone.newPage(); await p.goto(base + '/pool-school/', { waitUntil: 'load' }); await p.waitForTimeout(1500); await p.evaluate(() => document.querySelector('#mtx').scrollIntoView({ block: 'start', behavior: 'instant' })); await p.waitForTimeout(800); rec('C4', await p.evaluate(() => { const m = document.querySelector('#mtx'); return getComputedStyle(document.querySelector('.mtx-r:not(.h)')).display === 'block' && m.scrollWidth <= m.clientWidth + 1; }), 'Pool School table stacked'); await p.screenshot({ path: shot('after-learn-matrix-390') }); await p.close();
    const t = await phone.newPage(); await t.goto(base + '/why-itop/', { waitUntil: 'load' }); await t.waitForTimeout(700); rec('B-polish', await t.evaluate(() => getComputedStyle(document.querySelector('#toast')).visibility === 'hidden'), 'hidden toast no longer peeks'); await t.close();
    const hh = await phone.newPage(); await hh.goto(base + '/', { waitUntil: 'load' }); await hh.waitForTimeout(800); const g = await hh.evaluate(() => { const btn = [...document.querySelectorAll('.hero .ctas .btn')].pop().getBoundingClientRect(), sec = document.querySelector('.hero').getBoundingClientRect(); return { gap: Math.round(sec.bottom - btn.bottom), ctaBottom: Math.round(btn.bottom), vh: innerHeight }; }); rec('C4', g.gap < 40 && g.ctaBottom <= g.vh, 'phone hero: no dead space ' + JSON.stringify(g)); await hh.screenshot({ path: shot('after-hero-390') }); await hh.close();
  });

  await safe('B3', async () => { // manual vs webhook, with attribution and events
    const fill = async q => { await q.locator('[data-k=project] [data-v=pool]').click(); await q.locator('#qNext').click(); await q.waitForTimeout(300); await q.locator('#qModels [data-id=bondi]').click(); await q.locator('#qNext').click(); await q.waitForTimeout(300); await q.locator('[data-k=when] [data-v="3-6"]').click(); await q.locator('[data-k=budget] [data-v="60-80"]').click(); await q.waitForTimeout(700); await q.fill('#qZip', '32258'); await q.locator('#qNext').click(); await q.waitForTimeout(300); await q.locator('#qCallFirst').click(); await q.waitForTimeout(300); await q.fill('#qFn', 'Test'); await q.locator('#qPh').pressSequentially('9045550100'); await q.locator('#qNext').click(); await q.waitForTimeout(700); };
    const a = await lap.newPage(); await a.goto(base + '/free-3d-design/', { waitUntil: 'load' }); await a.waitForTimeout(1000); await fill(a); const n = await a.evaluate(() => getComputedStyle(document.querySelector('.q-next')).display); rec('B3', n === 'none' && /One last tap/.test(await a.textContent('.qs.done')), 'no webhook: "We call you" hidden until the visitor actually sends'); await a.screenshot({ path: shot('after-form-manual-1440') }); await a.close();
    const c2 = await br.newContext(ctxOpts(1440, 900)); const b = await c2.newPage(); const WH = 'https://hooks.example.test/lead'; let body = null;
    await c2.route(/\/assets\/app\.[^/]+\.js/, async route => { const r = await route.fetch(); const t = (await r.text()).replace('"leadWebhook":""', `"leadWebhook":"${WH}"`); route.fulfill({ response: r, body: t }); });
    await c2.route(WH, route => { body = route.request().postDataJSON(); route.fulfill({ status: 200, body: '{}', headers: { 'Access-Control-Allow-Origin': '*' } }); });
    await b.goto(base + '/free-3d-design/?utm_source=google&utm_campaign=spring', { waitUntil: 'load', referer: 'https://www.google.com/' }); await b.waitForTimeout(1000); await fill(b); await b.waitForTimeout(500);
    rec('B3', !!body && body.utm_source === 'google' && body.utm_campaign === 'spring' && body.referrer.includes('google') && body.landing_page.includes('free-3d-design') && body.first_name === 'Test', 'webhook payload: ' + JSON.stringify(body || {}).slice(0, 190));
    const ev = await b.evaluate(() => window.dataLayer.map(x => x.event).filter(Boolean)); rec('D10', ev.includes('generate_lead'), 'events after submit: ' + ev.join(',')); rec('B3', /all set/.test(await b.textContent('.qs.done')) && await b.evaluate(() => getComputedStyle(document.querySelector('.q-next')).display !== 'none'), 'with webhook: normal success screen'); await c2.close();
    const e = await lap.newPage(); await e.goto(base + '/pool-cost/', { waitUntil: 'load' }); await e.waitForTimeout(1200); await e.evaluate(() => { document.querySelector('#eoSend').click(); }); await e.waitForTimeout(300); await e.evaluate(() => { const a = document.querySelector('a[href^="tel:"]'); a.addEventListener('click', x => x.preventDefault()); a.click(); }); const evs = await e.evaluate(() => window.dataLayer.map(x => x.event).filter(Boolean)); rec('D10', evs.includes('estimator_complete') && evs.includes('phone_click'), 'events: ' + evs.join(',')); await e.close();
    const st = await lap.newPage(); await st.goto(base + '/3d-pool-design/', { waitUntil: 'load' }); await st.waitForTimeout(3000); const cv = await st.locator('#cfgCanvas').boundingBox(); await st.mouse.move(cv.x + 300, cv.y + 300); await st.mouse.down(); await st.mouse.move(cv.x + 420, cv.y + 300, { steps: 5 }); await st.mouse.up(); await st.waitForTimeout(300); rec('D10', (await st.evaluate(() => window.dataLayer.map(x => x.event))).includes('design_3d_interaction'), '3D interaction event'); await st.close();
  });

  await br.close(); srv.close(); log('retest', R); console.log('\nPASS', R.filter(x => x.ok === true).length, 'FAIL', R.filter(x => x.ok === false).length);
})().catch(e => { log('retest', R); console.error('CRASH', e.message.slice(0, 400)); process.exit(1); });
