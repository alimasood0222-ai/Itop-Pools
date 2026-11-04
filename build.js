#!/usr/bin/env node
/*
  iTop Pools website — build script.
  Turns src/ into dist/, with one real HTML page per URL:
    dist/<page>/index.html   the page's own content, metadata and structured data
    dist/assets/             shared CSS and app code, with hashed names for long caching
    dist/img/                responsive WebP + AVIF photos from src/data/photos.json
    dist/fonts/, dist/js/    self-hosted fonts, and three.js (loaded when a 3D scene nears the screen)
    dist/sitemap.xml, robots.txt, llms.txt, llms-full.txt, 404.html

    node build.js          build once
    node build.js --watch  rebuild whenever a file in src/ changes
    SITE_ENV=live          removes the noindex tag (use at launch only)
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
const warnings = [];

const read = p => fs.readFileSync(path.join(SRC, p), 'utf8').replace(/\r\n/g, '\n');
const json = p => JSON.parse(read(p));
const sortedFiles = dir => fs.readdirSync(path.join(SRC, dir)).filter(f => !f.startsWith('.')).sort();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const plain = html => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').replace(/ ([.,;:?!])/g, '$1').trim();
// JSON inside <script> must not be able to close the tag
const safeJSON = v => JSON.stringify(v).replace(/</g, '\\u003c');
const hash = s => crypto.createHash('md5').update(s).digest('hex').slice(0, 10);
const write = (rel, data) => { const f = path.join(DIST, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
const setInner = (html, id, inner) => { const re = new RegExp(`(id="${id}"[^>]*>)[\\s\\S]*?(</(?:div|h1|p|b|ul|article|figure|span)>)`); if (!re.test(html)) warnings.push('no element #' + id); return html.replace(re, (m, a, b) => a + inner + b); };
const setEmpty = (html, id, inner) => { const re = new RegExp(`(id="${id}"[^>]*>)(</)`); if (!re.test(html)) warnings.push('no empty element #' + id); return html.replace(re, (m, a, b) => a + inner + b); };

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
  const found = {};
  await Promise.all(list.map(async p => {
    const file = path.join(SRC, 'assets/img', p.file);
    if (!fs.existsSync(file)) { warnings.push('missing photo: ' + p.file); return; }
    const meta = await sharp(file).metadata();
    const widths = WIDTHS.filter(w => w < meta.width);
    if (widths.length < WIDTHS.length) widths.push(Math.min(meta.width, 1920));
    for (const w of widths) {
      fs.writeFileSync(path.join(out, `${p.id}-${w}.webp`), await photoVariant(file, w, 'webp'));
      fs.writeFileSync(path.join(out, `${p.id}-${w}.avif`), await photoVariant(file, w, 'avif'));
    }
    const lq = await sharp(file).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
    found[p.id] = { w: widths, alt: p.alt, cap: p.caption, model: p.model, cat: p.category, lq: 'data:image/webp;base64,' + lq.toString('base64') };
  }));
  // keep the data file's order so the gallery doesn't reshuffle between builds
  return Object.fromEntries(list.filter(p => found[p.id]).map(p => [p.id, found[p.id]]));
}

const srcset = (id, widths, fmt) => widths.map(w => `/img/${id}-${w}.${fmt} ${w}w`).join(', ');
function pic(photos, id, alt, sizes, eager) {
  const p = photos[id]; if (!p) return '';
  return `<picture><source type="image/avif" srcset="${srcset(id, p.w, 'avif')}" sizes="${sizes}"><source type="image/webp" srcset="${srcset(id, p.w, 'webp')}" sizes="${sizes}"><img src="/img/${id}-${p.w.filter(w => w <= 1200).pop() || p.w[0]}.webp" alt="${esc(alt === undefined ? p.alt : alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async" draggable="false"></picture>`;
}

function heroSlides(ids, photos, models, firstData) {
  return ids.map((id, i) => {
    const p = photos[id];
    const m = models.find(x => x.id === p.model);
    const cap = m ? m.n : p.cap;
    const large = p.w.filter(w => w >= 1200);
    const inner = i === 0 && firstData
      ? `<picture><source media="(min-width:700px)" type="image/avif" srcset="${srcset(id, large, 'avif')}" sizes="100vw"><source media="(min-width:700px)" type="image/webp" srcset="${srcset(id, large, 'webp')}" sizes="100vw"><img src="${firstData}" alt="${esc(p.alt)}" fetchpriority="high" decoding="async"></picture>`
      : '';
    return `<div class="hs${i === 0 ? ' on' : ''}" data-id="${id}" data-cap="${esc(cap)}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${ids.length}: ${esc(cap)}">${inner}</div>`;
  }).join('\n    ');
}

function qaHTML(item, open) {
  return `<div class="qa${open ? ' open' : ''}" id="q-${item.id}"><button aria-expanded="${open}">${item.q}<span class="pm"></span></button><div class="ans"><div><p>${item.a}</p>${item.cost ? '<p class="qa-cta"><a href="/free-3d-design/" class="btn dark">Get my firm price <span class="arr">→</span></a></p>' : ''}</div></div></div>`;
}

function compareTable(c) {
  const head = `<tr><th scope="col"><span class="vh">Compare</span></th>${c.columns.map(h => `<th scope="col">${h}</th>`).join('')}</tr>`;
  const rows = c.rows.map(([label, ...vals]) => `<tr><th scope="row">${label}</th>${vals.map((v, i) => `<td data-l="${esc(c.columns[i])}">${v}</td>`).join('')}</tr>`).join('');
  return `<div class="ct-wrap"><table class="cost-tbl"><caption class="vh">${esc(c.caption)}</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div><p class="fine ct-note">${c.note}</p>`;
}

function faqPage(faq) {
  const nav = faq.groups.map(g => `<a href="#g-${g.id}" data-scroll>${g.title}</a>`).join('');
  const groups = faq.groups.map((g, gi) => `<section class="fq-g" id="g-${g.id}"><h2>${g.title}</h2>${g.intro ? `<p class="lead">${g.intro}</p>` : ''}${g.compare ? compareTable(faq.compare) : ''}<div class="fq-list">${g.items.map((it, i) => qaHTML(it, gi === 0 && i === 0)).join('')}</div></section>`).join('');
  return `<aside class="fq-nav" aria-label="FAQ topics">${nav}</aside><div class="fq-main">${groups}</div>`;
}

// Pulls a data constant out of the page code so pages and app share one source
function constant(code, name) {
  const m = code.match(new RegExp(`const ${name}=([\\s\\S]*?[\\]\\}]);\\n`));
  if (!m) throw new Error('constant not found: ' + name);
  return new Function(`return ${m[1]}`)();
}

const allSizes = m => { const v = x => x || 'See spec sheet'; return `<div class="ct-wrap"><table class="cost-tbl"><thead><tr><th scope="col">Version</th>${['Length', 'Width', 'Shallow', 'Deep', 'Lounger', 'Gallons'].map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${m.sizes.map(z => `<tr><th scope="row">${z.label}</th><td data-l="Length">${v(z.Ls)}</td><td data-l="Width">${v(z.Ws)}</td><td data-l="Shallow">${v(z.Ss)}</td><td data-l="Deep">${v(z.Ds)}</td><td data-l="Lounger">${z.lounger || 'None listed'}</td><td data-l="Gallons">${z.gal ? z.gal.toLocaleString('en-US') : 'See spec sheet'}</td></tr>`).join('')}</tbody></table></div>`; };
const biggest = m => m.sizes.reduce((a, b) => (b.L > a.L ? b : a), m.sizes[0]);
const zLabel = (m, z) => { const own = m.n.split(' '); return z.label.split(' ').filter(w => !own.includes(w)).join(' ') || (m.sizes.length > 1 ? 'Standard' : `${z.Ls} × ${z.Ws}`); };
const modelMeta = m => { const z = biggest(m), g = z.gal.toLocaleString('en-US'); const a = [`The Barrier Reef ${m.n} fiberglass pool, up to ${z.Ls} long and ${g} gallons. See official specs and get a free 3D design from iTop Pools in Jacksonville.`, `The Barrier Reef ${m.n} fiberglass pool, up to ${z.Ls} long and ${g} gallons. See official specs and get a free 3D design from iTop Pools, Florida.`, `The Barrier Reef ${m.n} pool, up to ${z.Ls} long and ${g} gallons. See official specs and get a free 3D design from iTop Pools, Florida.`, `The Barrier Reef ${m.n} pool, up to ${z.Ls} long and ${g} gallons. See official specs and get a free 3D design from iTop Pools.`, `The Barrier Reef ${m.n} pool, up to ${z.Ls} long and ${g} gallons. See its official specs and get a free 3D design from iTop Pools in Jacksonville, FL.`]; return { t: `${m.n} Fiberglass Pool: Sizes & Specs | iTop Pools`, d: a.find(x => x.length >= 140 && x.length <= 155) || a[0] }; };

async function build() {
  const t0 = Date.now();
  warnings.length = 0;
  const models = json('data/models.json');
  const photoList = json('data/photos.json');
  const faq = json('data/faq.json');
  const site = json('data/site.json');
  const pagesData = json('data/pages.json');
  const allItems = faq.groups.flatMap(g => g.items);
  const updated = new Date(site.contentUpdated + 'T12:00:00Z');
  const updatedLabel = updated.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  const photos = await buildPhotos(photoList);
  const heroIds = site.hero.filter(id => photos[id]);
  const first = await sharp(path.join(SRC, 'assets/img', photoList.find(p => p.id === heroIds[0]).file)).rotate().resize({ width: 828 }).webp({ quality: 62 }).toBuffer();
  const firstData = 'data:image/webp;base64,' + first.toString('base64');

  // Fonts
  const FONTS = [
    ['Inter Tight', 'inter-tight-var.woff2', '100 900', 'normal'],
    ['Inter', 'inter-var.woff2', '100 900', 'normal'],
    ['Instrument Serif', 'instrument-serif-regular.woff2', '400', 'normal'],
    ['Instrument Serif', 'instrument-serif-italic.woff2', '400', 'italic'],
  ];
  const fontCss = FONTS.map(([family, file, weight, style]) => `@font-face{font-family:'${family}';src:url(/fonts/${file}) format('woff2');font-weight:${weight};font-style:${style};font-display:swap}`).join('\n');
  for (const [, file] of FONTS) { fs.mkdirSync(path.join(DIST, 'fonts'), { recursive: true }); fs.copyFileSync(path.join(SRC, 'assets/fonts', file), path.join(DIST, 'fonts', file)); }
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
  fs.copyFileSync(path.join(SRC, 'vendor/three.min.js'), path.join(DIST, 'js/three.min.js'));

  // Data living in the page code
  const code = sortedFiles('js').map(f => read('js/' + f)).join('\n');
  const ARTS = constant(code, 'ARTS'), STAGES = constant(code, 'STAGES'), TL = constant(code, 'TL'), LOANS = constant(code, 'LOANS'), STEPS = constant(code, 'STEPS'), ART_IMG = constant(code, 'ART_IMG');
  const GAL = Object.keys(photos).filter(id => id.startsWith('p-')).map(id => [id, photos[id].cap]);

  // Split body.html: shell, one fragment per route, shared components
  const body = read('body.html')
    .replace(/\{\{FAQHOME\}\}/, () => allItems.filter(it => it.top).map((it, i) => qaHTML(it, i === 0)).join(''))
    .replace(/\{\{FAQWHY\}\}/, () => allItems.filter(it => it.why).map((it, i) => qaHTML(it, i === 0)).join(''))
    .replace(/\{\{FAQPAGE\}\}/, () => faqPage(faq))
    .replace(/\{\{NSMODELS\}\}/, () => models.map(m => `<li><a href="/fiberglass-pools/${m.id}/">${m.n}</a></li>`).join(''))
    .replace(/\{\{MODELCOUNT\}\}/g, models.length);
  const mainAt = body.indexOf('<main id="app">') + '<main id="app">'.length, mainEnd = body.indexOf('</main>');
  const parkAt = body.indexOf('<!-- shared components'), footAt = body.indexOf('<footer>');
  const routesChunk = body.slice(mainAt, mainEnd);
  const FRAG = {};
  routesChunk.split(/(?=<div class="route" data-route=")/).forEach(c => { const m = c.match(/^<div class="route" data-route="(\w+)"/); if (m) FRAG[m[1]] = c.replace(/<!-- =+ [^>]* =+ -->\s*$/, '').trim(); });
  const shellTop = body.slice(0, mainAt), shellBottom = body.slice(mainEnd, parkAt) + body.slice(footAt);
  const parking = body.slice(parkAt, footAt);
  const fragments = Object.fromEntries(Object.entries(FRAG).map(([k, v]) => [k, v.replace('{{HEROSLIDES}}', () => heroSlides(heroIds, photos, models, '')).replace('{{MDALL}}', '')]));

  // Metadata per URL
  const META = { ...pagesData.pages };
  models.forEach(m => { META[`/fiberglass-pools/${m.id}/`] = modelMeta(m); });
  ARTS.forEach(a => { const x = pagesData.articles[a.id]; if (!x) warnings.push('no article metadata: ' + a.id); META[`/pool-school/${a.id}/`] = x; });

  // Shared assets
  const css = fontCss + '\n' + sortedFiles('css').map(f => read('css/' + f)).join('\n');
  const siteForApp = { url: SITE, leadWebhook: site.leadWebhook, leadEmail: site.leadEmail, updatedLabel };
  const app = code.replace('{{ROUTESJSON}}', () => safeJSON(fragments)).replace('{{PARKINGJSON}}', () => safeJSON(parking)).replace('{{METAJSON}}', () => safeJSON(META)).replace('{{PHOTOSJSON}}', () => safeJSON(photos)).replace('{{SITEJSON}}', () => safeJSON(siteForApp)).replace('{{MODELSJSON}}', () => safeJSON(models)) + '\n})();';
  fs.rmSync(path.join(DIST, 'assets'), { recursive: true, force: true });
  const cssFile = `/assets/app.${hash(css)}.css`, jsFile = `/assets/app.${hash(app)}.js`;
  write(cssFile, css); write(jsFile, app);

  const biz = { ...site.business, '@id': `${SITE}/#business`, ...(site.sameAs.length ? { sameAs: site.sameAs } : {}) };
  const baseGraph = [biz, { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'iTop Pools', url: `${SITE}/`, logo: `${SITE}/favicon.svg`, telephone: biz.telephone }, { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'iTop Pools', publisher: { '@id': `${SITE}/#org` }, inLanguage: 'en-US' }];
  const crumbs = list => ({ '@type': 'BreadcrumbList', itemListElement: list.map(([name, u], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + u })) });
  const product = m => ({ '@type': 'Product', name: `${m.n} fiberglass pool`, description: m.blurb, category: 'Fiberglass swimming pool', brand: { '@type': 'Brand', name: 'Barrier Reef Pools' }, image: `${SITE}/img/m-${m.id}-1200.webp`, url: `${SITE}/fiberglass-pools/${m.id}/`, additionalProperty: m.sizes.map(s => ({ '@type': 'PropertyValue', name: s.label, value: `${s.Ls} x ${s.Ws}${s.gal ? `, ${s.gal.toLocaleString('en-US')} gallons` : ''}` })) });
  const faqLd = (items, id) => ({ '@type': 'FAQPage', '@id': id, mainEntity: items.map(it => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: plain(it.a) } })) });

  const tracking = () => `${site.googleVerify ? `<meta name="google-site-verification" content="${esc(site.googleVerify)}">\n` : ''}${site.bingVerify ? `<meta name="msvalidate.01" content="${esc(site.bingVerify)}">\n` : ''}<script>window.dataLayer=window.dataLayer||[];</script>${site.gtm ? `\n<script async src="https://www.googletagmanager.com/gtm.js?id=${esc(site.gtm)}"></script><script>dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});</script>` : ''}${site.ga4 && !site.gtm ? `\n<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.ga4)}"></script><script>function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(site.ga4)}');</script>` : ''}`;
  const noscript = `<noscript><style>.rv,.flow,.mtx,.tli,.sh,.stg-g>*,.ir,.ir img,.sh .w>span{opacity:1!important;transform:none!important;clip-path:none!important}.word>span{transform:none!important}.hs-ui,.burger,.fp-open,.fp-apply,.r2,.cmp,.cursor,#curtain,.cmp-tray,.mbar{display:none!important}.ans{grid-template-rows:1fr!important;max-height:none!important;overflow:visible!important}.ans>div{overflow:visible!important}.fp-side{display:none!important}.q-tiles,.q-prog,.q-nav,#qForm{display:none!important}</style></noscript>`;

  const page = ({ url, route, graph, content, preload = '', ogImage }) => {
    const m = META[url];
    if (!m) { warnings.push('no metadata: ' + url); return; }
    if (m.t.length > 60) warnings.push(`title ${m.t.length}: ${url}`);
    if (m.d.length < 140 || m.d.length > 155) warnings.push(`description ${m.d.length}: ${url}`);
    const canonical = SITE + url;
    const img = ogImage || `${SITE}/img/${heroIds[0]}-1200.webp`;
    const main = content.replace(`<div class="route" data-route="${route}"`, `<div class="route on" data-route="${route}"`);
    const bottom = shellBottom.replace(/id="fLearn"><\/ul>/, () => `id="fLearn">${ARTS.slice(0, 6).map(a => `<li><a href="/pool-school/${a.id}/">${a.t.split(/[:?]/)[0]}</a></li>`).join('')}</ul>`);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(m.t)}</title>
<meta name="description" content="${esc(m.d)}">
<meta name="theme-color" content="#071a33">
${LIVE ? '' : '<meta name="robots" content="noindex">\n'}<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="iTop Pools"><meta property="og:title" content="${esc(m.t)}"><meta property="og:description" content="${esc(m.d)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(m.t)}"><meta name="twitter:description" content="${esc(m.d)}"><meta name="twitter:image" content="${img}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" as="font" type="font/woff2" href="/fonts/inter-tight-var.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/inter-var.woff2" crossorigin>
${preload}<link rel="stylesheet" href="${cssFile}">
${noscript}
${tracking()}
<script type="application/ld+json">${safeJSON({ '@context': 'https://schema.org', '@graph': [...baseGraph, ...graph] })}</script>
<script src="${jsFile}" defer></script>
</head>
<body>
${shellTop}
${main}
${bottom}
</body>
</html>`;
    write(url.replace(/^\//, '') + 'index.html', html);
    return html.length;
  };

  const crumbHome = ['Home', '/'];
  // Home
  const large = photos[heroIds[0]].w.filter(w => w >= 1200);
  const homeSize = page({ url: '/', route: 'home', graph: [{ '@type': 'ItemList', name: 'Barrier Reef fiberglass pool models', numberOfItems: models.length, itemListElement: models.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.n, url: `${SITE}/fiberglass-pools/${m.id}/` })) }, faqLd(allItems.filter(it => it.top), `${SITE}/#faq`)],
    preload: `<link rel="preload" as="image" media="(min-width:700px)" type="image/avif" imagesrcset="${srcset(heroIds[0], large, 'avif')}" imagesizes="100vw">\n`,
    content: FRAG.home.replace('{{HEROSLIDES}}', () => heroSlides(heroIds, photos, models, firstData)) });
  // Finder
  const card = m => { const z = biggest(m); return `<div class="pc"><div class="pl pl-ph">${pic(photos, 'm-' + m.id, undefined, '(max-width:680px) 100vw,340px')}</div><h3>${m.n}</h3><div class="t">${m.t}</div><div class="dims"><div><small>Length</small><b>${z.Ls}</b></div><div><small>Width</small><b>${z.Ws}</b></div><div><small>Deep</small><b>${z.Ds || '—'}</b></div></div><div class="acts"><a href="/fiberglass-pools/${m.id}/">View model</a></div></div>`; };
  page({ url: '/fiberglass-pools/', route: 'pools', graph: [crumbs([crumbHome, ['Pool models', '/fiberglass-pools/']]), { '@type': 'ItemList', name: 'Barrier Reef fiberglass pool models', numberOfItems: models.length, itemListElement: models.map((m, i) => ({ '@type': 'ListItem', position: i + 1, item: product(m) })) }], content: setEmpty(FRAG.pools, 'fpCards', models.map(card).join('')) });
  // Models
  for (const m of models) {
    const z = biggest(m), i = m.sizes.indexOf(z);
    let c = FRAG.model.replace('{{MDALL}}', () => allSizes(m));
    c = setInner(c, 'mdCrumb', m.n); c = setInner(c, 'mdName', m.n); c = setInner(c, 'mdBlurb', esc(m.blurb));
    c = setEmpty(c, 'mdTags', `${m.feats.includes('new') ? '<span class="n">New for 2026</span>' : ''}<span>${m.t}</span><span>Barrier Reef</span>`);
    c = setEmpty(c, 'mdSizes', `<small>${m.sizes.length > 1 ? 'Choose a version' : 'Available version'}</small>${m.sizes.map((s, k) => `<button type="button" data-i="${k}"${k === i ? ' class="on"' : ''}>${zLabel(m, s)}</button>`).join('')}`);
    c = setEmpty(c, 'mdPhoto', `${pic(photos, 'm-' + m.id, undefined, '(max-width:900px) 100vw,620px', true)}<figcaption>${m.n} · Photo: Barrier Reef Pools USA</figcaption>`);
    c = setEmpty(c, 'mdSpec', [['Length', z.Ls], ['Width', z.Ws], ['Shallow end', z.Ss || 'See spec sheet'], ['Deep end', z.Ds || 'See spec sheet'], ...(z.lounger ? [['Lounger', z.lounger]] : []), ['Water', z.gal ? z.gal.toLocaleString('en-US') + ' gal' : 'See spec sheet']].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join(''));
    c = setEmpty(c, 'mdFeat', m.fl.map(f => `<li>${f}</li>`).join(''));
    c = c.replace(/href="[^"]*" class="btn" id="md3d"/, `href="/3d-pool-design/?m=${m.id}" class="btn" id="md3d"`).replace(/href="[^"]*" class="btn ghost" id="mdQuote"/, `href="/free-3d-design/?m=${m.id}" class="btn ghost" id="mdQuote"`).replace(/href="[^"]*" class="btn" id="mdAsideQ"/, `href="/free-3d-design/?m=${m.id}" class="btn" id="mdAsideQ"`);
    const p0 = photos['m-' + m.id];
    page({ url: `/fiberglass-pools/${m.id}/`, route: 'model', ogImage: `${SITE}/img/m-${m.id}-1200.webp`, graph: [crumbs([crumbHome, ['Pool models', '/fiberglass-pools/'], [m.n, `/fiberglass-pools/${m.id}/`]]), product(m)], content: c, preload: `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset('m-' + m.id, p0.w, 'avif')}" imagesizes="(max-width:900px) 100vw,620px" fetchpriority="high">\n` });
  }
  // Simple pages
  const artCard = a => `<a class="ac" href="/pool-school/${a.id}/"><div class="im">${pic(photos, ART_IMG[a.img], '', '(max-width:680px) 100vw,400px')}</div><div class="tx"><h3>${a.t}</h3><p>${a.d}</p><div class="meta"><span>${a.min} min read</span><span>Read guide →</span></div></div></a>`;
  page({ url: '/3d-pool-design/', route: 'studio', graph: [crumbs([crumbHome, ['3D design studio', '/3d-pool-design/']])], content: FRAG.studio });
  page({ url: '/pool-colors/', route: 'colours', graph: [crumbs([crumbHome, ['Colors', '/pool-colors/']])], content: FRAG.colours });
  page({ url: '/pool-cost/', route: 'cost', graph: [crumbs([crumbHome, ['Cost & financing', '/pool-cost/']])], content: setEmpty(FRAG.cost, 'loans', LOANS.map((l, i) => `<div class="loan"><i>OPTION 0${i + 1}</i><h3>${l[0]}</h3><p>${l[1]}</p></div>`).join('')) });
  page({ url: '/pool-school/', route: 'learn', graph: [crumbs([crumbHome, ['Pool School', '/pool-school/']])], content: setEmpty(FRAG.learn, 'artHub', ARTS.map(artCard).join('')) });
  page({ url: '/our-work/', route: 'work', graph: [crumbs([crumbHome, ['Gallery', '/our-work/']])], content: setEmpty(FRAG.work, 'wkGrid', GAL.map(([i, c]) => `<figure class="mi">${pic(photos, i, c, '(max-width:680px) 100vw,400px')}<figcaption><b>${c}</b></figcaption></figure>`).join('')) });
  page({ url: '/why-itop/', route: 'why', graph: [crumbs([crumbHome, ['Why iTop', '/why-itop/']])], content: FRAG.why.replace('</i></div></div>', () => `</i></div>${TL.map((s, i) => `<div class="tli"><div class="dot">${String(i + 1).padStart(2, '0')}</div><div class="card"><span class="who ${s[2] === 'Barrier Reef' ? 'mf' : ''}">${s[2]}</span><h3>${s[0]}</h3><p>${s[1]}</p><span class="dur">${s[3]}</span></div></div>`).join('')}</div>`) });
  page({ url: '/free-3d-design/', route: 'quote', graph: [crumbs([crumbHome, ['Free 3D design', '/free-3d-design/']])], content: FRAG.quote });
  page({ url: '/faq/', route: 'faq', graph: [crumbs([crumbHome, ['FAQ', '/faq/']]), faqLd(allItems, `${SITE}/faq/#faq`)], content: FRAG.faq });
  // Articles
  for (const a of ARTS) {
    const s = STAGES.find(x => x[0] === a.st); const img = ART_IMG[a.img];
    let c = FRAG.article;
    c = setInner(c, 'artCrumb', s[1]); c = setInner(c, 'artStage', s[1] + ' stage'); c = setInner(c, 'artTitle', a.t); c = setEmpty(c, 'artSub', esc(a.d));
    c = setEmpty(c, 'artMeta', `<span>${a.min} min read</span><span>By the iTop Pools crew</span><span>Updated ${updatedLabel}</span>`);
    c = setEmpty(c, 'artBody', a.b);
    c = setEmpty(c, 'artMore', ARTS.filter(x => x !== a).sort((x, y) => (y.st === a.st) - (x.st === a.st)).slice(0, 4).map(x => `<a href="/pool-school/${x.id}/">${x.t}<span>${STAGES.find(z => z[0] === x.st)[1]} · ${x.min} min</span></a>`).join(''));
    c = c.replace('id="artHero"', `id="artHero" style="background-image:url(/img/${img}-${photos[img].w[photos[img].w.length - 1]}.webp)"`);
    page({ url: `/pool-school/${a.id}/`, route: 'article', ogImage: `${SITE}/img/${img}-1200.webp`, graph: [crumbs([crumbHome, ['Pool School', '/pool-school/'], [a.t, `/pool-school/${a.id}/`]]), { '@type': 'Article', headline: a.t, description: a.d, image: `${SITE}/img/${img}-1200.webp`, datePublished: site.contentUpdated, dateModified: site.contentUpdated, author: { '@type': 'Organization', name: 'iTop Pools', url: `${SITE}/` }, publisher: { '@id': `${SITE}/#org` }, mainEntityOfPage: `${SITE}/pool-school/${a.id}/` }], content: c });
  }

  // 404
  write('404.html', `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | iTop Pools</title><meta name="robots" content="noindex"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${cssFile}"><style>body{background:#071a33;color:#fff;display:grid;place-items:center;min-height:100svh;padding:24px;text-align:center}.nf{max-width:520px}.nf h1{font-size:clamp(36px,8vw,56px);font-weight:600;text-transform:none;margin-bottom:16px}.nf p{color:rgba(235,248,255,.8);margin-bottom:24px}.nf .btn{margin:6px}</style></head><body><div class="nf"><h1>That page isn't here.</h1><p>It may have moved when we rebuilt the site. Try one of these, or call (904) 685-2555.</p><a class="btn" href="/fiberglass-pools/">See pool models</a><a class="btn ghost" href="/">Go to the home page</a></div></body></html>`);

  // Crawl files
  write('favicon.svg', read('assets/favicon.svg'));
  const urls = Object.keys(META);
  const imageFor = u => { const m = u.match(/^\/fiberglass-pools\/([\w-]+)\/$/); return m ? `<image:image><image:loc>${SITE}/img/m-${m[1]}-1200.webp</image:loc></image:image>` : ''; };
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${site.contentUpdated}</lastmod>${imageFor(u)}</url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Claude-SearchBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot', '*'].map(b => `User-agent: ${b}\nAllow: /\n`).join('\n') + `\nSitemap: ${SITE}/sitemap.xml\n`);
  const nap = `iTop Pools\n6510 Columbia Park Drive, Suite 206, Jacksonville, FL 32258\n(904) 685-2555\nhello@itoppools.com\nMon–Fri, 9:00 AM – 6:00 PM`;
  const llms = `# iTop Pools\n\n> Authorized Barrier Reef fiberglass pool dealer in Jacksonville, Florida. One in-house crew handles the pool, deck and pavers. Offers a free site visit and 3D design.\n\n${nap}\n\n## Main pages\n- [Pool models](${SITE}/fiberglass-pools/): all ${models.length} Barrier Reef models with official specs\n- [FAQ](${SITE}/faq/): cost, install, maintenance and warranty\n- [Cost estimator](${SITE}/pool-cost/): example ranges and financing basics\n- [Pool School](${SITE}/pool-school/): buying and ownership guides\n- [Free 3D design](${SITE}/free-3d-design/): request a site visit\n\n## Pool models\n${models.map(m => `- [${m.n}](${SITE}/fiberglass-pools/${m.id}/)`).join('\n')}\n\n## Guides\n${ARTS.map(a => `- [${a.t}](${SITE}/pool-school/${a.id}/)`).join('\n')}\n`;
  write('llms.txt', llms);
  write('llms-full.txt', `# iTop Pools: full reference\n\n${nap}\n\n## FAQ\n${faq.groups.map(g => `\n### ${g.title}\n${g.items.map(i => `\nQ: ${i.q}\nA: ${plain(i.a)}`).join('\n')}`).join('\n')}\n\n## Pool models (specifications from Barrier Reef Pools USA)\n${models.map(m => `\n### ${m.n} (${m.t})\n${m.sizes.map(z => `- ${z.label}: ${z.Ls} x ${z.Ws}, shallow ${z.Ss || 'see spec sheet'}, deep ${z.Ds || 'see spec sheet'}${z.lounger ? `, lounger ${z.lounger}` : ''}, ${z.gal ? z.gal.toLocaleString('en-US') + ' gallons' : 'gallons on spec sheet'}`).join('\n')}`).join('\n')}\n\n## Guides\n${ARTS.map(a => `\n### ${a.t}\n${plain(a.b)}`).join('\n')}\n`);
  write(`${site.indexNowKey}.txt`, site.indexNowKey);
  fs.rmSync(path.join(DIST, 'faq', 'index.html.tmp'), { force: true });

  console.log(`✓ dist/  ${urls.length} pages, home ${(homeSize / 1024).toFixed(0)} KB, app ${(app.length / 1024).toFixed(0)} KB, ${Object.keys(photos).length} photos, ${models.length} models, ${allItems.length} FAQs${LIVE ? '' : ' (noindex)'}  (${Date.now() - t0} ms)`);
  warnings.forEach(w => console.warn('  ! ' + w));
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
