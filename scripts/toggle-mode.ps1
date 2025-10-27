# toggle-mode.ps1 - Switch between mock and linera mode
param(
  [ValidateSet('mock','linera')]
  [string]$Mode = 'mock'
)

$ErrorActionPreference = 'Stop'
$frontendDir = Join-Path $PSScriptRoot '..\frontend'
$envLocal = Join-Path $frontendDir '.env.local'
$backendDir = Join-Path $PSScriptRoot '..\backend'
$backendEnv = Join-Path $backendDir '.env'

function Say($t){ Write-Host "[toggle] $t" -ForegroundColor Cyan }
function Ok($t){ Write-Host "[OK] $t" -ForegroundColor Green }

if ($Mode -eq 'mock') {
  Say "Switch to MOCK mode..."
  
  # Frontend: point to local backend
  @"
# Mock Mode - Local Backend
REACT_APP_BACKEND_URL=http://127.0.0.1:8001
REACT_APP_LINERA_TESTNET_SERVICE_URL=
REACT_APP_IPFS_GATEWAY_URL=https://ipfs.io/ipfs
"@ | Out-File -FilePath $envLocal -Encoding utf8 -Force
  
  # Backend: development mode
  if (Test-Path $backendEnv) {
    (Get-Content $backendEnv) -replace '^ENV=.*', 'ENV=development' | Set-Content $backendEnv
  }
  
  Ok "Mock mode active. Start: uvicorn server:app --port 8001 --reload"
}
else {
  Say "Switch to LINERA mode..."
  
  $deployJson = Join-Path $PSScriptRoot '..\linera\scripts\.last_deploy.json'
  if (-not (Test-Path $deployJson)) {
    Write-Host "[!] Run deploy first: .\scripts\dev-check.ps1 -Mode devnet" -ForegroundColor Yellow
    exit 1
  }
  
  $deploy = Get-Content $deployJson | ConvertFrom-Json
  
  # Frontend: point to linera service
  @"
# Linera Mode - Devnet/Testnet
REACT_APP_BACKEND_URL=http://127.0.0.1:8001
REACT_APP_LINERA_TESTNET_SERVICE_URL=$($deploy.service_url)
REACT_APP_IPFS_GATEWAY_URL=https://ipfs.io/ipfs
REACT_APP_CHAIN_ID=$($deploy.chain_id)
REACT_APP_MARKET_APP_ID=$($deploy.market_app_id)
REACT_APP_ORACLE_APP_ID=$($deploy.oraclefeed_app_id)
"@ | Out-File -FilePath $envLocal -Encoding utf8 -Force
  
  # Backend: production mode
  if (Test-Path $backendEnv) {
    (Get-Content $backendEnv) -replace '^ENV=.*', 'ENV=production' | Set-Content $backendEnv
  }
  
  Ok "Linera mode active. Service: $($deploy.service_url)"
}

Ok "Mode switched to: $Mode"
