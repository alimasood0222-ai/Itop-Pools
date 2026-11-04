param($Scr)
$ErrorActionPreference = 'Continue'
"=== pages " + (Get-Date -Format HH:mm:ss)
node qa\scripts\pages.js $Scr 2>&1 | ForEach-Object { "$_" } | Out-File -Encoding utf8 qa\logs\pages-output.txt
"=== clicks " + (Get-Date -Format HH:mm:ss)
node qa\scripts\clicks.js 2>&1 | ForEach-Object { "$_" } | Out-File -Encoding utf8 qa\logs\clicks-output.txt
"=== lighthouse local, launch-mode build " + (Get-Date -Format HH:mm:ss)
$env:SITE_ENV = 'live'; npm run build | Select-Object -Last 1; $env:SITE_ENV = $null
$lh = 'qa\logs\lighthouse'; New-Item -ItemType Directory -Force $lh | Out-Null
$srv = Start-Process node -ArgumentList 'qa\scripts\lhserve.js' -PassThru -WindowStyle Hidden; Start-Sleep -Seconds 2
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$pages = @(@('home','/'),@('model','/#/pools/bondi'),@('cost','/#/cost'),@('faq','/faq/'),@('form','/#/quote'))
foreach ($u in $pages) {
  npx lighthouse ("http://127.0.0.1:8090" + $u[1]) --quiet --output=json --output-path="$lh\mobile-$($u[0]).json" --only-categories=performance,accessibility,seo,best-practices --chrome-flags="--headless=new --use-angle=swiftshader" 2>$null | Out-Null
  npx lighthouse ("http://127.0.0.1:8090" + $u[1]) --preset=desktop --quiet --output=json --output-path="$lh\desktop-$($u[0]).json" --only-categories=performance,accessibility,seo,best-practices --chrome-flags="--headless=new --use-angle=swiftshader" 2>$null | Out-Null
}
npx lighthouse "http://127.0.0.1:8091/" --quiet --output=json --output-path="$lh\mobile-home-noshimmer.json" --only-categories=performance --chrome-flags="--headless=new --use-angle=swiftshader" 2>$null | Out-Null
try { Stop-Process -Id $srv.Id -Force } catch {}
"=== restore preview build " + (Get-Date -Format HH:mm:ss)
npm run build | Select-Object -Last 1
"=== lighthouse live site " + (Get-Date -Format HH:mm:ss)
foreach ($u in @(@('home','/'),@('faq','/faq/'))) { npx lighthouse ("https://itop-pools.vercel.app" + $u[1]) --quiet --output=json --output-path="$lh\live-mobile-$($u[0]).json" --only-categories=performance,accessibility,seo,best-practices --chrome-flags="--headless=new --use-angle=swiftshader" 2>$null | Out-Null }
node qa\scripts\lhsummary.js $lh | Out-File -Encoding utf8 qa\logs\lighthouse-summary.txt
"=== done " + (Get-Date -Format HH:mm:ss)
