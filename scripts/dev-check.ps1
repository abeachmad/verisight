# dev-check.ps1 - Full validation for backend + frontend
param(
  [switch]$SkipBackend,
  [switch]$SkipFrontend
)

$ErrorActionPreference = 'Continue'
$script:FailCount = 0

function Say($t){ Write-Host "[check] $t" -ForegroundColor Cyan }
function Ok($t){ Write-Host "[PASS] $t" -ForegroundColor Green }
function Fail($t){ Write-Host "[FAIL] $t" -ForegroundColor Red; $script:FailCount++ }

$repoRoot = Split-Path -Parent $PSScriptRoot
$lineraDir = Join-Path $repoRoot 'linera'
$frontendDir = Join-Path $repoRoot 'frontend'

Say "=== Verisight Dev Check ==="

# BACKEND (Rust/Linera)
if (-not $SkipBackend) {
  Say "`nBackend (Rust/Linera)..."
  Push-Location $lineraDir
  
  try {
    Say "cargo fmt --check"
    cargo fmt -- --check 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "fmt" } else { Fail "fmt" }
    
    Say "cargo clippy"
    cargo clippy --all-targets -- -D warnings 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "clippy" } else { Fail "clippy" }
    
    Say "cargo test"
    cargo test 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "test" } else { Fail "test" }
    
    Say "cargo build WASM (oracle_feed)"
    cargo build -p oracle_feed --release --target wasm32-unknown-unknown 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "WASM oracle_feed" } else { Fail "WASM oracle_feed" }
    
    Say "cargo build WASM (market)"
    cargo build -p market --release --target wasm32-unknown-unknown 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "WASM market" } else { Fail "WASM market" }
  }
  finally { Pop-Location }
}

# FRONTEND (React)
if (-not $SkipFrontend) {
  Say "`nFrontend (React)..."
  Push-Location $frontendDir
  
  try {
    if (-not (Test-Path 'node_modules')) {
      Say "npm ci"
      npm ci --legacy-peer-deps 2>&1 | Out-Null
      if ($LASTEXITCODE -ne 0) { npm install --legacy-peer-deps 2>&1 | Out-Null }
    }
    
    Say "npm run lint"
    npm run lint 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "lint" } else { Fail "lint" }
    
    Say "npm run build"
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "build" } else { Fail "build" }
    
    Say "npm test"
    npm test 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "test" } else { Fail "test (passWithNoTests ok)" }
  }
  finally { Pop-Location }
}

# SUMMARY
Say "`n=== Summary ==="
if ($script:FailCount -eq 0) {
  Ok "All checks passed!"
  exit 0
} else {
  Fail "$($script:FailCount) check(s) failed"
  exit 1
}
