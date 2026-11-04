// Shared helpers for the acceptance test. Read-only against dist/.
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const ROOT = path.join(__dirname, '..', '..'), DIST = path.join(ROOT, 'dist'), QA = path.join(ROOT, 'qa');
const pw = require(path.join(ROOT, 'node_modules', 'playwright-core'));
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'text/xml' };
function serve(port = 0, extra = {}) {
  const srv = http.createServer((q, s) => {
    const url = q.url.split('?')[0];
    if (extra[url]) { s.writeHead(200, { 'Content-Type': 'text/html', 'Content-Encoding': 'br' }); return s.end(zlib.brotliCompressSync(Buffer.from(extra[url]), { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })); }
    let p = decodeURIComponent(url); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(DIST, p);
    if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end('not found'); }
    const e = path.extname(f), h = { 'Content-Type': TYPES[e] || 'application/octet-stream', 'Cache-Control': 'public,max-age=3600' };
    let b = fs.readFileSync(f);
    if (['.html', '.js', '.svg', '.txt', '.xml'].includes(e)) { b = zlib.brotliCompressSync(b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }); h['Content-Encoding'] = 'br'; }
    s.writeHead(200, h); s.end(b);
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r({ srv, base: `http://127.0.0.1:${srv.address().port}` })));
}
const models = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/models.json'), 'utf8'));
const ARTICLES = ['fiberglass-vs-concrete', 'shapes', 'cost-guide', 'permits', 'financing', 'colours', 'features', 'timeline', 'access', 'first-30', 'hurricane'];
const CORE = { home: '/', pools: '/fiberglass-pools/', 'model-bondi': '/fiberglass-pools/bondi/', studio: '/3d-pool-design/', colours: '/pool-colors/', cost: '/pool-cost/', learn: '/pool-school/', 'article-cost-guide': '/pool-school/cost-guide/', work: '/our-work/', why: '/why-itop/', quote: '/free-3d-design/', faq: '/faq/' };
const ALL = { ...CORE }; models.forEach(m => ALL['model-' + m.id] = '/fiberglass-pools/' + m.id + '/'); ARTICLES.forEach(a => ALL['article-' + a] = '/pool-school/' + a + '/');
const VIEWPORTS = [[360, 740], [390, 844], [414, 896], [768, 1024], [844, 390], [1440, 900]];
const ctxOpts = (w, h, extra = {}) => ({ viewport: { width: w, height: h }, hasTouch: w < 1000, isMobile: w < 1000, deviceScaleFactor: w < 1000 ? 2 : 1, ...extra });
const launch = () => pw.chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const log = (name, data) => fs.writeFileSync(path.join(QA, 'logs', name + '.json'), JSON.stringify(data, null, 1));
const shot = n => path.join(QA, 'screens', n + '.png');
const settle = async (p, url, base, ms = 1400) => { await p.goto(base + url, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(ms); };
module.exports = { serve, models, ARTICLES, CORE, ALL, VIEWPORTS, ctxOpts, launch, log, shot, settle, ROOT, DIST, QA, pw, fs, path };
