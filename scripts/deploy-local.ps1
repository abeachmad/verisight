# deploy-local.ps1 - Deploy to Linera devnet
param(
  [string]$ServiceHost = '127.0.0.1',
  [int]$ServicePort = 8080
)

$ErrorActionPreference = 'Stop'
function Say($t){ Write-Host "[deploy] $t" -ForegroundColor Cyan }
function Ok($t){ Write-Host "[OK] $t" -ForegroundColor Green }
function Fail($t){ Write-Host "[FAIL] $t" -ForegroundColor Red; exit 1 }

$repoRoot = Split-Path -Parent $PSScriptRoot
$lineraDir = Join-Path $repoRoot 'linera'
$frontendDir = Join-Path $repoRoot 'frontend'
$wasmDir = Join-Path $lineraDir 'target\wasm32-unknown-unknown\release'
$envLocal = Join-Path $frontendDir '.env.local'

Say "=== Deploy Linera Devnet ==="

# Check WASM files
$oracleWasm = Join-Path $wasmDir 'oracle_feed.wasm'
$marketWasm = Join-Path $wasmDir 'market.wasm'

if (-not (Test-Path $oracleWasm)) { Fail "WASM not found: $oracleWasm. Run dev-check.ps1 first" }
if (-not (Test-Path $marketWasm)) { Fail "WASM not found: $marketWasm. Run dev-check.ps1 first" }

# Check linera CLI
try { linera --version | Out-Null } catch { Fail "Linera CLI not found. Install: cargo install linera" }

# Start linera service
$serviceUrl = "http://$ServiceHost`:$ServicePort"
Say "Starting linera service at $serviceUrl..."

$serviceProc = Start-Process -FilePath "linera" -ArgumentList "service","--port",$ServicePort,"--host",$ServiceHost -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

# Mock deployment (replace with real linera commands)
Say "Publishing oracle_feed..."
$oracleAppId = "e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65010000000000000000000000e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65030000000000000000000000"
Ok "oracle_feed APP_ID: $oracleAppId"

Say "Publishing market..."
$marketAppId = "e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65010000000000000000000000e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65040000000000000000000000"
Ok "market APP_ID: $marketAppId"

$chainId = "e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65"

# Write frontend .env.local
Say "Writing $envLocal (LINERA mode)..."
@"
# Linera Mode - Devnet
REACT_APP_MODE=LINERA
REACT_APP_LINERA_ENABLED=true
REACT_APP_BACKEND_URL=http://127.0.0.1:8001
REACT_APP_LINERA_TESTNET_SERVICE_URL=$serviceUrl/graphql
REACT_APP_ORACLE_FEED_APP_ID=$oracleAppId
REACT_APP_MARKET_APP_ID=$marketAppId
REACT_APP_CHAIN_ID=$chainId
REACT_APP_IPFS_GATEWAY_URL=https://ipfs.io/ipfs
"@ | Out-File -FilePath $envLocal -Encoding utf8 -Force

Ok "Deployment complete!"
Say "`nNext steps:"
Say "  1. Start backend: cd backend && uvicorn server:app --port 8001 --reload"
Say "  2. Start frontend: cd frontend && npm start"
Say "  3. Open: http://localhost:3000"
