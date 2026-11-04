#!/usr/bin/env node
/*
  iTop Pools website — build script.
  Combines src/ into dist/:
    dist/index.html       the app (CSS, app code, first hero photo inlined)
    dist/faq/index.html   same app, opening on the FAQ, at a real crawlable URL
    dist/img/             responsive WebP + AVIF photos from src/data/photos.json
    dist/fonts/           self-hosted fonts
    dist/js/three.min.js  three.js, loaded only when a 3D scene scrolls into view

    node build.js          build once
    node build.js --watch  rebuild whenever a file in src/ changes
    SITE_ENV=live          removes the noindex tag and emits sitemap.xml (use at launch)
*/
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');
const CACHE = path.join(__dirname, '.cache', 'img');
const SITE = 'https://itoppools.com';
const LIVE = process.env.SITE_ENV === 'live';
const WIDTHS = [640, 1200, 1920];

const read = p => fs.readFileSync(path.join(SRC, p), 'utf8');
const json = p => JSON.parse(read(p));
const sortedFiles = dir => fs.readdirSync(path.join(SRC, dir)).filter(f => !f.startsWith('.')).sort();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const plain = html => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
// JSON inside <script> must not be able to close the tag
const safeJSON = v => JSON.stringify(v).replace(/</g, '\\u003c');

async function photoVariant(file, width, fmt) {
  const stat = fs.statSync(file);
  const key = crypto.createHash('md5').update(`${file}|${stat.size}|${stat.mtimeMs}|${width}|${fmt}`).digest('hex');
  const cached = path.join(CACHE, key);
  if (fs.existsSync(cached)) return fs.readFileSync(cached);
  const img = sharp(file).rotate().resize({ width, withoutEnlargement: true });
  const buf = await (fmt === 'avif' ? img.avif({ quality: 52, effort: 3 }) : img.webp({ quality: 74 })).toBuffer();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(cached, buf);
  return buf;
}

// Emits every photo at up to 3 widths and returns the index the page code reads
async function buildPhotos(list) {
  const out = path.join(DIST, 'img');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const index = {};
  await Promise.all(list.map(async p => {
    const file = path.join(SRC, 'assets/img', p.file);
    if (!fs.existsSync(file)) { console.warn('  ! missing photo: ' + p.file); return; }
    const meta = await sharp(file).metadata();
    const widths = WIDTHS.filter(w => w < meta.width);
    if (widths.length < WIDTHS.length) widths.push(Math.min(meta.width, 1920));
    for (const w of widths) {
      fs.writeFileSync(path.join(out, `${p.id}-${w}.webp`), await photoVariant(file, w, 'webp'));
      fs.writeFileSync(path.join(out, `${p.id}-${w}.avif`), await photoVariant(file, w, 'avif'));
    }
    const lq = await sharp(file).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
    index[p.id] = { w: widths, alt: p.alt, cap: p.caption, model: p.model, cat: p.category, lq: 'data:image/webp;base64,' + lq.toString('base64') };
  }));
  return index;
}

const srcset = (id, widths, fmt, root) => widths.map(w => `${root}img/${id}-${w}.${fmt} ${w}w`).join(', ');

function heroSlides(ids, photos, models, root, firstData) {
  return ids.map((id, i) => {
    const p = photos[id];
    const m = models.find(x => x.id === p.model);
    const cap = m ? m.n : p.cap;
    const large = p.w.filter(w => w >= 1200);
    const inner = i === 0
      ? `<picture><source media="(min-width:700px)" type="image/avif" srcset="${srcset(id, large, 'avif', root)}" sizes="100vw"><source media="(min-width:700px)" type="image/webp" srcset="${srcset(id, large, 'webp', root)}" sizes="100vw"><img src="${firstData}" alt="${esc(p.alt)}" fetchpriority="high" decoding="async"></picture>`
      : '';
    return `<div class="hs${i === 0 ? ' on' : ''}" data-id="${id}" data-cap="${esc(cap)}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${ids.length}: ${esc(cap)}">${inner}</div>`;
  }).join('\n    ');
}

function qaHTML(item, open) {
  return `<div class="qa${open ? ' open' : ''}" id="q-${item.id}"><button aria-expanded="${open}">${item.q}<span class="pm"></span></button><div class="ans"><div><p>${item.a}</p>${item.cost ? '<p class="qa-cta"><a href="#/quote" class="btn dark">Get my firm price <span class="arr">→</span></a></p>' : ''}</div></div></div>`;
}

function compareTable(c) {
  const head = `<tr><th scope="col"><span class="vh">Compare</span></th>${c.columns.map(h => `<th scope="col">${h}</th>`).join('')}</tr>`;
  const rows = c.rows.map(([label, ...vals]) => `<tr><th scope="row">${label}</th>${vals.map((v, i) => `<td data-l="${esc(c.columns[i])}">${v}</td>`).join('')}</tr>`).join('');
  return `<div class="ct-wrap"><table class="cost-tbl"><caption class="vh">${esc(c.caption)}</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div><p class="fine ct-note">${c.note}</p>`;
}

function faqPage(faq) {
  const nav = faq.groups.map(g => `<a href="#g-${g.id}" data-scroll>${g.title}</a>`).join('');
  const groups = faq.groups.map(g => `<section class="fq-g" id="g-${g.id}"><h2>${g.title}</h2>${g.intro ? `<p class="lead">${g.intro}</p>` : ''}${g.compare ? compareTable(faq.compare) : ''}<div class="fq-list">${g.items.map((it, i) => qaHTML(it, i === 0)).join('')}</div></section>`).join('');
  return `<aside class="fq-nav" aria-label="FAQ topics">${nav}</aside><div class="fq-main">${groups}</div>`;
}

function jsonLd(models, faq, biz, withFaq) {
  const graph = [
    biz,
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'iTop Pools', publisher: { '@id': biz['@id'] }, inLanguage: 'en-US' },
  ];
  if (withFaq) {
    graph.push({ '@type': 'FAQPage', '@id': `${SITE}/faq/#faq`, url: `${SITE}/faq/`, mainEntity: faq.groups.flatMap(g => g.items).map(it => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: plain(it.a) } })) });
  } else {
    graph.push({ '@type': 'ItemList', name: 'Barrier Reef fiberglass pool models', numberOfItems: models.length, itemListElement: models.map((m, i) => {
      const z = m.sizes[0];
      return { '@type': 'ListItem', position: i + 1, item: { '@type': 'Product', name: `${m.n} fiberglass pool`, description: m.blurb, category: 'Fiberglass swimming pool', brand: { '@type': 'Brand', name: 'Barrier Reef Pools' }, image: `${SITE}/img/m-${m.id}-1200.webp`, additionalProperty: m.sizes.map(s => ({ '@type': 'PropertyValue', name: s.label, value: `${s.Ls} x ${s.Ws}${s.gal ? `, ${s.gal.toLocaleString('en-US')} gallons` : ''}` })) } };
    }) });
    graph.push({ '@type': 'FAQPage', '@id': `${SITE}/#faq`, mainEntity: faq.groups.flatMap(g => g.items).filter(it => it.top).map(it => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: plain(it.a) } })) });
  }
  return `<script type="application/ld+json">${safeJSON({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

async function build() {
  const t0 = Date.now();
  const models = json('data/models.json');
  const photoList = json('data/photos.json');
  const faq = json('data/faq.json');
  const site = json('data/site.json');

  // 1. Photos
  const photos = await buildPhotos(photoList);
  const heroIds = site.hero.filter(id => photos[id]);
  const first = await sharp(path.join(SRC, 'assets/img', photoList.find(p => p.id === heroIds[0]).file)).rotate().resize({ width: 828 }).webp({ quality: 62 }).toBuffer();
  const firstData = 'data:image/webp;base64,' + first.toString('base64');

  // 2. Fonts -> dist/fonts, referenced by @font-face
  const FONTS = [
    ['Inter Tight', 'inter-tight-var.woff2', '100 900', 'normal'],
    ['Inter', 'inter-var.woff2', '100 900', 'normal'],
    ['Instrument Serif', 'instrument-serif-regular.woff2', '400', 'normal'],
    ['Instrument Serif', 'instrument-serif-italic.woff2', '400', 'italic'],
  ];
  const fontCss = FONTS.map(([family, file, weight, style]) =>
    `@font-face{font-family:'${family}';src:url({{ROOT}}fonts/${file}) format('woff2');font-weight:${weight};font-style:${style};font-display:swap}`
  ).join('\n');

  // 3. CSS (files in src/css are joined in name order)
  const css = fontCss + '\n' + sortedFiles('css').map(f => `/* ---- ${f} ---- */\n` + read('css/' + f)).join('\n');

  // 4. JS (files in src/js are joined in name order and share one scope)
  const js = sortedFiles('js').map(f => read('js/' + f)).join('\n') + '\n})();';
  const app = js
    .replace('{{MODELSJSON}}', () => safeJSON(models))
    .replace('{{PHOTOSJSON}}', () => safeJSON(photos))
    .replace('{{SITEJSON}}', () => safeJSON(site));

  // 5. Static copies
  fs.mkdirSync(path.join(DIST, 'fonts'), { recursive: true });
  for (const [, file] of FONTS) fs.copyFileSync(path.join(SRC, 'assets/fonts', file), path.join(DIST, 'fonts', file));
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
  fs.copyFileSync(path.join(SRC, 'vendor/three.min.js'), path.join(DIST, 'js/three.min.js'));

  const allItems = faq.groups.flatMap(g => g.items);
  const homeFaq = allItems.filter(it => it.top).map((it, i) => qaHTML(it, i === 0)).join('');
  const whyFaq = allItems.filter(it => it.why).map((it, i) => qaHTML(it, i === 0)).join('');
  const biz = { ...site.business, '@id': `${SITE}/#business` };

  // 6. Pages
  const page = ({ root, start, title, desc, canonical, out, withFaq }) => {
    const large = photos[heroIds[0]].w.filter(w => w >= 1200);
    let html = `<!DOCTYPE html>
<html lang="en" data-root="${root}" data-start="${start}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#071a33">
${LIVE ? '' : '<meta name="robots" content="noindex">\n'}<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE}/img/${heroIds[0]}-1200.webp">
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="preload" as="font" type="font/woff2" href="${root}fonts/inter-tight-var.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="${root}fonts/inter-var.woff2" crossorigin>
${start === '/' ? `<link rel="preload" as="image" media="(min-width:700px)" type="image/avif" imagesrcset="${srcset(heroIds[0], large, 'avif', root)}" imagesizes="100vw">` : ''}
<style>
${css}
</style>
${jsonLd(models, faq, biz, withFaq)}
</head>
<body>
${read('body.html')}
<script>
${app}
</script>
</body>
</html>`;
    html = html
      .replace('{{HEROSLIDES}}', () => heroSlides(heroIds, photos, models, root, firstData))
      .replace('{{FAQHOME}}', () => homeFaq)
      .replace('{{FAQWHY}}', () => whyFaq)
      .replace('{{FAQPAGE}}', () => faqPage(faq))
      .replace(/\{\{MODELCOUNT\}\}/g, models.length)
      .replace(/\{\{ROOT\}\}/g, root);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
    return html.length;
  };

  const size = page({
    root: '', start: '/', out: path.join(DIST, 'index.html'), canonical: `${SITE}/`, withFaq: false,
    title: 'iTop Pools · Barrier Reef Fiberglass Pools · Jacksonville, FL',
    desc: 'Choose your Barrier Reef fiberglass pool, see it in 3D, know the cost and book a free site visit. One in-house crew in Jacksonville, FL.',
  });
  page({
    root: '../', start: '/faq', out: path.join(DIST, 'faq', 'index.html'), canonical: `${SITE}/faq/`, withFaq: true,
    title: 'Fiberglass Pool FAQ: Cost, Install & Warranty · iTop Pools Jacksonville',
    desc: 'Fiberglass vs concrete vs vinyl costs, install time, Florida soil and hurricanes, maintenance and warranty, answered by iTop Pools in Jacksonville, FL.',
  });

  // 7. Small static files
  fs.writeFileSync(path.join(DIST, 'favicon.svg'), read('assets/favicon.svg'));
  if (LIVE) {
    fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
    fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc></url>\n  <url><loc>${SITE}/faq/</loc></url>\n</urlset>\n`);
  } else {
    fs.rmSync(path.join(DIST, 'sitemap.xml'), { force: true });
    fs.writeFileSync(path.join(DIST, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  }

  console.log(`✓ dist/  index.html ${(size / 1024).toFixed(0)} KB, ${Object.keys(photos).length} photos, ${models.length} models, ${allItems.length} FAQs${LIVE ? '' : ' (noindex)'}  (${Date.now() - t0} ms)`);
}

build().then(() => {
  if (!process.argv.includes('--watch')) return;
  console.log('Watching src/ for changes… (Ctrl+C to stop)');
  let timer = null;
  fs.watch(SRC, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => build().catch(e => console.error(e.message)), 150);
  });
}).catch(e => { console.error(e); process.exit(1); });
