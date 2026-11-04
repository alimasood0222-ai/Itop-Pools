#!/usr/bin/env node
/* Tells IndexNow search engines about every page. Run by hand once the site is live on itoppools.com: node scripts/indexnow.js */
const fs = require('fs');
const path = require('path');
const site = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src/data/site.json'), 'utf8'));
const xml = fs.readFileSync(path.join(__dirname, '..', 'dist/sitemap.xml'), 'utf8');
const urlList = [...xml.matchAll(/<loc>(https:\/\/itoppools\.com[^<]*)<\/loc>/g)].map(m => m[1]);
fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ host: 'itoppools.com', key: site.indexNowKey, keyLocation: `https://itoppools.com/${site.indexNowKey}.txt`, urlList }),
}).then(r => console.log(`IndexNow: HTTP ${r.status} for ${urlList.length} URLs`)).catch(e => { console.error(e.message); process.exit(1); });
