#!/usr/bin/env node
/*
  Browser checks against a built dist/ using the installed Chrome.
    npm test                every route at every width: overflow, JS errors, tap targets
    npm test -- --clicks    also clicks every visible button and link on every route
    npm test -- --shots DIR also saves screenshots to DIR
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const DIST = path.join(__dirname, '..', 'dist');
const args = process.argv.slice(2);
const CLICKS = args.includes('--clicks');
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : null;
const ROUTES = ['/', '/fiberglass-pools/', '/fiberglass-pools/plunge/', '/fiberglass-pools/bondi/', '/fiberglass-pools/whitsunday/', '/fiberglass-pools/milano/', '/3d-pool-design/', '/pool-colors/', '/pool-cost-jacksonville/', '/pool-financing/', '/fiberglass-vs-concrete-vs-vinyl/', '/pool-school/', '/pool-school/permits/', '/our-work/', '/process-and-warranty/', '/about/', '/service-areas/', '/free-3d-design/', '/faq/', '/privacy/'];
const VIEWPORTS = [[360, 740], [375, 812], [390, 844], [414, 896], [768, 1024], [844, 390], [1440, 900]];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.js': 'text/javascript', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.txt': 'text/plain' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DIST, p);
  if (!f.startsWith(DIST) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

const name = (r, w) => (r === '/' ? 'home' : r.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')) + '-' + w;

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const problems = [];
  const note = (where, msg) => { problems.push(`${where}: ${msg}`); };
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

  for (const [w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 1000, isMobile: w < 1000, deviceScaleFactor: w < 1000 ? 2 : 1 });
    for (const route of ROUTES) {
      const page = await ctx.newPage();
      const where = `${route} @${w}`;
      page.on('pageerror', e => note(where, 'JS error: ' + e.message));
      page.on('console', m => { if (/WebGL unavailable/.test(m.text())) note(where, m.text().slice(0, 160)); if (m.type() === 'error' && !/GL_|WebGL/.test(m.text())) note(where, 'console: ' + m.text().slice(0, 160)); });
      page.on('response', r => { if (r.status() >= 400) note(where, `HTTP ${r.status()} ${r.url().replace(base, '')}`); });
      await page.goto(base + route, { waitUntil: 'load' });
      await page.waitForTimeout(route.includes('studio') || route.includes('colours') ? 1800 : 900);
      const m = await page.evaluate(() => {
        const iw = innerWidth, de = document.documentElement;
        const wide = [...document.querySelectorAll('body *')].filter(e => { if (!e.offsetParent || e.closest('.hs-stage,.r2-track,.g-track,.mq,.fq-nav,.r2-fil,.drawer,.fp-side,canvas,svg,.q-steps,.chips')) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.right > iw + 1 && r.left < iw; }).slice(0, 3).map(e => e.tagName + '.' + String(e.className).slice(0, 30));
        const small = innerWidth < 1000 ? [...document.querySelectorAll('.route.on a[href], .route.on button, #nav button')].filter(e => { if (!e.offsetParent || e.closest('.ans p,.crumbs,.prose,footer,.r2-ticks,.fine,.q-hint,.guide-w p,.guide-w li,.nap-card,#mdAbout p')) return false; const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 30 || r.width < 24); }).slice(0, 4).map(e => (e.textContent.trim() || e.getAttribute('aria-label') || e.tagName).slice(0, 24)) : [];
        const offCenter = innerWidth < 700 ? [...document.querySelectorAll('.route.on .btn')].filter(e => { if (!e.offsetParent) return false; const r = e.getBoundingClientRect(); return r.width > 0 && (r.left < 10 || r.right > iw - 10); }).slice(0, 3).map(e => e.textContent.trim().slice(0, 28)) : [];
        const lefts = s => new Set([...document.querySelectorAll(s)].filter(e => e.offsetParent).map(e => Math.round(e.getBoundingClientRect().left))).size;
        const misaligned = ['.route.on .vs-row>:nth-child(2)', '.route.on .vs-row>:nth-child(3)', '.route.on .mtx-r>:nth-child(2)'].filter(s => lefts(s) > 1);
        const fs = parseFloat(getComputedStyle(document.body).fontSize);
        const h1 = document.querySelector('.route.on h1:not(.vh)'); const h1over = h1 && h1.scrollWidth > h1.clientWidth + 1;
        return { sw: de.scrollWidth, iw, wide, small, fs, h1over, offCenter, misaligned, route: document.querySelector('.route.on')?.dataset.route };
      });
      if (m.sw > w || m.iw > w) note(where, `horizontal scroll: content ${m.sw}, page ${m.iw}, screen ${w} ${m.wide.join(', ')}`);
      if (m.small.length) note(where, 'small tap targets: ' + m.small.join(' | '));
      if (m.h1over) note(where, 'h1 overflows');
      if (m.offCenter.length) note(where, 'button touches screen edge: ' + m.offCenter.join(' | '));
      if (m.misaligned.length) note(where, 'table columns misaligned: ' + m.misaligned.join(' | '));
      if (m.fs < 16) note(where, 'body font ' + m.fs);
      if (await page.evaluate(() => document.body.classList.contains('no3d'))) note(where, '3D failed to start');
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name(route, w) + '.png') });

      if (CLICKS && (w === 390 || w === 1440)) {
        const count = await page.evaluate(() => { document.querySelectorAll('[data-ck]').forEach(e => e.removeAttribute('data-ck')); const els = [...document.querySelectorAll('.route.on button, .route.on a[href]')].filter(e => e.offsetParent); els.forEach((e, i) => e.setAttribute('data-ck', i)); return els.length; });
        const before = problems.length;
        for (let i = 0; i < count; i++) {
          const el = page.locator(`[data-ck="${i}"]`).first();
          if (!(await el.count())) continue;
          const href = await el.getAttribute('href');
          if (href && /^(tel:|mailto:|https?:)/.test(href)) continue;
          const dead = href === '#';
          if (dead) note(where, 'dead link: ' + (await el.textContent()).trim().slice(0, 30));
          await el.evaluate(e => e.click()).catch(() => {});
          await page.waitForTimeout(25);
          const off = await page.evaluate(() => document.querySelector('.route.on')?.dataset.route);
          if (off !== m.route) { await page.goto(base + route, { waitUntil: 'load' }); await page.waitForTimeout(120); await page.evaluate(() => { document.querySelectorAll('[data-ck]').forEach(e => e.removeAttribute('data-ck')); const els = [...document.querySelectorAll('.route.on button, .route.on a[href]')].filter(e => e.offsetParent); els.forEach((e, n) => e.setAttribute('data-ck', n)); }); }
        }
        console.log(`  clicked ${count} on ${where}${problems.length > before ? ' (new problems)' : ''}`);
      }
      await page.close();
    }
    await ctx.close();
    console.log(`checked ${ROUTES.length} routes @${w}x${h}`);
  }
  await browser.close();
  server.close();
  const uniq = [...new Set(problems)];
  console.log(uniq.length ? `\n${uniq.length} problem(s):\n` + uniq.slice(0, 80).join('\n') : '\nNo problems found.');
  process.exitCode = uniq.length ? 1 : 0;
})().catch(e => { console.error(e); server.close(); process.exit(1); });
