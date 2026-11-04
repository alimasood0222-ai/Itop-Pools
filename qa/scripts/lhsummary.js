const fs = require('fs'), path = require('path');
const dir = process.argv[2]; const rows = [];
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json') && x !== 'summary.json')) {
  try { const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); const c = r.categories, a = r.audits; const fails = []; for (const k of Object.keys(c)) for (const x of c[k].auditRefs) { const y = a[x.id]; if (x.weight > 0 && y.score !== null && y.score < .9 && k !== 'performance') fails.push(k[0] + ':' + x.id); }
    rows.push({ run: f.replace('.json', ''), perf: Math.round(c.performance.score * 100), a11y: Math.round(c.accessibility.score * 100), bp: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100), fcp: a['first-contentful-paint'].displayValue, lcp: a['largest-contentful-paint'].displayValue, tbt: a['total-blocking-time'].displayValue, cls: a['cumulative-layout-shift'].displayValue, weight: a['total-byte-weight'].displayValue, fails }); } catch (e) { rows.push({ run: f, error: e.message }); } }
fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(rows, null, 1));
rows.forEach(r => console.log(JSON.stringify(r)));
