// E: checks site claims against Barrier Reef's own pages, and tries the schema.org validator on the public URL.
const { log } = require('./lib');
const UA = { headers: { 'User-Agent': 'Mozilla/5.0' } };
const strip = h => h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&#8217;/g, "'").replace(/\s+/g, ' ');
(async () => {
  const urls = ['https://www.brpoolsusa.com/', 'https://www.brpoolsusa.com/about/', 'https://www.brpoolsusa.com/about-us/', 'https://www.brpoolsusa.com/warranty/', 'https://www.brpoolsusa.com/faqs/', 'https://www.brpoolsusa.com/faq/', 'https://www.brpoolsusa.com/why-fiberglass/'];
  const home = await (await fetch(urls[0], UA)).text();
  [...new Set([...home.matchAll(/https:\/\/www\.brpoolsusa\.com\/[\w/-]*(warrant|faq|about|why|install)[\w/-]*/gi)].map(m => m[0]))].forEach(u => { if (!urls.includes(u)) urls.push(u); });
  const terms = { lifetime: /lifetime[^.]{0,80}warrant[^.]{0,120}\./i, transferable: /[^.]{0,100}transfer[^.]{0,80}\./i, fifteen: /[^.]{0,80}15[- ]year[^.]{0,80}\./i, weeks: /[^.]{0,90}\b2\s*(-|–|to)\s*6 weeks[^.]{0,60}\./i, y1984: /[^.]{0,70}1984[^.]{0,50}\./, timmonsville: /[^.]{0,70}Timmonsville[^.]{0,50}\./, y2009: /[^.]{0,70}2009[^.]{0,50}\./, p3500: /[^.]{0,70}3,?500[^.]{0,60}\./ };
  const found = {};
  for (const u of urls.slice(0, 22)) { try { const r = await fetch(u, UA); if (!r.ok) continue; const t = strip(await r.text()); for (const [k, re] of Object.entries(terms)) { const m = t.match(re); if (m && !found[k]) found[k] = { url: u, text: m[0].trim().slice(0, 220) }; } } catch {} }
  let schema = 'not attempted';
  try { const r = await fetch('https://validator.schema.org/validate', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...UA.headers }, body: 'url=' + encodeURIComponent('https://itop-pools.vercel.app/faq/') }); const raw = await r.text(); const j = JSON.parse(raw.replace(/^\)\]\}'\s*/, '')); schema = { status: r.status, errors: j.numErrors, warnings: j.numWarnings, objects: j.numObjects, triples: (j.tripleGroups || []).map(g => g.type), fetchError: j.fetchError }; } catch (e) { schema = 'validator unavailable: ' + e.message; }
  let schemaHome = null; try { const r = await fetch('https://validator.schema.org/validate', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...UA.headers }, body: 'url=' + encodeURIComponent('https://itop-pools.vercel.app/') }); const j = JSON.parse((await r.text()).replace(/^\)\]\}'\s*/, '')); schemaHome = { errors: j.numErrors, warnings: j.numWarnings, objects: j.numObjects, sampleErrors: (j.tripleGroups || []).flatMap(g => g.errors || []).slice(0, 5) }; } catch (e) { schemaHome = e.message; }
  const res = { checked: urls.slice(0, 22), found, missing: Object.keys(terms).filter(k => !found[k]), schema, schemaHome };
  log('claims', res); console.log(JSON.stringify({ found, missing: res.missing, schema, schemaHome }, null, 1));
})();
