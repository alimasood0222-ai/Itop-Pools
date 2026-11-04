param($Scr)
"=== build " + (Get-Date -Format HH:mm:ss)
npm run build 2>&1 | ForEach-Object { "$_" } | Select-Object -Last 3
"=== retest " + (Get-Date -Format HH:mm:ss)
node qa\scripts\retest.js 2>&1 | ForEach-Object { "$_" } | Tee-Object -FilePath qa\logs\retest-output.txt | Where-Object { $_ -match '^FAIL|^    /|PASS \d+ FAIL|CRASH' }
"=== func " + (Get-Date -Format HH:mm:ss)
node qa\scripts\func.js 2>&1 | ForEach-Object { "$_" } | Tee-Object -FilePath qa\logs\func-output.txt | Where-Object { $_ -match '^FAIL|CRASH|TOTAL \{|^CTA TALLY' }
"=== func2 " + (Get-Date -Format HH:mm:ss)
node qa\scripts\func2.js 2>&1 | ForEach-Object { "$_" } | Tee-Object -FilePath qa\logs\func2-output.txt | Where-Object { $_ -match '^FAIL|CRASH|^PASS \d' }
"=== contrast " + (Get-Date -Format HH:mm:ss)
node qa\scripts\diag3.js $Scr 2>&1 | ForEach-Object { "$_" } | Out-File -Encoding utf8 qa\logs\diag3-output.txt
"=== check " + (Get-Date -Format HH:mm:ss)
node tests\check.js 2>&1 | ForEach-Object { "$_" } | Select-Object -Last 8
"=== lighthouse " + (Get-Date -Format HH:mm:ss)
$env:SITE_ENV = 'live'; npm run build | Select-Object -Last 1; $env:SITE_ENV = $null
$lh = 'qa\logs\lighthouse-after'; New-Item -ItemType Directory -Force $lh | Out-Null
$srv = Start-Process node -ArgumentList 'qa\scripts\lhserve.js' -PassThru -WindowStyle Hidden; Start-Sleep -Seconds 2
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
foreach ($u in @(@('home','/'),@('model','/fiberglass-pools/bondi/'),@('cost','/pool-cost/'),@('faq','/faq/'),@('form','/free-3d-design/'))) {
  npx lighthouse ("http://127.0.0.1:8090" + $u[1]) --quiet --output=json --output-path="$lh\mobile-$($u[0]).json" --only-categories=performance,accessibility,seo,best-practices --chrome-flags="--headless=new --use-angle=swiftshader" 2>$null | Out-Null
  npx lighthouse ("http://127.0.0.1:8090" + $u[1]) --preset=desktop --quiet --output=json --output-path="$lh\desktop-$($u[0]).json" --only-categories=performance,accessibility,seo,best-practices --chrome-flags="--headless=new --use-angle=swiftshader" 2>$null | Out-Null
}
try { Stop-Process -Id $srv.Id -Force } catch {}
npm run build | Select-Object -Last 1
node qa\scripts\lhsummary.js $lh | Out-File -Encoding utf8 qa\logs\lighthouse-after.txt
"=== done " + (Get-Date -Format HH:mm:ss)
