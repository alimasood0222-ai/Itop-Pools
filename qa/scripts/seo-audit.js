// Read-only SEO audit: live preview, old site, and gap against the SEO brief.
const { launch, ctxOpts, log } = require('./lib');
const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; audit)' }, redirect: 'manual' };
const LIVE = 'https://itop-pools.vercel.app', OLD = 'https://itoppools.com';
const strip = h => h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const wc = s => s.split(' ').filter(Boolean).length;
const get = async (b, u) => { try { const r = await fetch(b + u, UA); return { s: r.status, loc: r.headers.get('location'), h: r.headers, t: await r.text() }; } catch (e) { return { s: 'ERR ' + e.cause?.code, h: new Headers(), t: '' }; } };
(async () => {
  const out = {};
  // 1. old site
  const oldUrls = ['/', '/pool-models/', '/pool-models.html', '/services/', '/services.html', '/get-a-quote/', '/get-a-quote.html', '/about/', '/faq/', '/gallery/', '/contact/', '/sitemap.xml', '/robots.txt'];
  out.old = {}; for (const u of oldUrls) { const r = await get(OLD, u); out.old[u] = { status: r.s, loc: r.loc, title: (r.t.match(/<title[^>]*>([^<]*)/) || [])[1], canonical: (r.t.match(/rel="canonical" href="([^"]*)/) || [])[1], words: wc(strip(r.t)) }; }
  const sm = await get(OLD, '/sitemap.xml'); out.oldSitemap = [...sm.t.matchAll(/<loc>([^<]*)/g)].map(m => m[1]);
  out.oldRobots = (await get(OLD, '/robots.txt')).t.slice(0, 200);
  const oh = await get(OLD, '/'); out.oldLd = [...oh.t.matchAll(/"@type":\s*"([^"]+)"/g)].map(m => m[1]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 14); out.oldSameAs = (oh.t.match(/"sameAs"\s*:\s*\[[^\]]*\]/) || [])[0] || null; out.oldHtmlLinks = [...new Set([...oh.t.matchAll(/href="([^"#:]+\.html[^"]*)"/g)].map(m => m[1]))];
  out.oldSocial = [...new Set([...oh.t.matchAll(/https?:\/\/(?:www\.)?(facebook|instagram|youtube|linkedin|houzz|yelp|bbb|g\.page|maps\.app\.goo|goo\.gl)[^"'\s<)]*/g)].map(m => m[0]))];
  out.oldLicense = [...new Set((oh.t.match(/.{0,50}(CBC|CPC|License).{0,50}/g) || []).map(s => s.trim()))].slice(0, 4);
  // 2. current site by template
  const T = { home: '/', finder: '/fiberglass-pools/', model: '/fiberglass-pools/bondi/', model2: '/fiberglass-pools/oasis/', cost: '/pool-cost/', faq: '/faq/', hub: '/pool-school/', article: '/pool-school/cost-guide/', compare: '/pool-school/fiberglass-vs-concrete/', why: '/why-itop/', work: '/our-work/', form: '/free-3d-design/' };
  out.pages = {}; for (const [n, u] of Object.entries(T)) { const r = await get(LIVE, u); const t = r.t; const imgs = [...t.matchAll(/<img\b[^>]*>/g)].map(m => m[0]); const alts = imgs.map(i => (i.match(/alt="([^"]*)/) || [])[1]); out.pages[n] = { url: u, kb: Math.round(t.length / 1024), words: wc(strip(t)), h1: (t.match(/<h1[\s>]/g) || []).length, h2: (t.match(/<h2[\s>]/g) || []).length, questionH2H3: (t.match(/<h[23][^>]*>[^<]*\?<\/h[23]>/g) || []).length, lang: (t.match(/<html lang="([^"]*)/) || [])[1], main: t.includes('<main'), address: t.includes('<address'), article: t.includes('<article'), imgs: imgs.length, noWH: imgs.filter(i => !/\bwidth=/.test(i)).length, noAlt: alts.filter(a => a === undefined).length, emptyAlt: alts.filter(a => a === '').length, hashLinks: (t.match(/href="#\//g) || []).length, crumbs: t.includes('class="crumbs"'), appleIcon: t.includes('apple-touch-icon'), inlineCss: (t.match(/<style[\s\S]*?<\/style>/g) || []).join('').length, types: [...new Set([...t.matchAll(/"@type":\s*(?:\[?)"([A-Za-z]+)"/g)].map(m => m[1]))] }; }
  const h = await fetch(LIVE + '/', UA); out.headers = Object.fromEntries(['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy', 'content-security-policy', 'x-robots-tag', 'cache-control'].map(k => [k, h.headers.get(k)]));
  // brief's required URLs
  const need = ['/fiberglass-pools/rectangular/', '/fiberglass-pools/freeform/', '/fiberglass-pools/kidney/', '/fiberglass-pools/plunge/', '/pool-colors/', '/3d-pool-design/', '/pool-cost-jacksonville/', '/pool-financing/', '/faq/', '/pool-school/', '/fiberglass-vs-concrete-vs-vinyl/', '/our-work/', '/process-and-warranty/', '/about/', '/service-areas/', '/free-3d-design/', '/privacy/', '/terms/'];
  out.need = {}; for (const u of need) out.need[u] = (await get(LIVE, u)).s;
  const robots = (await get(LIVE, '/robots.txt')).t; out.robotsBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Claude-SearchBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot'].filter(b => !robots.includes(b));
  // JS on vs off
  const br = await launch(); const c = await br.newContext({ ...ctxOpts(390, 844), javaScriptEnabled: false }); out.nojs = {}; for (const [n, u] of Object.entries(T)) { const p = await c.newPage(); await p.goto(LIVE + u, { waitUntil: 'load', timeout: 60000 }); const t = await p.locator('body').innerText(); out.nojs[n] = { chars: t.length, words: wc(t.replace(/\s+/g, ' ')), h1: await p.locator('h1:visible').count() }; await p.close(); } await br.close();
  // uniqueness across model pages
  const w = async u => new Set(strip((await get(LIVE, u)).t).toLowerCase().split(' ').filter(x => x.length > 3));
  const [a, b] = [await w(T.model), await w(T.model2)]; const inter = [...a].filter(x => b.has(x)).length; out.modelOverlap = Math.round(inter / Math.min(a.size, b.size) * 100);
  log('seo-audit', out); console.log(JSON.stringify(out, null, 0));
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
