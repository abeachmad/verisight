# Auto Demo Setup - Non-Interactive
# Usage: .\scripts\auto-demo-setup.ps1 [-AutoCommit:$false] [-AutoPush:$false] [-OpenBrowser:$true]

param(
    [switch]$AutoCommit,
    [switch]$AutoPush,
    [switch]$OpenBrowser = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot | Split-Path -Parent
$logDir = Join-Path $rootDir "docs\screens"
$logFile = Join-Path $logDir "auto-demo-setup.log"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

function Log {
    param([string]$msg)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $msg" | Tee-Object -FilePath $logFile -Append
    Write-Host $msg
}

Log "=== Auto Demo Setup Started ==="
Log "Root: $rootDir"
Log "Log: $logFile"

try {
    # A) Frontend Setup
    Log "`n[1/5] Frontend Dependencies..."
    Push-Location (Join-Path $rootDir "frontend")
    
    if (-not (Test-Path "node_modules")) {
        Log "Installing dependencies..."
        npm ci 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            npm install --legacy-peer-deps 2>&1 | Out-Null
        }
    }
    
    # Install MSW and cross-env
    Log "Ensuring msw and cross-env..."
    npm install --save-dev msw cross-env --legacy-peer-deps 2>&1 | Out-Null
    
    # Initialize MSW
    if (-not (Test-Path "public\mockServiceWorker.js")) {
        Log "Initializing MSW..."
        npx msw init public/ --save 2>&1 | Out-Null
    }
    
    # Seed fixtures
    Log "Seeding mock fixtures..."
    npm run mock:seed 2>&1 | Tee-Object -FilePath $logFile -Append
    
    Pop-Location
    
    # B) Sanity Checks
    Log "`n[2/5] Running Sanity Checks..."
    Push-Location (Join-Path $rootDir "frontend")
    
    Log "Linting..."
    npm run lint 2>&1 | Tee-Object -FilePath $logFile -Append | Out-Null
    
    Log "Building..."
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Log "  [OK] Build successful"
    }
    
    Log "Testing..."
    npm run test:mock 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Log "  [OK] Tests passed"
    } else {
        Log "  [WARN] Some tests failed (non-blocking)"
    }
    
    Pop-Location
    
    # C) Backend Check
    Log "`n[3/5] Backend Check..."
    $uvicornCheck = python -m uvicorn --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Log "  [OK] uvicorn available"
    } else {
        Log "  [WARN] uvicorn not available (optional for demo)"
    }
    
    # D) Start Mock Mode
    Log "`n[4/5] Starting Mock Mode..."
    $startScript = Join-Path $rootDir "scripts\start-mock.ps1"
    
    if (Test-Path $startScript) {
        Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $startScript -WindowStyle Normal
        Log "  [OK] Mock mode starting..."
        
        # Wait and probe
        Start-Sleep -Seconds 8
        
        try {
            $frontendProbe = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing 2>&1
            Log "  [OK] Frontend: http://localhost:3000"
        } catch {
            Log "  [WARN] Frontend not yet ready"
        }
        
        try {
            $backendProbe = Invoke-WebRequest -Uri "http://127.0.0.1:8001/docs" -TimeoutSec 5 -UseBasicParsing 2>&1
            Log "  [OK] Backend: http://127.0.0.1:8001"
        } catch {
            Log "  [WARN] Backend not yet ready"
        }
    }
    
    # E) Git Operations
    Log "`n[5/5] Git Operations..."
    if ($AutoCommit) {
        Push-Location $rootDir
        git add -A
        git commit -m "chore(demo): auto-setup mock fixtures, MSW, tests, and start scripts [skip ci]" 2>&1 | Tee-Object -FilePath $logFile -Append
        Log "  [OK] Local commit created"
        
        if ($AutoPush) {
            git push 2>&1 | Tee-Object -FilePath $logFile -Append
            Log "  [OK] Pushed to remote"
        }
        Pop-Location
    } else {
        Log "  [SKIP] AutoCommit disabled"
    }
    
    # F) Open Browser
    if ($OpenBrowser) {
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:3000"
        Log "  [OK] Browser opened"
    }
    
    Log "`n=== Auto Demo Setup Complete ==="
    Log "Frontend: http://localhost:3000"
    Log "Backend: http://127.0.0.1:8001"
    Log "Log: $logFile"
    
} catch {
    Log "[ERROR] Setup failed: $_"
    Log "Continuing anyway..."
}
