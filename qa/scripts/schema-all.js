// Runs every page in the built sitemap through validator.schema.org, against the live preview.
const fs = require('fs'), path = require('path');
const BASE = process.argv[2] || 'https://itop-pools.vercel.app';
const xml = fs.readFileSync(path.join(__dirname, '../../dist/sitemap.xml'), 'utf8');
const urls = [...xml.matchAll(/<loc>https:\/\/itoppools\.com([^<]*)<\/loc>/g)].map(m => m[1]);
(async () => {
  let errors = 0, warnings = 0, failed = 0; const types = {};
  for (const u of urls) {
    try {
      const r = await fetch('https://validator.schema.org/validate', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ url: BASE + u }).toString() });
      const d = JSON.parse((await r.text()).replace(/^\)\]\}'\s*/, ''));
      if (d.fetchError) { failed++; console.log(u, 'fetch error', d.fetchError); continue; }
      errors += d.totalNumErrors; warnings += d.totalNumWarnings;
      for (const g of d.tripleGroups || []) for (const n of g.nodes || []) { const t = n.typeGroup || n.type; if (t) types[t] = (types[t] || 0) + 1; }
      if (d.totalNumErrors || d.totalNumWarnings) console.log(u, d.totalNumErrors, d.totalNumWarnings, JSON.stringify(d.errors).slice(0, 300));
    } catch (e) { failed++; console.log(u, 'failed', e.message); }
  }
  console.log(`${urls.length} pages: ${errors} errors, ${warnings} warnings, ${failed} could not be checked`);
  console.log(JSON.stringify(types));
})();
