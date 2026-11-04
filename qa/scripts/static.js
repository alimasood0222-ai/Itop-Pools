// No browser: greps, metadata, JSON-LD, NAP, FAQ wording, AEO, Barrier Reef comparison.
const { models, ROOT, DIST, log, fs, path } = require('./lib');
const SCR = process.argv[2];
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const textFiles = [...walk(path.join(ROOT, 'src')), ...walk(DIST), path.join(ROOT, 'README.md'), path.join(ROOT, 'PHOTOS-NEEDED.md'), path.join(ROOT, 'build.js')].filter(f => /\.(js|html|css|json|md|txt|svg|xml)$/.test(f));
const rel = f => path.relative(ROOT, f).replace(/\\/g, '/');
function grep(re, opts = {}) { const hits = []; for (const f of textFiles) { if (opts.skip && opts.skip.test(rel(f))) continue; fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => { const m = l.match(re); if (m) { const at = m.index; hits.push(`${rel(f)}:${i + 1}: ${l.slice(Math.max(0, at - 45), at + 75).trim()}`); } }); } return hits; }
const out = {};
// A1
out.underwater = grep(/Underwater|heroCanvas/i);
// A3
out.count15 = grep(/\b(15|fifteen)\s+(models|shells|Barrier|real)/i, { skip: /vendor|three\.min/ });
out.count22literal = grep(/\b22\s+(models|shells|Barrier|real)/i, { skip: /vendor|three\.min|README/ });
out.daydream = grep(/daydream/i, { skip: /vendor|three\.min/ });
out.approx = grep(/≈|\best\.|estimate from the dimensions/i, { skip: /vendor|three\.min|README|PHOTOS/ });
// A5
const COMP = { Latham: /latham/i, 'Leisure Pools': /leisure\s*pools|leisurepools/i, 'Kool Pools': /kool\s*pools/i, 'Fiberglass Pools Direct': /fiberglass\s*pools\s*direct/i, 'Lyon Financial': /lyon\s*financial/i, 'Blue Haven': /blue\s*haven/i, Paddock: /paddock/i, 'Anthony & Sylvan': /anthony\s*(&|&amp;|and)\s*sylvan/i };
out.competitors = Object.fromEntries(Object.entries(COMP).map(([k, re]) => [k, grep(re)]));
// A7 / E
out.demoText = Object.fromEntries(Object.entries({ mockup: /mock-?up/i, lorem: /lorem/i, todo: /\bTODO\b/, sample: /\bsample/i, placeholder: /placeholder/i, confirm: /\[(CONFIRM|iTop to confirm)/i, demo: /\bdemo\b/i }).map(([k, re]) => [k, grep(re, { skip: /vendor|three\.min|^dist\/|README|PHOTOS|^build\.js/ })]));
out.honesty = Object.fromEntries(Object.entries({ reviews: /★|aggregateRating|ratingValue|5\.0\b/, license: /licen[sc]e|Lic\.|CBC\b/i, years: /\b\d+\+?\s*years?\b|Years in the trade|since\s+\d{4}|data-to="15"/i, warranty: /warrant/i, install: /\b\d+\s*[–-]\s*\d+\s*(weeks?|months?)\b/i, callClaims: /one business day|answered by someone|real person|within \d/i, volume: /3,500|Hundreds|hundreds/ }).map(([k, re]) => [k, grep(re, { skip: /vendor|three\.min|^dist\/|README|PHOTOS|^build\.js|site\.json/ })]));
// D: pages
const pages = ['index.html', 'faq/index.html'].map(f => {
  const h = fs.readFileSync(path.join(DIST, f), 'utf8');
  const g = re => (h.match(re) || [])[1];
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const graph = ld.flatMap(x => x['@graph'] || [x]);
  const title = g(/<title>([^<]*)/), desc = g(/name="description" content="([^"]*)/);
  return { file: f, title, titleLen: title.length, desc, descLen: desc.length, canonical: g(/rel="canonical" href="([^"]*)/), h1InRaw: (h.match(/<h1[\s>]/g) || []).length, lang: g(/<html lang="([^"]*)/), og: ['og:title', 'og:description', 'og:url', 'og:image', 'og:type'].filter(t => h.includes(`property="${t}"`)), twitter: (h.match(/name="twitter:/g) || []).length, robotsMeta: g(/name="robots" content="([^"]*)/), hashLinks: (h.match(/href="#\//g) || []).length, jsonldBlocks: ld.length, types: graph.map(g => [].concat(g['@type']).join('+')), productCount: graph.filter(g => g['@type'] === 'ItemList').flatMap(g => g.itemListElement).filter(e => e.item['@type'] === 'Product').length, offers: /"offers"/.test(JSON.stringify(ld)), aggregateRating: /aggregateRating/.test(JSON.stringify(ld)), business: graph.find(g => [].concat(g['@type']).includes('HomeAndConstructionBusiness')), faqCount: (graph.find(g => g['@type'] === 'FAQPage') || { mainEntity: [] }).mainEntity.length, bytes: h.length };
});
out.pages = pages.map(p => ({ ...p, business: undefined }));
const b = pages[0].business; out.businessFields = { name: b.name, tel: b.telephone, address: b.address, hours: !!b.openingHoursSpecification, areaServed: (b.areaServed || []).length, sameAs: b.sameAs || null };
out.distFiles = { robots: fs.existsSync(path.join(DIST, 'robots.txt')) ? fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8') : null, sitemap: fs.existsSync(path.join(DIST, 'sitemap.xml')), llms: fs.existsSync(path.join(DIST, 'llms.txt')), llmsFull: fs.existsSync(path.join(DIST, 'llms-full.txt')), notFound: fs.existsSync(path.join(DIST, '404.html')), indexnow: walk(DIST).filter(f => /^[a-f0-9]{16,}\.txt$/.test(path.basename(f))).length, vercelJson: fs.existsSync(path.join(ROOT, 'vercel.json')) };
out.tracking = { ga: grep(/gtag|G-[A-Z0-9]{6,}|googletagmanager|GTM-/, { skip: /vendor|three\.min/ }), dataLayer: grep(/dataLayer/, { skip: /vendor|three\.min/ }), verify: grep(/google-site-verification|msvalidate/), utm: grep(/utm_|document\.referrer|landing/i, { skip: /vendor|three\.min|^dist\//}) };
// D6 NAP
out.nap = { phone: [...new Set(textFiles.filter(f => !/three\.min/.test(f)).flatMap(f => fs.readFileSync(f, 'utf8').match(/\(?\+?1?[- ]?\(?904\)?[-. ]?685[-. ]?2555/g) || []))], address: grep(/6510 Columbia/, { skip: /vendor|^dist\/|README/ }) };
// A2
const faq = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/faq.json'), 'utf8'));
const items = faq.groups.flatMap(g => g.items.map(i => ({ ...i, group: g.title })));
out.faq = { total: items.length, groups: faq.groups.map(g => `${g.title} (${g.items.length})`), costWithCta: items.filter(i => i.cost).map(i => i.q), costWithoutCta: items.filter(i => !i.cost && /cost|price|\$/i.test(i.q + i.a)).map(i => i.q), table: { columns: faq.compare.columns, rows: faq.compare.rows.map(r => r[0]) } };
// Fabio's FAQ as scraped from itoppools.com
const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const home = fs.readFileSync(path.join(SCR, 'itop-home.html'), 'utf8');
const seg = home.slice(home.indexOf('faqs: ['));
const orig = [...seg.slice(0, seg.indexOf('\n      ]')).matchAll(/q:\s*(['"])((?:\\.|(?!\1).)*)\1,\s*a:\s*(['"])((?:\\.|(?!\3).)*)\3/g)].map(m => ({ q: m[2].replace(/\\'/g, "'"), a: m[4].replace(/\\'/g, "'") }));
const sim = (x, y) => { const A = new Set(norm(x).split(' ')), B = new Set(norm(y).split(' ')); const inter = [...A].filter(w => B.has(w)).length; return inter / Math.max(A.size, B.size); };
out.fabio = orig.map(o => { const best = items.map(i => ({ i, s: sim(o.q, i.q) })).sort((a, b) => b.s - a.s)[0]; const plain = best.i.a.replace(/<[^>]+>/g, ''); return { original: o.q, placeholder: /\[/.test(o.a), kept: best.s > .75 ? best.i.q : null, qMatch: +best.s.toFixed(2), answerMatch: +sim(o.a, plain).toFixed(2) }; });
// D7 AEO
const firstTwo = s => { const p = s.replace(/<[^>]+>/g, ''); const ss = p.match(/[^.!?]+[.!?]+/g) || [p]; return ss.slice(0, 2).join(' ').trim(); };
const wc = s => s.split(/\s+/).filter(Boolean).length;
out.aeo = items.slice(0, 20).map(i => { const f = firstTwo(i.a), first = (i.a.replace(/<[^>]+>/g, '').match(/[^.!?]+[.!?]+/) || [''])[0].trim(); return { q: i.q, first, firstWords: wc(first), first2Words: wc(f), hasNumber: /\d/.test(i.a), local: /jacksonville|florida|northeast|duval|st\. johns/i.test(i.a), source: /barrier reef|according|published/i.test(i.a) }; });
const js = fs.readFileSync(path.join(ROOT, 'src/js/02-data-studio-lab.js'), 'utf8');
out.articles = [...js.matchAll(/\{id:'([a-z0-9-]+)',st:'[a-z]+',img:'[a-z]+',min:\d+,t:'((?:\\.|[^'])*)',d:'(?:\\.|[^'])*',\s*b:`([\s\S]*?)`\}/g)].map(m => { const b = m[3]; const hs = [...b.matchAll(/<h2>(.*?)<\/h2>/g)].map(x => x[1]); return { id: m[1], title: m[2], words: wc(b.replace(/<[^>]+>/g, ' ')), h2: hs, questionH2: hs.filter(h => h.includes('?')).length, firstPara: (b.match(/<p>(.*?)<\/p>/) || [])[1], source: /class="src"|Sources?:/.test(b), updated: /updated/i.test(b), takeaways: /key takeaway/i.test(b), numbers: /\d/.test(b) }; });
out.modelNamesInArticles = out.articles.length;
log('static', out);
console.log(JSON.stringify({ underwater: out.underwater.length, count15: out.count15, count22literal: out.count22literal, daydream: out.daydream, approx: out.approx, competitors: out.competitors, demoText: out.demoText, pages: out.pages, businessFields: out.businessFields, distFiles: out.distFiles, tracking: out.tracking, nap: out.nap, faq: out.faq, fabio: out.fabio }, null, 1));
