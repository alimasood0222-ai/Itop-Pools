"=== urls " + (Get-Date -Format HH:mm:ss)
foreach ($u in '/','/faq/','/fiberglass-pools/bondi/','/pool-cost-jacksonville/','/about/','/pool-models.html','/get-a-quote.html','/services/','/pool-cost/','/why-itop/','/pool-school/cost-guide/','/nope-404/','/sitemap.xml','/llms.txt') { $h=[Net.WebRequest]::Create("https://itop-pools.vercel.app$u"); $h.AllowAutoRedirect=$false; $h.Timeout=25000; try { $x=$h.GetResponse() } catch { $x=$_.Exception.InnerException.Response }; "$u -> $([int]$x.StatusCode) loc=[$($x.Headers['Location'])] robots=[$($x.Headers['X-Robots-Tag'])] nosniff=[$($x.Headers['X-Content-Type-Options'])]"; $x.Close() }
"=== live pages " + (Get-Date -Format HH:mm:ss)
node qa\scripts\livefinal.js 2>&1 | ForEach-Object { "$_" } | Tee-Object -FilePath qa\logs\livefinal-output.txt
"=== live lighthouse " + (Get-Date -Format HH:mm:ss)
"cpu: " + (Get-CimInstance Win32_Processor | Measure-Object LoadPercentage -Average).Average + "%"
$lh = 'qa\logs\lighthouse-seo'; New-Item -ItemType Directory -Force $lh | Out-Null
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
foreach ($n in 1..3) { foreach ($u in @(@('home','/'),@('model','/fiberglass-pools/bondi/'),@('cost','/pool-cost-jacksonville/'),@('faq','/faq/'),@('form','/free-3d-design/'))) {
  npx lighthouse ("https://itop-pools.vercel.app" + $u[1]) --quiet --output=json --output-path="$lh\$($u[0])-$n.json" --only-categories=performance,accessibility,best-practices --chrome-flags="--headless=new --use-angle=swiftshader" 2>$null | Out-Null
} }
node qa\scripts\lhmed.js qa/logs/lighthouse-seo/ | Tee-Object -FilePath qa\logs\lighthouse-seo.txt
"=== done " + (Get-Date -Format HH:mm:ss)
