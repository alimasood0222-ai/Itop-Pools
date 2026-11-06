#!/usr/bin/env node
/*
  iTop Pools website — build script.
  Turns src/ into dist/: one real HTML page per URL, with only the script that page needs.
    dist/<page>/index.html   content, metadata and structured data for that page
    dist/assets/             hashed CSS, per-page scripts and the 3D engine (loaded on demand)
    dist/img/                responsive WebP + AVIF photos from src/data/photos.json
    dist/fonts/, dist/js/    self-hosted fonts and three.js
    dist/sitemap.xml, robots.txt, llms.txt, llms-full.txt, 404.html, icons

    node build.js          build once
    node build.js --watch  rebuild whenever a file in src/ changes
    SITE_ENV=live          removes the noindex tag (use at launch only)

  The build fails if any page has invalid metadata or structured data.
*/
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const esbuild = require('esbuild');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');
const CACHE = path.join(__dirname, '.cache', 'img');
const SITE = 'https://itoppools.com';
const LIVE = process.env.SITE_ENV === 'live';
const WIDTHS = [640, 828, 1200, 1920];
const errors = [];

const read = p => fs.readFileSync(path.join(SRC, p), 'utf8').replace(/\r\n/g, '\n');
const json = p => JSON.parse(read(p));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const plain = html => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').replace(/ ([.,;:?!])/g, '$1').trim();
const safeJSON = v => JSON.stringify(v).replace(/</g, '\\u003c');
const hash = s => crypto.createHash('md5').update(s).digest('hex').slice(0, 10);
const write = (rel, data) => { const f = path.join(DIST, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
const fresh = m => { delete require.cache[require.resolve(m)]; return require(m); };
const setEmpty = (html, id, inner) => { const re = new RegExp(`(id="${id}"[^>]*>)(</)`); if (!re.test(html)) errors.push('no empty element #' + id); return html.replace(re, (m, a, b) => a + inner + b); };
const setInner = (html, id, inner) => { const re = new RegExp(`(id="${id}"[^>]*>)[^<]*(</)`); if (!re.test(html)) errors.push('no element #' + id); return html.replace(re, (m, a, b) => a + inner + b); };

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
// Descriptive file names for image search
const slugFor = p => p.category === 'model' ? `${p.model}-fiberglass-pool` : `${(p.caption || p.id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 6).join('-')}`;
async function buildPhotos(list) {
  const out = path.join(DIST, 'img');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const found = {};
  await Promise.all(list.map(async p => {
    const file = path.join(SRC, 'assets/img', p.file);
    if (!fs.existsSync(file)) { errors.push('missing photo: ' + p.file); return; }
    const meta = await sharp(file).metadata();
    const widths = WIDTHS.filter(w => w < meta.width);
    if (widths.length < WIDTHS.length) widths.push(Math.min(meta.width, 1920));
    const f = slugFor(p);
    for (const w of widths) {
      fs.writeFileSync(path.join(out, `${f}-${w}.webp`), await photoVariant(file, w, 'webp'));
      fs.writeFileSync(path.join(out, `${f}-${w}.avif`), await photoVariant(file, w, 'avif'));
    }
    const lq = await sharp(file).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
    const nw = widths[widths.length - 1];
    found[p.id] = { f, w: widths, nw, nh: Math.round(nw * meta.height / meta.width), alt: p.alt, cap: p.caption, model: p.model, cat: p.category, lq: 'data:image/webp;base64,' + lq.toString('base64') };
  }));
  return Object.fromEntries(list.filter(p => found[p.id]).map(p => [p.id, found[p.id]]));
}

async function build() {
  const t0 = Date.now();
  errors.length = 0;
  const C = path.join(SRC, 'content');
  const models = json('data/models.json'), photoList = json('data/photos.json'), faq = json('data/faq.json'), site = json('data/site.json'), pagesData = json('data/pages.json'), content = json('data/content.json');
  const COPY = fresh(path.join(C, 'models.js')), P = fresh(path.join(C, 'pages.js')), AX = fresh(path.join(C, 'articles.js'));
  const allItems = faq.groups.flatMap(g => g.items);
  const updated = new Date(site.contentUpdated + 'T12:00:00Z');
  const updatedLabel = updated.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const photos = await buildPhotos(photoList);
  const src = (id, w) => `/img/${photos[id].f}-${w}.webp`;
  const abs = (id, w = 1200) => { const p = photos[id]; return `${SITE}/img/${p.f}-${p.w.filter(x => x <= w).pop() || p.w[0]}.webp`; };
  const srcset = (id, widths, fmt) => widths.map(w => `/img/${photos[id].f}-${w}.${fmt} ${w}w`).join(', ');
  const pic = (id, alt, sizes, eager) => { const p = photos[id]; if (!p) return ''; return `<picture><source type="image/avif" srcset="${srcset(id, p.w, 'avif')}" sizes="${sizes}"><source type="image/webp" srcset="${srcset(id, p.w, 'webp')}" sizes="${sizes}"><img src="${src(id, p.w.filter(w => w <= 1200).pop() || p.w[0])}" width="${p.nw}" height="${p.nh}" alt="${esc(alt === undefined ? p.alt : alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async" draggable="false"></picture>`; };
  const heroIds = site.hero.filter(id => photos[id]);

  // ---------- Articles
  const ARTS = [...json('data/articles.json').map(a => ({ ...a, b: (AX.answers[a.id] ? `<p class="answer">${AX.answers[a.id]}</p>` : '') + a.b, answer: AX.answers[a.id] })), ...AX.newArticles.map(a => ({ ...a, b: `<p class="answer">${a.answer}</p><div class="takeaways"><b>Key takeaways</b><ul>${a.take.map(x => `<li>${x}</li>`).join('')}</ul></div>${a.b}` }))];
  const { STAGES, TL, LOANS, STEPS, ART_IMG, MTX } = content;

  // ---------- Fonts + assets
  const FONTS = [['Inter Tight', 'inter-tight-var.woff2', '100 900', 'normal'], ['Inter', 'inter-var.woff2', '100 900', 'normal'], ['Instrument Serif', 'instrument-serif-regular.woff2', '400', 'normal'], ['Instrument Serif', 'instrument-serif-italic.woff2', '400', 'italic']];
  const fontCss = FONTS.map(([family, file, weight, style]) => `@font-face{font-family:'${family}';src:url(/fonts/${file}) format('woff2');font-weight:${weight};font-style:${style};font-display:swap}`).join('\n');
  fs.mkdirSync(path.join(DIST, 'fonts'), { recursive: true });
  for (const [, file] of FONTS) fs.copyFileSync(path.join(SRC, 'assets/fonts', file), path.join(DIST, 'fonts', file));
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
  fs.copyFileSync(path.join(SRC, 'vendor/three.min.js'), path.join(DIST, 'js/three.min.js'));
  fs.rmSync(path.join(DIST, 'assets'), { recursive: true, force: true });
  const emit = async (name, code, loader) => { const r = await esbuild.transform(code, { minify: true, loader, target: loader === 'js' ? 'es2019' : undefined }); const f = `/assets/${name}.${hash(r.code)}.${loader}`; write(f, r.code); return { f, size: r.code.length }; };
  const cssFiles = fs.readdirSync(path.join(SRC, 'css')).sort();
  const cssRaw = (fontCss + '\n' + cssFiles.map(f => read('css/' + f)).join('\n')).replace(/\{\{IMG:([\w-]+):(\d+)\}\}/g, (m, id, w) => src(id, w)).replace(/\/img\/m-whitsunday-1200\.webp/g, src('m-whitsunday', 1200));
  const cssAsset = await emit('app', cssRaw, 'css');
  const FIN = read('js/shared/finish.js'), GEO = read('js/shared/geo.js');
  const inject = t => t.replace('{{FINISH}}', () => FIN).replace('{{GEO}}', () => GEO);
  const engine = await emit('engine', '(function(){"use strict";\n' + inject(read('js/engine.js')) + '\n})();', 'js');
  const siteForApp = { leadWebhook: site.leadWebhook, leadEmail: site.leadEmail, engine: engine.f };
  const galByModel = {}; for (const g of json('data/gallery.json')) if (g.m) galByModel[g.m] = (galByModel[g.m] || 0) + 1;
  const BUNDLES = { home: ['base', 'data', 'hero', 'd3', 'studio', 'lab', 'minicalc', 'cards', 'home'], pools: ['base', 'data', 'cards', 'finder'], model: ['base', 'data', 'cards', 'model'], studio: ['base', 'data', 'd3', 'studio'], colours: ['base', 'data', 'd3', 'lab'], cost: ['base', 'data', 'estimator'], quote: ['base', 'data', 'quote'], why: ['base', 'why'], work: ['base', 'work'], learn: ['base', 'learn'], financing: ['base', 'minicalc'], plain: ['base'] };
  const jsFor = {};
  for (const [name, parts] of Object.entries(BUNDLES)) {
    const code = '(function(){"use strict";\n' + parts.map(p => read(`js/${p}.js`)).join('\n') + '\n' + read('js/boot.js') + '\n})();';
    const filled = inject(code).replace('{{SITEJSON}}', () => safeJSON(siteForApp)).replace('{{PHOTOSJSON}}', () => safeJSON(photos)).replace('{{MODELSJSON}}', () => safeJSON(models));
    jsFor[name] = (await emit(name, filled, 'js'));
  }

  // ---------- Reusable HTML
  const qaHTML = (it, open) => `<div class="qa${open ? ' open' : ''}" id="q-${it.id}"><h3 class="qa-h"><button aria-expanded="${open}">${it.q}<span class="pm"></span></button></h3><div class="ans"><div><p>${it.a}</p>${it.cost ? '<p class="qa-cta"><a href="/free-3d-design/" class="btn dark">Get my firm price <span class="arr">→</span></a></p>' : ''}</div></div></div>`;
  const qaList = items => `<div class="fq-list">${items.map((it, i) => qaHTML(it, i === 0)).join('')}</div>`;
  const compareTable = c => `<div class="ct-wrap"><table class="cost-tbl"><caption class="vh">${esc(c.caption)}</caption><thead><tr><th scope="col"><span class="vh">Compare</span></th>${c.columns.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${c.rows.map(([label, ...vals]) => `<tr><th scope="row">${label}</th>${vals.map((v, i) => `<td data-l="${esc(c.columns[i])}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="fine ct-note">${c.note}</p>`;
  const faqPage = () => `<aside class="fq-nav" aria-label="FAQ topics">${faq.groups.map(g => `<a href="#g-${g.id}" data-scroll>${g.title}</a>`).join('')}</aside><div class="fq-main">${faq.groups.map((g, gi) => `<section class="fq-g" id="g-${g.id}"><h2>${g.title}</h2>${g.compare ? compareTable(faq.compare) : ''}<div class="fq-list">${g.items.map((it, i) => qaHTML(it, gi === 0 && i === 0)).join('')}</div></section>`).join('')}</div>`;
  const biggest = m => m.sizes.reduce((a, b) => (b.L > a.L ? b : a), m.sizes[0]);
  const smallest = m => m.sizes.reduce((a, b) => (b.L < a.L ? b : a), m.sizes[0]);
  const zLabel = (m, z) => { const own = m.n.split(' '); return z.label.split(' ').filter(w => !own.includes(w)).join(' ') || (m.sizes.length > 1 ? 'Standard' : `${z.Ls} × ${z.Ws}`); };
  const allSizes = m => { const v = x => x || 'See spec sheet'; return `<div class="ct-wrap"><table class="cost-tbl"><thead><tr><th scope="col">Version</th>${['Length', 'Width', 'Shallow', 'Deep', 'Lounger', 'Gallons'].map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${m.sizes.map(z => `<tr><th scope="row">${z.label}</th><td data-l="Length">${v(z.Ls)}</td><td data-l="Width">${v(z.Ws)}</td><td data-l="Shallow">${v(z.Ss)}</td><td data-l="Deep">${v(z.Ds)}</td><td data-l="Lounger">${z.lounger || 'None listed'}</td><td data-l="Gallons">${z.gal ? z.gal.toLocaleString('en-US') : 'See spec sheet'}</td></tr>`).join('')}</tbody></table></div>`; };
  const card = (m, level = 'h3') => { const z = biggest(m); return `<div class="pc"><div class="pl pl-ph">${pic('m-' + m.id, undefined, '(max-width:680px) 100vw,340px')}</div><${level}>${m.n}</${level}><div class="t">${m.t}</div><div class="dims"><div><small>Length</small><b>${z.Ls}</b></div><div><small>Width</small><b>${z.Ws}</b></div><div><small>Deep</small><b>${z.Ds || '—'}</b></div></div><div class="acts"><a href="/fiberglass-pools/${m.id}/">View ${m.n}</a><a href="/3d-pool-design/?m=${m.id}">3D</a></div></div>`; };
  const similar = m => models.filter(x => x !== m).sort((a, b) => (b.cat === m.cat) - (a.cat === m.cat) || Math.abs(biggest(a).L - biggest(m).L) - Math.abs(biggest(b).L - biggest(m).L)).slice(0, 3);
  const artCard = a => { const s = STAGES.find(x => x[0] === a.st); return `<a class="ac" data-st="${a.st}" href="/pool-school/${a.id}/"><div class="im">${pic(ART_IMG[a.img], '', '(max-width:680px) 100vw,400px')}<span class="tag">${s[1]}</span></div><div class="tx"><h3>${a.t}</h3><p>${a.d}</p><div class="meta"><span>${a.min} min read</span><span>Read guide →</span></div></div></a>`; };
  const modelFaq = m => { const big = biggest(m), small = smallest(m), n = m.n, fl = m.fl.join(' ').toLowerCase(), many = m.sizes.length > 1;
    const fit = small.L <= 24 ? `Yes, the ${n} can suit a small Jacksonville yard. ${many ? 'Its smallest version' : 'It'} is ${small.Ls} by ${small.Ws}` : small.L <= 31 ? `It can, depending on your lot. ${many ? 'The smallest ' + n : 'The ' + n} is ${small.Ls} by ${small.Ws}` : `The ${n} suits a larger yard better. ${many ? 'Its smallest version' : 'It'} is ${small.Ls} by ${small.Ws}`;
    const q = [{ id: 'yard', q: `Is the ${n} good for a small Jacksonville yard?`, a: `${fit}, before you allow for a deck and setbacks. iTop Pools measures your yard on a free site visit and confirms whether it fits.` },
      { id: 'gallons', q: `How many gallons does the ${n} hold?`, a: m.sizes.filter(z => z.gal).map(z => `The ${z.label} holds about ${z.gal.toLocaleString('en-US')} gallons`).join('. ') + '. These figures come from Barrier Reef Pools USA.' },
      { id: 'deep', q: `How deep is the ${n}?`, a: m.sizes.map(z => z.Ss ? `The ${z.label} goes from ${z.Ss} to ${z.Ds}` : `The ${z.label} reaches ${z.Ds}`).join('. ') + '.' },
      { id: 'extras', q: `Does the ${n} have a spa or tanning ledge?`, a: m.spa ? `Yes, the ${n} has an integrated spa built into the shell${/ledge|sundeck/.test(fl) ? ', plus a lounging ledge' : ''}.` : m.feats.includes('ledge') ? `The ${n} has a lounging area${m.sizes.some(z => z.lounger) ? ' on its listed lounger versions' : ''}, but no built-in spa. Ask iTop Pools about adding a separate one.` : `The ${n} has no built-in spa or lounging ledge listed. Ask iTop Pools what can be added to it.` }];
    return q.map(x => ({ ...x, id: `${m.id}-${x.id}` })); };
  const NAP = `<address class="nap-card"><b>iTop Pools</b><br>6510 Columbia Park Drive, Suite 206<br>Jacksonville, FL 32258<br><a href="tel:+19046852555">(904) 685-2555</a><br><a href="mailto:hello@itoppools.com">hello@itoppools.com</a><br>Mon–Fri, 9:00 AM – 6:00 PM</address>`;
  const heroBand = (crumbs, eyebrow, h1, sl, lead) => `<section class="phero"><div class="wrap"><div class="crumbs"><a href="/">Home</a>${crumbs.map(([n, u]) => `<span>/</span>${u ? `<a href="${u}">${n}</a>` : `<b>${n}</b>`}`).join('')}</div><div class="ph-grid"><div><div class="eyebrow light">${eyebrow}</div><h1>${h1}${sl ? ` ${sl}` : ''}</h1></div><p class="lead">${lead}</p></div></div></section>`;

  // ---------- Split body.html
  let body = read('body.html')
    .replace('{{FAQHOME}}', () => qaList(allItems.filter(it => it.top)))
    .replace('{{FAQWHY}}', () => qaList(allItems.filter(it => it.why)))
    .replace('{{FAQPAGE}}', () => faqPage())
    .replace('{{NSMODELS}}', () => models.map(m => `<li><a href="/fiberglass-pools/${m.id}/">${m.n}</a></li>`).join(''))
    .replace(/\{\{MODELCOUNT\}\}/g, models.length);
  const mainAt = body.indexOf('<main id="app">') + '<main id="app">'.length, mainEnd = body.indexOf('</main>');
  const parkAt = body.indexOf('<!-- shared components'), footAt = body.indexOf('<footer>');
  const shellTop = body.slice(0, mainAt), shellBottom = body.slice(mainEnd, parkAt) + body.slice(footAt).replace(/id="fLearn"><\/ul>/, () => `id="fLearn">${ARTS.slice(0, 6).map(a => `<li><a href="/pool-school/${a.id}/">${a.t.split(/[:?]/)[0]}</a></li>`).join('')}</ul>`);
  const parking = body.slice(parkAt, footAt);
  const studioAt = parking.indexOf('<div class="studio" id="studio">'), labAt = parking.indexOf('<div class="lab" id="lab">');
  const studioHtml = parking.slice(studioAt, labAt), labHtml = parking.slice(labAt, parking.lastIndexOf('</div>'));
  const FRAG = {};
  body.slice(mainAt, mainEnd).split(/(?=<div class="route" data-route=")/).forEach(c => { const m = c.match(/^<div class="route" data-route="(\w+)"/); if (m) FRAG[m[1]] = c.replace(/<!-- =+ [^>]* =+ -->\s*$/, '').trim(); });
  // sub-page hero CTAs, in the HTML rather than added by script, so nothing shifts
  const heroCTA = '<div class="ph-ctas"><a href="/free-3d-design/" class="btn">Get my free 3D design <span class="arr">→</span></a><a href="tel:+19046852555" class="ph-call">or call (904) 685-2555</a></div>';
  const withCTA = h => h.replace(/(<div class="ph-grid">[\s\S]*?)<p class="lead">([\s\S]*?)<\/p>/g, (m, a, l) => `${a}<div class="ph-side"><p class="lead">${l}</p>${heroCTA}</div>`);
  const portals = h => h.replace('<div class="portal" data-p="studio"></div>', () => studioHtml).replace('<div class="portal" data-p="lab"></div>', () => labHtml);

  // ---------- Metadata and validation
  const META = { ...pagesData.pages };
  const modelMeta = m => { const z = biggest(m), g = z.gal.toLocaleString('en-US'); const a = [`The Barrier Reef ${m.n} fiberglass pool, up to ${z.Ls} long and ${g} gallons. See official specs and get a free 3D design from iTop Pools in Jacksonville.`, `The Barrier Reef ${m.n} fiberglass pool, up to ${z.Ls} long and ${g} gallons. See official specs and get a free 3D design from iTop Pools, Florida.`, `The Barrier Reef ${m.n} pool, up to ${z.Ls} long and ${g} gallons. See official specs and get a free 3D design from iTop Pools, Florida.`, `The Barrier Reef ${m.n} pool, up to ${z.Ls} long and ${g} gallons. See official specs and get a free 3D design from iTop Pools.`, `The Barrier Reef ${m.n} pool, up to ${z.Ls} long and ${g} gallons. See its official specs and get a free 3D design from iTop Pools in Jacksonville, FL.`]; return { t: `${m.n} Fiberglass Pool: Sizes & Specs | iTop Pools`, d: a.find(x => x.length >= 140 && x.length <= 155) || a[0] }; };
  models.forEach(m => { META[`/fiberglass-pools/${m.id}/`] = modelMeta(m); });
  ARTS.forEach(a => { META[`/pool-school/${a.id}/`] = pagesData.articles[a.id]; });

  const areaCities = site.business.areaServed.map(c => ({ '@type': 'City', name: c }));
  const biz = { ...site.business, '@id': `${SITE}/#business`, areaServed: areaCities, logo: `${SITE}/apple-touch-icon.png`, image: abs(heroIds[0]), hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Pool and outdoor services', itemListElement: ['Fiberglass pools', 'Spas', 'Paver decks', 'Screen enclosures', 'Pool remodels', 'Outdoor kitchens'].map(n => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n } })) }, ...(site.sameAs.length ? { sameAs: site.sameAs } : {}) };
  const baseGraph = [biz, { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'iTop Pools', url: `${SITE}/`, logo: `${SITE}/apple-touch-icon.png`, telephone: biz.telephone, email: biz.email, address: biz.address }, { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'iTop Pools', publisher: { '@id': `${SITE}/#org` }, inLanguage: 'en-US' }];
  const crumbsLd = list => ({ '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ...list].map(([name, u], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + u })) });
  const product = m => ({ '@type': 'Product', '@id': `${SITE}/fiberglass-pools/${m.id}/#product`, name: `${m.n} fiberglass pool`, description: plain((COPY[m.id] ? COPY[m.id].desc[0] : m.blurb)), category: 'Fiberglass swimming pool', brand: { '@type': 'Brand', name: 'Barrier Reef Pools' }, image: abs('m-' + m.id), url: `${SITE}/fiberglass-pools/${m.id}/`, additionalProperty: m.sizes.flatMap(s => [['Length', s.Ls], ['Width', s.Ws], ['Shallow depth', s.Ss], ['Deep depth', s.Ds], ['Gallons', s.gal && s.gal.toLocaleString('en-US')]].filter(x => x[1]).map(([k, v]) => ({ '@type': 'PropertyValue', name: `${s.label} ${k}`, value: v }))) });
  const faqLd = (items, id) => ({ '@type': 'FAQPage', '@id': id, mainEntity: items.map(it => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: plain(it.a) } })) });

  const tracking = `${site.googleVerify ? `<meta name="google-site-verification" content="${esc(site.googleVerify)}">\n` : ''}${site.bingVerify ? `<meta name="msvalidate.01" content="${esc(site.bingVerify)}">\n` : ''}<script>window.dataLayer=window.dataLayer||[];</script>${site.gtm ? `\n<script async src="https://www.googletagmanager.com/gtm.js?id=${esc(site.gtm)}"></script><script>dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});</script>` : ''}${site.ga4 && !site.gtm ? `\n<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.ga4)}"></script><script>function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(site.ga4)}');</script>` : ''}`;
  const noscript = `<noscript><style>.rv,.flow,.mtx,.tli,.sh,.stg-g>*,.ir,.ir img,.sh .w>span{opacity:1!important;transform:none!important;clip-path:none!important}.hs-ui,.burger,.fp-open,.fp-apply,.r2,.cmp,.cursor,.cmp-tray,.mbar,.fp-side,.q-prog,.q-nav,#qForm,#studio,#lab{display:none!important}.ans{grid-template-rows:1fr!important;max-height:none!important;overflow:visible!important}.ans>div{overflow:visible!important}section{content-visibility:visible!important}</style></noscript>`;
  const legacyHash = `<script>(function(){var h=location.hash;if(h==='#faq'){location.replace('/faq/');return}var m=h.match(/^#\\/([a-z]+)(\\/[^?]*)?(\\?.*)?$/);if(m){var R={pools:'fiberglass-pools',learn:'pool-school',studio:'3d-pool-design',colours:'pool-colors',cost:'pool-cost-jacksonville',work:'our-work',why:'process-and-warranty',quote:'free-3d-design',faq:'faq'};if(R[m[1]])location.replace('/'+R[m[1]]+(m[2]?m[2].replace(/\\/?$/,'/'):'/')+(m[3]||''))}})();</script>`;

  const lint = (url, graph) => { const need = { Product: ['name', 'brand', 'image'], Article: ['headline', 'author', 'datePublished', 'dateModified', 'image'], FAQPage: ['mainEntity'], BreadcrumbList: ['itemListElement'], Service: ['name', 'provider'], HowTo: ['name', 'step'] }; graph.forEach(g => { const ty = [].concat(g['@type'] || []); ty.forEach(t => (need[t] || []).forEach(k => { if (g[k] === undefined || g[k] === null || (Array.isArray(g[k]) && !g[k].length)) errors.push(`${url}: ${t} missing ${k}`); })); if (!ty.length) errors.push(`${url}: JSON-LD node without @type`); }); };
  const sizes = {};
  const page = ({ url, route, js = 'plain', graph = [], content: c, preload = '', ogImage, inlineHead = '' }) => {
    const m = META[url];
    if (!m) { errors.push('no metadata: ' + url); return; }
    if (m.t.length > 60) errors.push(`title ${m.t.length} chars: ${url}`);
    if (m.d.length < 140 || m.d.length > 155) errors.push(`description ${m.d.length} chars: ${url}`);
    const full = [...baseGraph, ...graph]; lint(url, full);
    const canonical = SITE + url, img = ogImage || abs(heroIds[0]);
    const main = c.replace(/<div class="route"( on)? data-route="/, '<div class="route on" data-route="');
    const html = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(m.t)}</title>
<meta name="description" content="${esc(m.d)}">
<meta name="theme-color" content="#071a33">
${LIVE ? '' : '<meta name="robots" content="noindex">\n'}<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="iTop Pools"><meta property="og:title" content="${esc(m.t)}"><meta property="og:description" content="${esc(m.d)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(m.t)}"><meta name="twitter:description" content="${esc(m.d)}"><meta name="twitter:image" content="${img}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="/fonts/inter-tight-var.woff2" media="(min-width:700px)" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/inter-var.woff2" media="(min-width:700px)" crossorigin>
${preload}${inlineHead}<link rel="stylesheet" href="${cssAsset.f}">
${noscript}
${tracking}
<script type="application/ld+json">${safeJSON({ '@context': 'https://schema.org', '@graph': full })}</script>
<script src="${jsFor[js].f}" defer></script>
</head>
<body data-route="${route}">
${shellTop}
${main}
${shellBottom}
</body>
</html>`;
    write(url.replace(/^\//, '') + 'index.html', html);
    sizes[url] = html.length;
  };

  // ---------- Home
  const large = photos[heroIds[0]].w.filter(w => w >= 1200);
  const small = photos[heroIds[0]].w.filter(w => w <= 828);
  const slides = heroIds.map((id, i) => { const p = photos[id], m = models.find(x => x.id === p.model), cap = m ? m.n : p.cap; const inner = i === 0 ? `<picture><source media="(min-width:700px)" type="image/avif" srcset="${srcset(id, large, 'avif')}" sizes="100vw"><source media="(min-width:700px)" type="image/webp" srcset="${srcset(id, large, 'webp')}" sizes="100vw"><source media="(max-width:699px)" type="image/avif" srcset="${srcset(id, small, 'avif')}" sizes="100vw"><source media="(max-width:699px)" type="image/webp" srcset="${srcset(id, small, 'webp')}" sizes="100vw"><img src="${src(id, small[small.length - 1])}" width="${p.nw}" height="${p.nh}" alt="${esc(p.alt)}" fetchpriority="high" decoding="async"></picture>` : ''; return `<div class="hs${i === 0 ? ' on' : ''}" data-id="${id}" data-cap="${esc(cap)}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${heroIds.length}: ${esc(cap)}">${inner}</div>`; }).join('\n    ');
  let home = portals(FRAG.home.replace('{{HEROSLIDES}}', () => slides));
  home = setEmpty(home, 'flow', STEPS.map((s, i) => `<div class="fl"><div class="dot">${String(i + 1).padStart(2, '0')}</div><h3>${s[0]}</h3><p>${s[1]}</p><span class="who ${s[3]}">${s[2]}</span></div>`).join(''));
  home = setEmpty(home, 'artHome', ARTS.filter(a => ['fiberglass-pros-and-cons', 'best-pool-size', 'permits'].includes(a.id)).map(artCard).join(''));
  home = setEmpty(home, 'gTrack', Object.keys(photos).filter(id => id.startsWith('p-')).map(id => `<figure class="g-it" data-full="${src(id, photos[id].w[photos[id].w.length - 1])}">${pic(id, photos[id].cap, '(max-width:680px) 80vw,420px')}<figcaption>${photos[id].cap}</figcaption></figure>`).join(''));
  page({ url: '/', route: 'home', js: 'home', content: home, inlineHead: legacyHash + '\n', preload: `<link rel="preload" as="image" media="(min-width:700px)" type="image/avif" imagesrcset="${srcset(heroIds[0], large, 'avif')}" imagesizes="100vw">\n<link rel="preload" as="image" media="(max-width:699px)" type="image/avif" imagesrcset="${srcset(heroIds[0], small, 'avif')}" imagesizes="100vw" fetchpriority="high">\n`, graph: [{ '@type': 'ItemList', name: 'Barrier Reef fiberglass pool models', numberOfItems: models.length, itemListElement: models.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.n, url: `${SITE}/fiberglass-pools/${m.id}/` })) }, faqLd(allItems.filter(it => it.top), `${SITE}/#faq`)] });

  // ---------- Finder, hubs, models
  page({ url: '/fiberglass-pools/', route: 'pools', js: 'pools', content: setEmpty(withCTA(FRAG.pools), 'fpCards', models.map(m => card(m)).join('')), graph: [crumbsLd([['Pool models', '/fiberglass-pools/']]), { '@type': 'ItemList', name: 'Barrier Reef fiberglass pool models', numberOfItems: models.length, itemListElement: models.map((m, i) => ({ '@type': 'ListItem', position: i + 1, item: product(m) })) }] });
  for (const [slug, s] of Object.entries(P.shapes)) {
    const list = models.filter(s.filter), url = `/fiberglass-pools/${slug}/`;
    page({ url, route: 'shape', graph: [crumbsLd([['Pool models', '/fiberglass-pools/'], [s.h, url]])], content: `<div class="route" data-route="shape">${withCTA(heroBand([['Pool models', '/fiberglass-pools/'], [s.h]], `${list.length} model${list.length > 1 ? 's' : ''}`, s.h, s.sl, 'Official Barrier Reef specs, with a free 3D design and site visit from iTop Pools.'))}<section class="sec guide"><div class="wrap"><div class="guide-w"><p class="answer">${s.ans}</p></div><div class="hub-cards">${list.map(m => card(m, 'h2')).join('')}</div><div class="guide-w" style="margin-top:32px"><p>Compare every shape in the <a href="/fiberglass-pools/">model finder</a>, see <a href="/pool-colors/">finish colors</a>, or read <a href="/pool-cost-jacksonville/">what a pool costs in Jacksonville</a>.</p></div></div></section>${P.cta('Not sure which shape fits?', 'We measure your yard on the free site visit and show you the options in 3D.')}</div>` });
  }
  for (const m of models) {
    const z = biggest(m), i = m.sizes.indexOf(z), url = `/fiberglass-pools/${m.id}/`, copy = COPY[m.id];
    if (!copy) errors.push('no model copy: ' + m.id);
    const small = smallest(m), qa = modelFaq(m), sim = similar(m);
    const about = `<h2>About the ${m.n}</h2>${copy.desc.map(p => `<p>${p}</p>`).join('')}<h2>Who is the ${m.n} best for?</h2><p>${copy.suits}</p><h2>How much yard does the ${m.n} need?</h2><p>As a first estimate, allow about ${Math.ceil(z.L + 8)}' by ${Math.ceil(z.W + 8)}' for ${m.sizes.length > 1 ? `the ${z.label}` : `the ${m.n}`}, which adds a 4-foot walkway on each side${small !== z ? `, or about ${Math.ceil(small.L + 8)}' by ${Math.ceil(small.W + 8)}' for the ${small.label}` : ''}. Your setbacks, easements and deck plans decide the real limit, and we confirm them on the free site visit.</p><p>Next steps: see <a href="/pool-colors/">finish colors</a>, <a href="/pool-cost-jacksonville/">what a pool costs in Jacksonville</a>, or <a href="/3d-pool-design/?m=${m.id}">the ${m.n} in the 3D studio</a>.</p>`;
    let c = FRAG.model.replace('{{MDALL}}', () => allSizes(m)).replace('{{MDABOUT}}', () => about).replace('{{MDFAQ}}', () => `<h2>${m.n} questions</h2>${qaList(qa)}`);
    c = setInner(c, 'mdCrumb', m.n); c = setInner(c, 'mdName', `${m.n} fiberglass pool`); c = setEmpty(c, 'mdBlurb', esc(m.blurb));
    c = setEmpty(c, 'mdTags', `${m.feats.includes('new') ? '<span class="n">New for 2026</span>' : ''}<span>${m.t}</span><span>Barrier Reef</span>`);
    c = setEmpty(c, 'mdSizes', `<small>${m.sizes.length > 1 ? 'Choose a version' : 'Available version'}</small>${m.sizes.map((s, k) => `<button type="button" data-i="${k}"${k === i ? ' class="on"' : ''}>${zLabel(m, s)}</button>`).join('')}`);
    const galN = id => galByModel[id] || 0;
    c = setEmpty(c, 'mdPhoto', `${pic('m-' + m.id, undefined, '(max-width:900px) 100vw,620px', true)}<figcaption>${m.n} · Photo: Barrier Reef Pools USA${galN(m.id) ? ` · <a href="/our-work/?model=${m.id}">See all ${galN(m.id)} ${m.n} photos</a>` : ''}</figcaption>`);
    c = setEmpty(c, 'mdSpec', [['Length', z.Ls], ['Width', z.Ws], ['Shallow end', z.Ss || 'See spec sheet'], ['Deep end', z.Ds || 'See spec sheet'], ...(z.lounger ? [['Lounger', z.lounger]] : []), ['Water', z.gal ? z.gal.toLocaleString('en-US') + ' gal' : 'See spec sheet']].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join(''));
    c = setEmpty(c, 'mdFeat', m.fl.map(f => `<li>${f}</li>`).join(''));
    c = setEmpty(c, 'mdSim', sim.map(x => card(x)).join(''));
    c = setInner(c, 'mdAsideName', m.n); c = setInner(c, 'mdAsideSize', `${z.Ls} × ${z.Ws}`);
    c = c.replace(/href="[^"]*" class="btn" id="md3d"/, `href="/3d-pool-design/?m=${m.id}" class="btn" id="md3d"`).replace(/href="[^"]*" class="btn ghost" id="mdQuote"/, `href="/free-3d-design/?m=${m.id}" class="btn ghost" id="mdQuote"`).replace(/href="[^"]*" class="btn" id="mdAsideQ"/, `href="/free-3d-design/?m=${m.id}" class="btn" id="mdAsideQ"`);
    const p0 = photos['m-' + m.id];
    page({ url, route: 'model', js: 'model', ogImage: abs('m-' + m.id), content: c, preload: `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset('m-' + m.id, p0.w, 'avif')}" imagesizes="(max-width:900px) 100vw,620px" fetchpriority="high">\n`, graph: [crumbsLd([['Pool models', '/fiberglass-pools/'], [m.n, url]]), { ...product(m), isRelatedTo: sim.map(x => ({ '@type': 'Product', name: `${x.n} fiberglass pool`, url: `${SITE}/fiberglass-pools/${x.id}/` })) }, faqLd(qa, `${SITE}${url}#faq`)] });
  }

  // ---------- Other templates
  const finMeta = Object.entries(new Function(`return ${read('js/data.js').match(/const FIN_META=(\{[\s\S]*?\n\});/)[1]}`)());
  const FINV = new Function(`${FIN_RAW(read)};return FINISH`)();
  page({ url: '/3d-pool-design/', route: 'studio', js: 'studio', graph: [crumbsLd([['3D design studio', '/3d-pool-design/']])], content: portals(FRAG.studio) });
  page({ url: '/pool-colors/', route: 'colors', js: 'colours', graph: [crumbsLd([['Colors', '/pool-colors/']])], content: setEmpty(portals(withCTA(FRAG.colors)), 'palGrid', finMeta.map(([k, f]) => `<button class="pal" data-v="${k}"><div class="chip-c" style="background:linear-gradient(160deg,${FINV[k].shallow},${FINV[k].basin} 45%,${FINV[k].deep})"></div><div class="tx"><b>${f.n}</b><p>${f.d}</p></div></button>`).join('')) });
  const cmpFaq = faq.groups.find(g => g.id === 'compare').items, finFaq = faq.groups.find(g => g.id === 'financing').items, costFaq = faq.groups.find(g => g.id === 'cost').items;
  page({ url: '/pool-cost-jacksonville/', route: 'cost', js: 'cost', graph: [crumbsLd([['Pool cost', '/pool-cost-jacksonville/']]), faqLd(costFaq, `${SITE}/pool-cost-jacksonville/#faq`)], content: withCTA(FRAG.cost).replace('{{COSTGUIDE}}', () => P.costGuide.replace('{{COMPARE}}', () => compareTable(faq.compare)).replace('{{FAQ}}', () => qaList(costFaq))) });
  const miniBlock = (FRAG.home.match(/<div class="mini rv d2">[\s\S]*?<p class="fine">[^<]*<\/p>\s*<\/div>/) || [''])[0].replace('mini rv d2', 'mini');
  if (!miniBlock) errors.push('payment calculator markup not found');
  page({ url: '/pool-financing/', route: 'financing', js: 'financing', graph: [crumbsLd([['Pool financing', '/pool-financing/']]), faqLd(finFaq, `${SITE}/pool-financing/#faq`)], content: `<div class="route" data-route="financing">${withCTA(heroBand([['Pool financing']], 'Financing guide', 'Fiberglass pool financing', 'in plain English.', 'Four common ways to pay for a pool, what each one means, and an example payment calculator.'))}${P.financing.replace('{{LOANS}}', () => LOANS.map((l, i) => `<div class="loan"><i>OPTION 0${i + 1}</i><h3>${l[0]}</h3><p>${l[1]}</p><ul>${l[2].map(x => `<li class="p">${x}</li>`).join('')}${l[3].map(x => `<li class="m">${x}</li>`).join('')}</ul></div>`).join('')).replace('{{MINICALC}}', () => miniBlock).replace('{{FAQ}}', () => qaList(finFaq))}${P.cta('Want a real number?', 'Get a firm written price after a free site visit. iTop Pools isn\'t a lender.')}</div>` });
  page({ url: '/fiberglass-vs-concrete-vs-vinyl/', route: 'compare', graph: [crumbsLd([['Fiberglass vs concrete vs vinyl', '/fiberglass-vs-concrete-vs-vinyl/']]), faqLd(cmpFaq, `${SITE}/fiberglass-vs-concrete-vs-vinyl/#faq`), { '@type': 'Article', headline: 'Fiberglass vs concrete vs vinyl pools in Florida', description: META['/fiberglass-vs-concrete-vs-vinyl/'].d, image: abs('m-bondi'), datePublished: site.contentUpdated, dateModified: site.contentUpdated, author: { '@type': 'Organization', name: 'iTop Pools', url: `${SITE}/` }, publisher: { '@id': `${SITE}/#org` } }], content: `<div class="route" data-route="compare">${withCTA(heroBand([['Fiberglass vs concrete vs vinyl']], `Updated ${updatedLabel}`, 'Fiberglass vs concrete vs vinyl pools', 'for Florida.', 'Install time, cost over time, upkeep and durability, compared honestly by a Jacksonville builder.'))}${P.compare.replace('{{COMPARE}}', () => compareTable(faq.compare)).replace('{{FAQ}}', () => qaList(cmpFaq))}${P.cta('See your yard both ways', 'We\'ll tell you if your yard needs something other than fiberglass.')}</div>` });
  let learn = setEmpty(withCTA(FRAG.learn), 'artHub', ARTS.map(artCard).join(''));
  learn = setEmpty(learn, 'journey', STAGES.map(([k, n, d], i) => `<button class="jy${i === 0 ? ' on' : ''}" data-k="${k}"><small>STAGE 0${i + 1}</small><b>${n}</b><span>${d} · ${ARTS.filter(a => a.st === k).length} guides</span></button>`).join(''));
  learn = setEmpty(learn, 'mtx', `<div class="mtx-r h"><span></span><span>Fiberglass</span><span>Concrete</span><span>Vinyl liner</span></div>${MTX.map(r => `<div class="mtx-r"><span>${r[0]}</span><span data-l="Fiberglass">${r[1]}</span><span data-l="Concrete">${r[2]}</span><span data-l="Vinyl liner">${r[3]}</span></div>`).join('')}`);
  page({ url: '/pool-school/', route: 'learn', js: 'learn', graph: [crumbsLd([['Pool School', '/pool-school/']])], content: learn });
  // Gallery: the Barrier Reef photo library (src/data/gallery.json), filtered in the browser.
  // Finished WebP files live in src/assets/gallery as <f>-640.webp and <f>-1280.webp.
  const gallery = json('data/gallery.json');
  fs.cpSync(path.join(SRC, 'assets/gallery'), path.join(DIST, 'gallery'), { recursive: true });
  const finishSrc = read('js/shared/finish.js');
  const FINN = { aquamarine: 'Aquamarine', arctic: 'Arctic', california: 'California', eveningsky: 'Evening Sky', ocean: 'Ocean', sandstone: 'Sandstone', silvermist: 'Silver Mist' };
  const FINSW = Object.fromEntries(Object.keys(FINN).map(k => { const m = finishSrc.match(new RegExp(`${k}:\\{[^}]*sw:\\['(#[0-9a-f]+)','(#[0-9a-f]+)'\\]`)); if (!m) errors.push('no swatch for ' + k); return [k, m ? [m[1], m[2]] : ['#ccc', '#999']]; }));
  const SHAPEN = { rect: 'Rectangular', free: 'Freeform', kidney: 'Kidney', roman: 'Roman', plunge: 'Plunge' };
  const OTHERN = { l20: 'Up to 20 ft long', l30: '21 to 30 ft long', l40: '31 to 40 ft long', spa: 'With a spa', aerial: 'Aerial views', outdoor: 'Outdoor living', install: 'Installation' };
  const gModel = {};
  for (const m of models) { const L = Math.max(...m.sizes.map(z => z.L)); gModel[m.id] = [m.n, [m.s, ...(m.cat === 'plunge' && m.s !== 'plunge' ? ['plunge'] : [])], L <= 20 ? 'l20' : L <= 30 ? 'l30' : 'l40']; }
  for (const g of gallery) { if (g.m && !gModel[g.m]) errors.push('gallery: unknown model ' + g.m); if (g.c && !FINN[g.c]) errors.push('gallery: unknown finish ' + g.c); if (!fs.existsSync(path.join(SRC, 'assets/gallery', g.f + '-640.webp'))) errors.push('gallery: missing ' + g.f); }
  const gTags = g => ({ shape: g.m ? gModel[g.m][1] : [], model: g.m ? [g.m] : [], color: g.c ? [g.c] : [], other: [...g.o, ...(g.m ? [gModel[g.m][2]] : [])] });
  const gCount = (k, v) => gallery.filter(g => gTags(g)[k].includes(v)).length;
  const altSeen = {};
  const gAltBase = g => g.m ? `${g.t}, a Barrier Reef ${gModel[g.m][0]} fiberglass pool` : g.t;
  // Some library photos share a title, so number the repeats to keep alt text unique
  const gAltN = new Map(gallery.map(g => { const b = gAltBase(g); altSeen[b] = (altSeen[b] || 0) + 1; return [g, altSeen[b] > 1 ? `${b} (photo ${altSeen[b]})` : b]; }));
  const gAlt = g => gAltN.get(g);
  const gCard = (g, i) => `<a class="gc" href="/gallery/${g.f}-1280.webp" data-i="${i}"><span class="gc-img"><img src="/gallery/${g.f}-640.webp" alt="${esc(gAlt(g))}" width="640" height="427"${i < 3 ? '' : ' loading="lazy"'} decoding="async"></span><span class="gc-b">${g.m ? gModel[g.m][0] : OTHERN[g.o[0]] || 'Pool'}</span><span class="gc-f"><span class="gc-t"><b>${g.m ? gModel[g.m][0] : 'iTop Pools'}</b><small>${esc(g.t)}</small></span>${g.c ? `<span class="gc-c"><i style="background:linear-gradient(135deg,${FINSW[g.c][0]},${FINSW[g.c][1]})"></i>${FINN[g.c]}</span>` : ''}</span></a>`;
  const gOpts = (k, list) => list.map(([v, l, extra = '']) => [v, l, extra, gCount(k, v)]).filter(o => o[3]).map(([v, l, extra, n]) => `<label><input type="checkbox" value="${v}">${extra}<span>${l}</span><em>${n}</em></label>`).join('');
  const gDrop = (k, label, list) => `<details class="gf-d" data-k="${k}"><summary>${label}<b></b></summary><div class="gf-m">${gOpts(k, list)}</div></details>`;
  const galFilters = `<div class="gf" id="galFil"><h2 class="gf-h">Filter the gallery</h2><div class="gf-row"><button class="gf-all on" type="button" id="gfAll">All</button>${gDrop('shape', 'Shape', Object.entries(SHAPEN))}${gDrop('model', 'Model', models.map(m => [m.id, m.n]))}${gDrop('color', 'Color', Object.entries(FINN).map(([v, l]) => [v, l, `<i style="background:linear-gradient(135deg,${FINSW[v][0]},${FINSW[v][1]})"></i>`]))}${gDrop('other', 'Other', Object.entries(OTHERN))}<button class="gf-clear" type="button" id="gfClear">Clear filters</button></div></div>`;
  const galData = { m: gModel, c: Object.fromEntries(Object.keys(FINN).map(k => [k, [FINN[k], ...FINSW[k]]])), o: OTHERN, i: gallery.map(g => [g.f, g.t, g.m, g.c, g.o.join(' ')]) };
  const work = withCTA(FRAG.work).replace('{{GALFILTERS}}', () => galFilters).replace('{{GALCARDS}}', () => gallery.slice(0, 24).map(gCard).join('')).replace('{{GALTOTAL}}', gallery.length) + `<script type="application/json" id="galData">${safeJSON(galData)}</script>`;
  page({ url: '/our-work/', route: 'work', js: 'work', graph: [crumbsLd([['Gallery', '/our-work/']]), { '@type': 'ImageGallery', name: 'Barrier Reef fiberglass pool gallery', url: `${SITE}/our-work/`, numberOfItems: gallery.length }], content: work });
  const why = withCTA(FRAG.why).replace('<div class="tl" id="tl"><div class="tl-line"><i id="tlFill"></i></div></div>', () => `<div class="tl" id="tl"><div class="tl-line"><i id="tlFill"></i></div>${TL.map((s, i) => `<div class="tli"><div class="dot">${String(i + 1).padStart(2, '0')}</div><div class="card"><span class="who ${s[2] === 'Barrier Reef' ? 'mf' : ''}">${s[2]}</span><h3>${s[0]}</h3><p>${s[1]}</p><span class="dur">${s[3]}</span></div></div>`).join('')}</div>`);
  if (!why.includes('class="tli"')) errors.push('timeline not rendered');
  page({ url: '/process-and-warranty/', route: 'why', js: 'why', graph: [crumbsLd([['Process & warranty', '/process-and-warranty/']])], content: why });
  page({ url: '/free-3d-design/', route: 'quote', js: 'quote', graph: [crumbsLd([['Free 3D design', '/free-3d-design/']])], content: FRAG.quote });
  page({ url: '/faq/', route: 'faq', graph: [crumbsLd([['FAQ', '/faq/']]), faqLd(allItems, `${SITE}/faq/#faq`)], content: withCTA(FRAG.faq) });
  page({ url: '/about/', route: 'about', graph: [crumbsLd([['About', '/about/']])], content: `<div class="route" data-route="about">${withCTA(heroBand([['About']], 'About iTop Pools', 'About iTop Pools', 'one crew, Jacksonville, FL.', 'An authorized Barrier Reef fiberglass dealer building pools, decks and pavers across Northeast Florida.'))}${P.about.replace('{{NAP}}', () => NAP)}${P.cta('Talk to the crew', 'Get a free site visit and a 3D design of your own backyard.')}</div>` });
  page({ url: '/service-areas/', route: 'areas', graph: [crumbsLd([['Service areas', '/service-areas/']]), { '@type': 'Service', name: 'Fiberglass pool installation', serviceType: 'Fiberglass pool installation', provider: { '@id': `${SITE}/#business` }, areaServed: areaCities }], content: `<div class="route" data-route="areas">${withCTA(heroBand([['Service areas']], 'Northeast Florida', 'Fiberglass pool builder', 'serving Northeast Florida.', 'Barrier Reef pools, decks and pavers across Duval, St. Johns and Clay counties.'))}${P.areas}${P.cta('Check your yard', 'A free site visit confirms access, setbacks and permits for your property.')}</div>` });
  page({ url: '/privacy/', route: 'legal', graph: [crumbsLd([['Privacy', '/privacy/']])], content: `<div class="route" data-route="legal">${heroBand([['Privacy']], 'Privacy', 'Privacy policy', '', 'How iTop Pools handles the details you share with us.')}${P.privacy.replace('{{UPDATED}}', updatedLabel)}</div>` });
  page({ url: '/terms/', route: 'legal', graph: [crumbsLd([['Terms', '/terms/']])], content: `<div class="route" data-route="legal">${heroBand([['Terms']], 'Terms', 'Website terms', '', 'The terms that apply when you use this website.')}${P.terms.replace('{{UPDATED}}', updatedLabel)}</div>` });
  for (const a of ARTS) {
    const s = STAGES.find(x => x[0] === a.st), img = ART_IMG[a.img], url = `/pool-school/${a.id}/`;
    let c = FRAG.article;
    c = setInner(c, 'artCrumb', s[1]); c = setInner(c, 'artStage', s[1] + ' stage'); c = setInner(c, 'artTitle', a.t); c = setEmpty(c, 'artSub', esc(a.d));
    c = setEmpty(c, 'artMeta', `<span>${a.min} min read</span><span>By the iTop Pools crew</span><span>Updated ${updatedLabel}</span>`);
    c = setEmpty(c, 'artBody', a.b);
    c = setEmpty(c, 'artMore', ARTS.filter(x => x !== a).sort((x, y) => (y.st === a.st) - (x.st === a.st)).slice(0, 4).map(x => `<a href="/pool-school/${x.id}/">${x.t}<span>${STAGES.find(z => z[0] === x.st)[1]} · ${x.min} min</span></a>`).join(''));
    c = c.replace('id="artHero"', `id="artHero" style="background-image:url(${src(img, photos[img].w[photos[img].w.length - 1])})"`);
    const howto = AX.HOWTO[a.id] ? [{ '@type': 'HowTo', name: a.t, description: a.d, step: AX.HOWTO[a.id].map((n, i) => ({ '@type': 'HowToStep', position: i + 1, name: n, text: n })) }] : [];
    page({ url, route: 'article', ogImage: abs(img), content: c, graph: [crumbsLd([['Pool School', '/pool-school/'], [a.t, url]]), { '@type': 'Article', headline: a.t, description: a.d, image: abs(img), datePublished: site.contentUpdated, dateModified: site.contentUpdated, author: { '@type': 'Organization', name: 'iTop Pools', url: `${SITE}/` }, publisher: { '@id': `${SITE}/#org` }, mainEntityOfPage: SITE + url }, ...howto] });
  }

  // ---------- Duplicate check
  const seenT = {}, seenD = {}; Object.entries(META).forEach(([u, m]) => { if (!m) return; if (seenT[m.t]) errors.push(`duplicate title: ${u}, ${seenT[m.t]}`); if (seenD[m.d]) errors.push(`duplicate description: ${u}, ${seenD[m.d]}`); seenT[m.t] = u; seenD[m.d] = u; });

  // ---------- 404, icons, crawl files
  write('404.html', `<!DOCTYPE html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | iTop Pools</title><meta name="robots" content="noindex"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${cssAsset.f}"><style>body{background:#071a33;color:#fff;display:grid;place-items:center;min-height:100svh;padding:24px;text-align:center}.nf{max-width:560px}.nf h1{font-size:clamp(36px,8vw,56px);font-weight:600;text-transform:none;margin-bottom:16px}.nf p{color:rgba(235,248,255,.85);margin-bottom:24px}.nf .btn{margin:6px}</style></head><body><main class="nf"><h1>That page isn't here.</h1><p>It may have moved when we rebuilt the site. Try one of these, or call (904) 685-2555.</p><a class="btn" href="/fiberglass-pools/">See pool models</a><a class="btn ghost" href="/faq/">Read the FAQ</a><a class="btn ghost" href="/">Go to the home page</a></main></body></html>`);
  const fav = read('assets/favicon.svg'); write('favicon.svg', fav);
  write('favicon-32.png', await sharp(Buffer.from(fav)).resize(32, 32).png().toBuffer());
  write('apple-touch-icon.png', await sharp(Buffer.from(fav)).resize(180, 180).png().toBuffer());
  const urls = Object.keys(sizes);
  const imageFor = u => { const m = u.match(/^\/fiberglass-pools\/([\w-]+)\/$/); return m && photos['m-' + m[1]] ? `<image:image><image:loc>${abs('m-' + m[1])}</image:loc></image:image>` : ''; };
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${site.contentUpdated}</lastmod>${imageFor(u)}</url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Claude-SearchBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot', '*'].map(b => `User-agent: ${b}\nAllow: /\n`).join('\n') + `\nSitemap: ${SITE}/sitemap.xml\n`);
  const nap = `iTop Pools\n6510 Columbia Park Drive, Suite 206, Jacksonville, FL 32258\n(904) 685-2555\nhello@itoppools.com\nMon–Fri, 9:00 AM – 6:00 PM`;
  write('llms.txt', `# iTop Pools\n\n> Authorized Barrier Reef Pools USA fiberglass dealer in Jacksonville, Florida. One in-house crew handles the pool, deck and pavers, with permits and HOA handled. Free 3D design and site visit.\n\n${nap}\n\nService area: ${site.business.areaServed.join('; ')}.\n\n## Key facts\n- Warranty: Barrier Reef Lifetime Limited Structural Warranty, transferable once; 15-year finish warranty against blistering\n- Install time: Barrier Reef puts a typical install at 2–6 weeks once permits clear\n- ${models.length} Barrier Reef models, from 16'6" to 40' long\n\n## Main pages\n- [Pool models](${SITE}/fiberglass-pools/)\n- [Fiberglass pool cost in Jacksonville](${SITE}/pool-cost-jacksonville/)\n- [Fiberglass vs concrete vs vinyl](${SITE}/fiberglass-vs-concrete-vs-vinyl/)\n- [FAQ](${SITE}/faq/)\n- [Pool financing](${SITE}/pool-financing/)\n- [Process and warranty](${SITE}/process-and-warranty/)\n- [About](${SITE}/about/)\n- [Free 3D design](${SITE}/free-3d-design/)\n\n## Pool models\n${models.map(m => `- [${m.n}](${SITE}/fiberglass-pools/${m.id}/)`).join('\n')}\n\n## Guides\n${ARTS.map(a => `- [${a.t}](${SITE}/pool-school/${a.id}/)`).join('\n')}\n`);
  write('llms-full.txt', `# iTop Pools: full reference\n\n${nap}\n\n## FAQ\n${faq.groups.map(g => `\n### ${g.title}\n${g.items.map(i => `\nQ: ${i.q}\nA: ${plain(i.a)}`).join('\n')}`).join('\n')}\n\n## Fiberglass pool cost in Jacksonville\n${plain(P.costGuide.replace('{{COMPARE}}', faq.compare.rows.map(r => r.join(': ')).join('. ')).replace('{{FAQ}}', ''))}\n\n## Pool models (specifications from Barrier Reef Pools USA)\n${models.map(m => `\n### ${m.n} (${m.t})\n${m.sizes.map(z => `- ${z.label}: ${z.Ls} x ${z.Ws}, shallow ${z.Ss || 'see spec sheet'}, deep ${z.Ds || 'see spec sheet'}${z.lounger ? `, lounger ${z.lounger}` : ''}, ${z.gal ? z.gal.toLocaleString('en-US') + ' gallons' : 'gallons on spec sheet'}`).join('\n')}`).join('\n')}\n\n## Guides\n${ARTS.map(a => `\n### ${a.t}\n${plain(a.b)}`).join('\n')}\n`);
  write(`${site.indexNowKey}.txt`, site.indexNowKey);

  const big = Object.entries(jsFor).map(([k, v]) => `${k} ${Math.round(v.size / 1024)}K`).join(', ');
  if (errors.length) { errors.forEach(e => console.error('  ! ' + e)); throw new Error(`Build failed with ${errors.length} SEO/data error(s)`); }
  console.log(`✓ dist/  ${urls.length} pages, ${models.length} models, ${allItems.length} FAQs, ${ARTS.length} guides${LIVE ? '' : ' (noindex)'}\n  scripts: ${big}; css ${Math.round(cssAsset.size / 1024)}K; engine ${Math.round(engine.size / 1024)}K; home html ${Math.round(sizes['/'] / 1024)}K  (${Date.now() - t0} ms)`);
}
function FIN_RAW(rd) { return rd('js/shared/finish.js'); }

build().then(() => {
  if (!process.argv.includes('--watch')) return;
  console.log('Watching src/ for changes… (Ctrl+C to stop)');
  let timer = null;
  fs.watch(SRC, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(() => build().catch(e => console.error(e.message)), 150); });
}).catch(e => { console.error(e.stack.split('\n').slice(0,4).join('\n')); process.exit(1); });
