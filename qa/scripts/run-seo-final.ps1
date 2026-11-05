$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$out = 'qa\logs\lighthouse-seo-recheck'; New-Item -ItemType Directory -Force $out | Out-Null
"=== cost and faq recheck"
foreach ($n in 1..5) { foreach ($u in @(@('cost','/pool-cost-jacksonville/'),@('faq','/faq/'))) {
  $cpu = (Get-CimInstance Win32_Processor | Measure-Object LoadPercentage -Average).Average
  npx lighthouse ("https://itop-pools.vercel.app" + $u[1]) --quiet --output=json --output-path="$out\$($u[0])-$n.json" --only-categories=performance --chrome-flags="--headless=new --use-angle=swiftshader" 2>$null | Out-Null
  $j = Get-Content "$out\$($u[0])-$n.json" -Raw -Encoding UTF8 | ConvertFrom-Json
  "$($u[0]) run $n cpu-before $cpu% perf $([math]::Round($j.categories.performance.score*100)) lcp $([math]::Round($j.audits.'largest-contentful-paint'.numericValue)) tbt $([math]::Round($j.audits.'total-blocking-time'.numericValue))"
} }
"=== seo score on a go-live build (local)"
$env:SITE_ENV = 'live'; npm run build 2>&1 | Select-Object -Last 2 | ForEach-Object { "$_".Substring(0,[Math]::Min(90,"$_".Length)) }
foreach ($u in @(@('home','/'),@('model','/fiberglass-pools/bondi/'),@('cost','/pool-cost-jacksonville/'),@('faq','/faq/'))) {
  npx lighthouse ("http://127.0.0.1:8080" + $u[1]) --quiet --output=json --output-path="$out\seo-$($u[0]).json" --only-categories=seo --chrome-flags="--headless=new --use-angle=swiftshader" 2>$null | Out-Null
  $j = Get-Content "$out\seo-$($u[0]).json" -Raw -Encoding UTF8 | ConvertFrom-Json
  $bad = @($j.categories.seo.auditRefs | Where-Object { $_.weight -gt 0 -and $j.audits.($_.id).score -ne 1 } | ForEach-Object { $_.id }) -join ','
  "$($u[0]) seo $([math]::Round($j.categories.seo.score*100)) failing=[$bad]"
}
Remove-Item Env:SITE_ENV; npm run build 2>&1 | Select-Object -Last 2 | ForEach-Object { "$_".Substring(0,[Math]::Min(90,"$_".Length)) }
"robots in restored build: " + [bool](Select-String -Path dist\index.html -Pattern 'name="robots" content="noindex' -Quiet)
"dist changes vs commit: " + (git status --short dist | Measure-Object -Line).Lines
"=== done"
