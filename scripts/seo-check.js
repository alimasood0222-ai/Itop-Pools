#!/usr/bin/env node
/*
  npm run seo-check: checks every built page and exits non-zero on any error.
  Title, description, canonical, single H1, content with JS off, broken internal links,
  JSON-LD validity, image alt text, sitemap coverage, and sideways scrolling at 390px.
  Run npm run build first.
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright-core');
const DIST = path.join(__dirname, '..', 'dist');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pages = walk(DIST).filter(f => f.endsWith('index.html')).map(f => '/' + path.relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, ''));
const has = new Set(pages);
const errors = [], warnings = [];
const err = (u, m) => errors.push(`${u}: ${m}`);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<');
const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const altSeen = {};
for (const u of pages) {
  const h = fs.readFileSync(path.join(DIST, u, 'index.html'), 'utf8');
  const g = re => decode((h.match(re) || [])[1] || '');
  const t = g(/<title>([^<]*)/), d = g(/name="description" content="([^"]*)/);
  if (!t || t.length > 60) err(u, `title length ${t.length}`);
  if (d.length < 140 || d.length > 155) err(u, `description length ${d.length}`);
  if (g(/rel="canonical" href="([^"]*)/) !== 'https://itoppools.com' + u) err(u, 'canonical');
  if ((h.match(/<h1[\s>]/g) || []).length !== 1) err(u, 'H1 count ' + (h.match(/<h1[\s>]/g) || []).length);
  if (!h.includes('lang="en-US"')) err(u, 'lang');
  if (!h.includes('property="og:image"') || !h.includes('name="twitter:card"')) err(u, 'OG or Twitter tags');
  if (!sitemap.includes(`https://itoppools.com${u}<`)) err(u, 'not in sitemap');
  if (u !== '/' && !h.includes('class="crumbs"') && !h.includes('crumbs')) err(u, 'no breadcrumbs');
  if (!h.includes('/free-3d-design/')) err(u, 'no link to the form');
  if (/href="#\//.test(h)) err(u, 'hash route link');
  if (/Ã.|â€|Â[·©]/.test(h.replace(/base64,[^"')]*/g, ''))) err(u, 'garbled characters');
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!ld.length) err(u, 'no JSON-LD');
  ld.forEach(m => { try { const j = JSON.parse(m[1]); const types = (j['@graph'] || [j]).flatMap(n => [].concat(n['@type'])); if (types.includes(undefined)) err(u, 'JSON-LD node without @type'); if (!types.includes('BreadcrumbList') && u !== '/') err(u, 'no BreadcrumbList'); if (/aggregateRating|"offers"/.test(m[1])) err(u, 'ratings or offers in JSON-LD need review'); } catch (e) { err(u, 'invalid JSON-LD'); } });
  for (const m of h.matchAll(/<a\b[^>]*href="(\/[^"#?]*)/g)) { const l = m[1]; if (/\.[a-z0-9]+$/i.test(l)) continue; if (!has.has(l)) err(u, 'broken link ' + l); }
  for (const m of h.matchAll(/<img\b[^>]*>/g)) { const a = (m[0].match(/alt="([^"]*)"/) || [])[1]; if (a === undefined) err(u, 'image with no alt: ' + m[0].slice(0, 70)); if (!/\bwidth=/.test(m[0]) && !/class="lb|<img alt=""/.test(m[0])) { if (a !== '') err(u, 'image with no width: ' + m[0].slice(0, 70)); } if (a) { (altSeen[a] = altSeen[a] || new Set()).add(m[0].match(/src="([^"]{0,60})/)?.[1] || ''); } }
}
Object.entries(altSeen).forEach(([a, s]) => { if (s.size > 1) warnings.push(`same alt on different images: "${a}"`); });
// every page linked from somewhere
const linked = new Set(); pages.forEach(u => { for (const m of fs.readFileSync(path.join(DIST, u, 'index.html'), 'utf8').matchAll(/<a\b[^>]*href="(\/[^"#?]*)/g)) linked.add(m[1]); });
pages.filter(u => !linked.has(u)).forEach(u => err(u, 'orphan page'));

const srv = http.createServer((q, s) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(DIST, p); if (!f.startsWith(DIST) || !fs.existsSync(f)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s); });
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const br = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const nojs = await br.newContext({ viewport: { width: 1200, height: 900 }, javaScriptEnabled: false });
  const phone = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const words = {};
  for (const u of pages) {
    const a = await nojs.newPage(); await a.goto(base + u, { waitUntil: 'load' });
    const n = (await a.evaluate(() => document.body.textContent.replace(/\s+/g, ' ').trim())).split(' ').length; words[u] = n;
    if (await a.locator('h1:visible').count() !== 1 && !u.includes('free-3d-design')) err(u, 'H1 not visible with JS off');
    if (n < 200) err(u, `only ${n} words with JS off`);
    await a.close();
    const p = await phone.newPage(); const je = []; p.on('pageerror', e => je.push(e.message));
    await p.goto(base + u, { waitUntil: 'load' }); await p.waitForTimeout(250);
    const o = await p.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
    if (o[0] > 390 || o[1] > 390) err(u, `sideways scroll at 390: page ${o[0]}, content ${o[1]}`);
    if (je.length) err(u, 'JS error: ' + je[0].slice(0, 90));
    await p.close();
  }
  await br.close(); srv.close();
  warnings.slice(0, 15).forEach(w => console.log('warn  ' + w));
  errors.forEach(e => console.log('ERROR ' + e));
  console.log(`\n${pages.length} pages checked: ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exitCode = errors.length ? 1 : 0;
})().catch(e => { console.error(e); srv.close(); process.exit(1); });
