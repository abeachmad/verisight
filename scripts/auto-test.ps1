# auto-test.ps1 - Automated smoke test for Mock Mode
$ErrorActionPreference = 'Stop'

function Say($t){ Write-Host "[test] $t" -ForegroundColor Cyan }
function Ok($t){ Write-Host "[PASS] $t" -ForegroundColor Green }
function Fail($t){ Write-Host "[FAIL] $t" -ForegroundColor Red }

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot 'backend'
$frontendDir = Join-Path $repoRoot 'frontend'
$reportPath = Join-Path $repoRoot 'tests\report.xml'

Say "=== Auto Test Mock Mode ==="

# Ensure tests directory exists
$testsDir = Join-Path $repoRoot 'tests'
if (-not (Test-Path $testsDir)) { New-Item -ItemType Directory -Path $testsDir | Out-Null }

# Start backend
Say "Starting backend..."
$backendProc = Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$backendDir'; `$env:ENV='development'; python -m uvicorn server:app --host 127.0.0.1 --port 8001" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5

# Start frontend
Say "Starting frontend..."
$frontendProc = Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$frontendDir'; npm start" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 10

# Wait for UI ready
Say "Waiting for UI..."
$ready = $false
for ($i = 1; $i -le 30; $i++) {
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
      $ready = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 2
  }
}

if (-not $ready) {
  Fail "UI not ready after 60s"
  Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
  Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
  exit 1
}

Ok "UI ready"

# Test routes
$tests = @(
  @{ Name = "Landing"; Url = "http://localhost:3000"; Keywords = @("Verisight") }
  @{ Name = "Events"; Url = "http://localhost:3000/events"; Keywords = @("confidence") }
  @{ Name = "Markets"; Url = "http://localhost:3000/markets"; Keywords = @("market") }
)

$passed = 0
$failed = 0
$results = @()

foreach ($test in $tests) {
  Say "Testing $($test.Name)..."
  try {
    $response = Invoke-WebRequest -Uri $test.Url -TimeoutSec 5 -ErrorAction Stop
    $content = $response.Content
    
    $keywordFound = $false
    foreach ($keyword in $test.Keywords) {
      if ($content -match $keyword) {
        $keywordFound = $true
        break
      }
    }
    
    if ($response.StatusCode -eq 200 -and $keywordFound) {
      Ok "$($test.Name) - PASS"
      $passed++
      $results += @{ Name = $test.Name; Status = "PASS"; Time = 0 }
    } else {
      Fail "$($test.Name) - FAIL (keyword not found)"
      $failed++
      $results += @{ Name = $test.Name; Status = "FAIL"; Time = 0; Message = "Keyword not found" }
    }
  } catch {
    Fail "$($test.Name) - FAIL ($_)"
    $failed++
    $results += @{ Name = $test.Name; Status = "FAIL"; Time = 0; Message = $_.Exception.Message }
  }
}

# Generate JUnit XML
$xml = @"
<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="$($tests.Count)" failures="$failed" time="0">
  <testsuite name="MockModeSmoke" tests="$($tests.Count)" failures="$failed" time="0">
"@

foreach ($result in $results) {
  $xml += "`n    <testcase name=`"$($result.Name)`" time=`"$($result.Time)`">"
  if ($result.Status -eq "FAIL") {
    $xml += "`n      <failure message=`"$($result.Message)`"/>"
  }
  $xml += "`n    </testcase>"
}

$xml += @"

  </testsuite>
</testsuites>
"@

$xml | Out-File -FilePath $reportPath -Encoding utf8

# Cleanup
Say "Stopping services..."
Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue

# Summary
Say "`n=== Summary ==="
Say "Passed: $passed"
Say "Failed: $failed"
Say "Report: $reportPath"

if ($failed -eq 0) {
  Ok "All tests passed!"
  exit 0
} else {
  Fail "$failed test(s) failed"
  exit 1
}
