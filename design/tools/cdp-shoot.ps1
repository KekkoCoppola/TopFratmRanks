# TopFratmRanks screenshot runner (no Node/Python needed).
# Headless Edge driven over the DevTools Protocol: runs the scenarios in shots.js
# at 1366x768 (DPR 1) and 375x667 (DPR 2, mobile emulation) and saves JPGs to $OutDir.
#
#   powershell -File design\tools\cdp-shoot.ps1 -OutDir design\after [-Only '1*'] [-Sizes desktop] [-Lang en]
#
# Needs the dev server running (serve.ps1 on port 8123). A scenario's setup() may return
# { hover: [x, y] } to get a real mouse hover before the shot.
param(
  [Parameter(Mandatory = $true)][string]$OutDir,
  [string]$Base = 'http://localhost:8123',
  [string]$Only = '*',
  [string]$Sizes = 'desktop,mobile',
  [ValidateSet('it', 'en')][string]$Lang = 'it',
  [string]$Suffix = ''
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Web.Extensions
$ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$ser.MaxJsonLength = [int]::MaxValue

$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
# fresh profile and port per run: a previous headless Edge may still be shutting down
$port = Get-Random -Minimum 9300 -Maximum 9800
Get-ChildItem $env:TEMP -Directory -Filter 'trv-edge-*' | ForEach-Object { Remove-Item -Recurse -Force $_.FullName -ErrorAction SilentlyContinue }
$profileDir = Join-Path $env:TEMP ('trv-edge-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Force $OutDir | Out-Null
$log = Join-Path $OutDir '_console.log'
Set-Content -Path $log -Value '' -Encoding utf8

$proc = Start-Process $edge -PassThru -ArgumentList @(
  '--headless=new', "--remote-debugging-port=$port", "--user-data-dir=`"$profileDir`"",
  '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required',
  '--window-size=1366,768', 'about:blank')

$tabs = $null
for ($i = 0; $i -lt 60; $i++) {
  try { $tabs = Invoke-RestMethod "http://127.0.0.1:$port/json/list"; if ($tabs) { break } } catch {}
  Start-Sleep -Milliseconds 250
}
$page = @($tabs | Where-Object { $_.type -eq 'page' })[0]
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$ws.ConnectAsync([Uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).Wait()
$script:id = 0
$script:current = ''

function Receive-Cdp {
  $buf = New-Object byte[] 1048576
  $ms = New-Object IO.MemoryStream
  do {
    $seg = New-Object 'ArraySegment[byte]' -ArgumentList (, $buf)
    $r = $ws.ReceiveAsync($seg, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    $ms.Write($buf, 0, $r.Count)
  } while (-not $r.EndOfMessage)
  return $ser.DeserializeObject([Text.Encoding]::UTF8.GetString($ms.ToArray()))
}

function Note-Event($m) {
  $method = $m['method']
  if ($method -eq 'Runtime.exceptionThrown') {
    $d = $m['params']['exceptionDetails']
    $text = $d['text']
    if ($d['exception'] -and $d['exception']['description']) { $text = $d['exception']['description'] }
    Add-Content -Path $log -Value ("[$script:current] EXCEPTION " + $text) -Encoding utf8
  } elseif ($method -eq 'Runtime.consoleAPICalled' -and ($m['params']['type'] -eq 'error' -or $m['params']['type'] -eq 'warning')) {
    $args2 = @($m['params']['args'] | ForEach-Object { if ($_['value']) { $_['value'] } elseif ($_['description']) { $_['description'] } })
    Add-Content -Path $log -Value ("[$script:current] console." + $m['params']['type'] + ' ' + ($args2 -join ' ')) -Encoding utf8
  } elseif ($method -eq 'Log.entryAdded' -and $m['params']['entry']['level'] -eq 'error') {
    Add-Content -Path $log -Value ("[$script:current] log.error " + $m['params']['entry']['text'] + ' ' + $m['params']['entry']['url']) -Encoding utf8
  }
}

function Send-Cdp([string]$method, $params) {
  $script:id++
  $myId = $script:id
  if (-not $params) { $params = @{} }
  $msg = @{ id = $myId; method = $method; params = $params } | ConvertTo-Json -Depth 20 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($msg)
  $ws.SendAsync((New-Object 'ArraySegment[byte]' -ArgumentList (, $bytes)), 'Text', $true, [Threading.CancellationToken]::None).Wait()
  while ($true) {
    $m = Receive-Cdp
    if ($m.ContainsKey('id') -and $m['id'] -eq $myId) {
      if ($m.ContainsKey('error')) { throw ("CDP $method error: " + $m['error']['message']) }
      return $m['result']
    }
    if ($m.ContainsKey('method')) { Note-Event $m }
  }
}

function Eval([string]$expr) {
  $r = Send-Cdp 'Runtime.evaluate' @{ expression = $expr; awaitPromise = $true; returnByValue = $true }
  if ($r.ContainsKey('exceptionDetails')) {
    $d = $r['exceptionDetails']
    $t = $d['text']
    if ($d['exception'] -and $d['exception']['description']) { $t = $d['exception']['description'] }
    throw "JS: $t"
  }
  return $r['result']['value']
}

function Go([string]$url) {
  Send-Cdp 'Page.navigate' @{ url = $url } | Out-Null
  Start-Sleep -Milliseconds 300
  for ($i = 0; $i -lt 150; $i++) {
    try { if ((Eval 'document.readyState') -eq 'complete') { break } } catch {}
    Start-Sleep -Milliseconds 100
  }
}

function Shot([string]$path, [bool]$full) {
  $p = @{ format = 'jpeg'; quality = 88 }
  if ($full) {
    Eval 'window.scrollTo(0,0); true' | Out-Null
    $m = Send-Cdp 'Page.getLayoutMetrics' @{}
    $cs = $m['cssContentSize']
    $p['captureBeyondViewport'] = $true
    $p['clip'] = @{ x = 0; y = 0; width = [double]$cs['width']; height = [double]$cs['height']; scale = 1 }
  }
  $r = Send-Cdp 'Page.captureScreenshot' $p
  [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($r['data']))
}

try {
  Send-Cdp 'Page.enable' @{} | Out-Null
  Send-Cdp 'Runtime.enable' @{} | Out-Null
  Send-Cdp 'Log.enable' @{} | Out-Null
  try { Send-Cdp 'Browser.setDownloadBehavior' @{ behavior = 'deny' } | Out-Null } catch { Send-Cdp 'Page.setDownloadBehavior' @{ behavior = 'deny' } | Out-Null }
  $helper = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'shots.js'))
  Send-Cdp 'Page.addScriptToEvaluateOnNewDocument' @{ source = $helper } | Out-Null

  $blank = "$Base/css/style.css" # any same-origin document, to seed localStorage before each load
  Go $blank
  $list = $ser.DeserializeObject((Eval 'JSON.stringify(__S.list())'))

  $views = @(
    @{ key = 'desktop'; suffix = '1366x768'; w = 1366; h = 768; dpr = 1; mobile = $false },
    @{ key = 'mobile'; suffix = '375x667'; w = 375; h = 667; dpr = 2; mobile = $true }
  ) | Where-Object { ($Sizes -split ',') -contains $_.key }

  foreach ($v in $views) {
    Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $v.w; height = $v.h; deviceScaleFactor = $v.dpr; mobile = $v.mobile } | Out-Null
    Send-Cdp 'Emulation.setTouchEmulationEnabled' @{ enabled = $v.mobile } | Out-Null
    foreach ($s in $list) {
      $name = $s['name']
      if ($name -notlike $Only) { continue }
      $script:current = "$name $($v.suffix) $Lang"
      $file = Join-Path $OutDir ("$name" + "_" + $v.suffix + $Suffix + '.jpg')
      try {
        Go $blank
        Eval ("__S.prepare(" + ($name | ConvertTo-Json) + ", '" + $Lang + "')") | Out-Null
        Go ("$Base/" + $s['url'])
        $res = Eval ("__S.setup(" + ($name | ConvertTo-Json) + ")")
        if ($res -is [System.Collections.IDictionary] -and $res.ContainsKey('hover')) {
          $x = [double]$res['hover'][0]; $y = [double]$res['hover'][1]
          Send-Cdp 'Input.dispatchMouseEvent' @{ type = 'mouseMoved'; x = $x; y = $y } | Out-Null
          Start-Sleep -Milliseconds 550 # hover transitions are 400ms
        }
        Shot $file ([bool]$s['full'] -and $v.mobile) # desktop editor: full page = viewport
        Write-Output "ok   $($script:current)"
      } catch {
        Write-Output "FAIL $($script:current): $($_.Exception.Message)"
        Add-Content -Path $log -Value ("[$script:current] SCRIPT FAIL " + $_.Exception.Message) -Encoding utf8
      }
    }
  }
} finally {
  try { Send-Cdp 'Browser.close' @{} | Out-Null } catch {}
  Start-Sleep -Milliseconds 500
  if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
}
