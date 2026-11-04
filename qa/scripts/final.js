// Compares tested build with committed and live builds; writes the image inventory for the report.
const { ROOT, DIST, QA, fs, path } = require('./lib');
const { execSync } = require('child_process');
const diffAt = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i === a.length && i === b.length ? 'identical' : `first difference at char ${i}: "${a.slice(Math.max(0, i - 40), i + 50).replace(/\s+/g, ' ')}" vs "${b.slice(Math.max(0, i - 40), i + 50).replace(/\s+/g, ' ')}"`; };
const lf = s => s.replace(/\r\n/g, '\n');
(async () => {
  const local = lf(fs.readFileSync(path.join(DIST, 'index.html'), 'utf8'));
  const head = lf(execSync('git show HEAD:dist/index.html', { cwd: ROOT, maxBuffer: 1e8 }).toString());
  const live = lf(await (await fetch('https://itop-pools.vercel.app/')).text());
  console.log('local vs commit:', diffAt(local, head)); console.log('local vs live :', diffAt(local, live));
  const photos = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/photos.json'), 'utf8')), site = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/site.json'), 'utf8'));
  const js = fs.readFileSync(path.join(ROOT, 'src/js/02-data-studio-lab.js'), 'utf8'), ART = {}; [...js.matchAll(/(\w+):'((?:m|p)-[\w-]+)'/g)].forEach(m => (ART[m[2]] = ART[m[2]] || []).push('articles:' + m[1]));
  const rows = photos.map(p => { const used = []; if (site.hero.includes(p.id)) used.push('hero'); if (p.id.startsWith('m-')) used.push('home carousel, finder card, model page'); else used.push('home gallery, Our Work'); if (ART[p.id]) used.push('article image'); return `| ${p.file} | ${used.join('; ')} | ${p.alt} | ${p.credit} |`; });
  fs.writeFileSync(path.join(QA, 'logs', 'images.md'), '| File | Where used | Alt text | Source |\n|---|---|---|---|\n' + rows.join('\n') + '\n');
  const shots = fs.readdirSync(path.join(QA, 'screens')); console.log('screens', shots.length, ['home-390', 'home-1440', 'model-bondi-390', 'model-bondi-1440', 'faq-390', 'faq-1440', 'cost-390', 'cost-1440', 'quote-390', 'quote-1440', 'drawer-expanded-390'].map(n => n + ':' + shots.includes(n + '.png')).join(' '));
})();
