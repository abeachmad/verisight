# setup-deps.ps1 - Install missing dependencies
$ErrorActionPreference = 'Stop'

function Say($t){ Write-Host "[setup] $t" -ForegroundColor Cyan }
function Ok($t){ Write-Host "[OK] $t" -ForegroundColor Green }
function Fail($t){ Write-Host "[FAIL] $t" -ForegroundColor Red }

Say "=== Setup Dependencies ==="

# Check Python
try {
  python --version | Out-Null
  Ok "Python installed"
} catch {
  Fail "Python not found. Install from https://python.org"
  exit 1
}

# Install backend dependencies
Say "Installing backend dependencies..."
$backendDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'backend'
Push-Location $backendDir
try {
  pip install -r requirements.txt
  Ok "Backend dependencies installed"
} catch {
  Fail "Failed to install backend dependencies"
  exit 1
} finally {
  Pop-Location
}

# Check if uvicorn is accessible
try {
  python -m uvicorn --version | Out-Null
  Ok "uvicorn accessible via 'python -m uvicorn'"
} catch {
  Fail "uvicorn not accessible"
  exit 1
}

# Install Linera CLI (optional - for Linera mode only)
Say "`nLinera CLI check..."
try {
  linera --version | Out-Null
  Ok "Linera CLI already installed"
} catch {
  Say "Linera CLI not found. Install with:"
  Say "  cargo install linera-service linera-sdk"
  Say "  (Required only for Linera mode, not for Mock mode)"
}

# Check frontend dependencies
Say "`nChecking frontend dependencies..."
$frontendDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'frontend'
if (Test-Path (Join-Path $frontendDir 'node_modules')) {
  Ok "Frontend dependencies already installed"
} else {
  Say "Installing frontend dependencies..."
  Push-Location $frontendDir
  try {
    npm install --legacy-peer-deps
    Ok "Frontend dependencies installed"
  } catch {
    Fail "Failed to install frontend dependencies"
    exit 1
  } finally {
    Pop-Location
  }
}

Say "`n=== Setup Complete ==="
Say "Mock Mode ready: .\scripts\start-mock.ps1"
Say "For Linera Mode: Install Linera CLI first"
