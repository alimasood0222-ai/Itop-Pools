"=== live pages " + (Get-Date -Format HH:mm:ss)
node qa\scripts\livefinal.js 2>&1 | ForEach-Object { "$_" } | Tee-Object -FilePath qa\logs\livefinal-output.txt
"=== live lighthouse " + (Get-Date -Format HH:mm:ss)
$lh = 'qa\logs\lighthouse-live'; New-Item -ItemType Directory -Force $lh | Out-Null
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
foreach ($n in 1..3) { foreach ($u in @(@('home','/'),@('model','/fiberglass-pools/bondi/'),@('cost','/pool-cost/'),@('faq','/faq/'),@('form','/free-3d-design/'))) {
  npx lighthouse ("https://itop-pools.vercel.app" + $u[1]) --quiet --output=json --output-path="$lh\$($u[0])-$n.json" --only-categories=performance,accessibility,best-practices --chrome-flags="--headless=new --use-angle=swiftshader" 2>$null | Out-Null
} }
node -e "const fs=require('fs'),d='qa/logs/lighthouse-live/';const med=a=>a.sort((x,y)=>x-y)[Math.floor(a.length/2)];for(const p of ['home','model','cost','faq','form']){const r=[1,2,3].map(n=>{try{return JSON.parse(fs.readFileSync(d+p+'-'+n+'.json'))}catch{return null}}).filter(x=>x&&x.categories.performance.score!=null);const g=f=>med(r.map(f));console.log(p,'perf',r.map(x=>Math.round(x.categories.performance.score*100)).join('/'),'median',g(x=>Math.round(x.categories.performance.score*100)),'lcp',g(x=>+(x.audits['largest-contentful-paint'].numericValue/1000).toFixed(1)),'tbt',g(x=>Math.round(x.audits['total-blocking-time'].numericValue)),'cls',g(x=>+x.audits['cumulative-layout-shift'].numericValue.toFixed(3)),'kb',g(x=>Math.round(x.audits['total-byte-weight'].numericValue/1024)),'a11y',g(x=>Math.round(x.categories.accessibility.score*100)),'bp',g(x=>Math.round(x.categories['best-practices'].score*100)))}" | Tee-Object -FilePath qa\logs\lighthouse-live.txt
"=== done " + (Get-Date -Format HH:mm:ss)
