# deploy-testnet.ps1 - Connect to Linera testnet
param(
  [Parameter(Mandatory=$true)]
  [string]$ServiceUrl,
  [Parameter(Mandatory=$true)]
  [string]$OracleFeedAppId,
  [Parameter(Mandatory=$true)]
  [string]$MarketAppId,
  [string]$ChainId = ""
)

$ErrorActionPreference = 'Stop'
function Say($t){ Write-Host "[testnet] $t" -ForegroundColor Cyan }
function Ok($t){ Write-Host "[OK] $t" -ForegroundColor Green }
function Fail($t){ Write-Host "[FAIL] $t" -ForegroundColor Red; exit 1 }

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $repoRoot 'frontend'
$envLocal = Join-Path $frontendDir '.env.local'

Say "=== Connect to Linera Testnet ==="

# Probe GraphQL endpoint
Say "Probing $ServiceUrl..."
$probeOk = $false
for ($i = 1; $i -le 3; $i++) {
  try {
    $response = Invoke-WebRequest -Uri $ServiceUrl -Method POST -Body '{"query":"{__typename}"}' -ContentType 'application/json' -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
      $probeOk = $true
      break
    }
  } catch {
    Say "Attempt $i/3 failed, retrying..."
    Start-Sleep -Seconds 2
  }
}

if (-not $probeOk) { Fail "Cannot reach $ServiceUrl" }
Ok "GraphQL endpoint reachable"

# Write frontend .env.local
Say "Writing $envLocal (LINERA testnet mode)..."
@"
# Linera Mode - Testnet
REACT_APP_MODE=LINERA
REACT_APP_LINERA_ENABLED=true
REACT_APP_BACKEND_URL=http://127.0.0.1:8001
REACT_APP_LINERA_TESTNET_SERVICE_URL=$ServiceUrl
REACT_APP_ORACLE_FEED_APP_ID=$OracleFeedAppId
REACT_APP_MARKET_APP_ID=$MarketAppId
REACT_APP_CHAIN_ID=$ChainId
REACT_APP_IPFS_GATEWAY_URL=https://ipfs.io/ipfs
"@ | Out-File -FilePath $envLocal -Encoding utf8 -Force

Ok "Testnet config written!"
Say "`nNext steps:"
Say "  1. Start backend: cd backend && `$env:ENV='production'; python -m uvicorn server:app --port 8001 --reload"
Say "  2. Start frontend: cd frontend && npm start"
Say "  3. Open: http://localhost:3000"
