#!/usr/bin/env node
/*
  iTop Pools website — build script (no dependencies).
  Combines src/ into ONE self-contained file: dist/index.html
  (fonts, images, CSS, three.js and app code are all inlined).

    node build.js          build once
    node build.js --watch  rebuild whenever a file in src/ changes
*/
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'dist', 'index.html');
const read = p => fs.readFileSync(path.join(SRC, p), 'utf8');
const b64 = p => fs.readFileSync(path.join(SRC, p)).toString('base64');
const sortedFiles = dir => fs.readdirSync(path.join(SRC, dir)).filter(f => !f.startsWith('.')).sort();

function build() {
  const t0 = Date.now();

  // 1. Fonts -> @font-face with base64 data
  const FONTS = [
    ['Inter Tight', 'inter-tight-var.woff2', '100 900', 'normal'],
    ['Inter', 'inter-var.woff2', '100 900', 'normal'],
    ['Instrument Serif', 'instrument-serif-regular.woff2', '400', 'normal'],
    ['Instrument Serif', 'instrument-serif-italic.woff2', '400', 'italic'],
  ];
  const fontCss = FONTS.map(([family, file, weight, style]) =>
    `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${b64('assets/fonts/' + file)}) format('woff2');font-weight:${weight};font-style:${style};font-display:swap}`
  ).join('\n');

  // 2. Images -> data URIs, keyed by file name without extension (screen, spa, ...)
  const MIME = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', avif: 'image/avif' };
  const IMG = {};
  for (const f of sortedFiles('assets/img')) {
    const ext = f.split('.').pop().toLowerCase();
    if (!MIME[ext]) continue;
    IMG[f.replace(/\.[^.]+$/, '')] = `data:${MIME[ext]};base64,${b64('assets/img/' + f)}`;
  }

  // 3. CSS (files in src/css are joined in name order)
  const css = fontCss + '\n' + sortedFiles('css').map(f => `/* ---- ${f} ---- */\n` + read('css/' + f)).join('\n');

  // 4. JS (files in src/js are joined in name order and share one scope)
  const js = sortedFiles('js').map(f => read('js/' + f)).join('\n') + '\n})();';
  const app = js.replace('{{IMGJSON}}', () => JSON.stringify(IMG));

  // 5. Page
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>iTop Pools · Barrier Reef Fiberglass Pools · Jacksonville, FL</title>
<meta name="description" content="Design your Barrier Reef fiberglass pool in 3D, compare finishes, estimate the cost and book a free site visit. One in-house crew in Jacksonville, FL.">
<style>
${css}
</style>
</head>
<body>
${read('body.html')}
<script>${read('vendor/three.min.js')}</script>
<script>
${app}
</script>
</body>
</html>`;

  // {{IMG:name}} placeholders (used in CSS/HTML)
  html = html.replace(/\{\{IMG:(\w+)\}\}/g, (m, k) => {
    if (!IMG[k]) { console.warn('  ! missing image: ' + k); return ''; }
    return IMG[k];
  });

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log(`✓ dist/index.html  ${(html.length / 1024).toFixed(0)} KB  (${Date.now() - t0} ms)`);
}

build();

if (process.argv.includes('--watch')) {
  console.log('Watching src/ for changes… (Ctrl+C to stop)');
  let timer = null;
  fs.watch(SRC, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => { try { build(); } catch (e) { console.error(e.message); } }, 150);
  });
}
