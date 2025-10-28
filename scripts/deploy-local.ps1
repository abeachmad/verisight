# deploy-local.ps1 - Deploy to Linera devnet (REAL APP_IDs)
param(
  [string]$ServiceHost = '127.0.0.1',
  [int]$ServicePort = 8080
)

# Safely free only our dev ports (frontend 3000, backend 8001). Add others if needed.
$ports = @(3000,8001)
if ($env:PORT) { $ports[0] = [int]$env:PORT }
if ($env:BACKEND_PORT) { $ports += [int]$env:BACKEND_PORT }
powershell -NoProfile -ExecutionPolicy Bypass -File "$PSScriptRoot\kill-ports.ps1" -Ports $ports | Out-Host

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

# Real deployment with linera publish
Say "Publishing oracle_feed..."
$oraclePublishJson = Join-Path $lineraDir '.linera_oracle_publish.json'
try {
  $publishCmd = "linera publish --wasm-path `"$oracleWasm`" --json"
  Invoke-Expression $publishCmd | Out-File -FilePath $oraclePublishJson -Encoding utf8
  $oracleData = Get-Content $oraclePublishJson | ConvertFrom-Json
  $oracleAppId = $oracleData.application_id
  if (-not $oracleAppId) { $oracleAppId = $oracleData.app_id }
  if (-not $oracleAppId) { Fail "Failed to get oracle_feed APP_ID" }
  Ok "oracle_feed APP_ID: $oracleAppId"
} catch {
  Fail "Failed to publish oracle_feed: $_"
}

Say "Publishing market..."
$marketPublishJson = Join-Path $lineraDir '.linera_market_publish.json'
try {
  $publishCmd = "linera publish --wasm-path `"$marketWasm`" --json"
  Invoke-Expression $publishCmd | Out-File -FilePath $marketPublishJson -Encoding utf8
  $marketData = Get-Content $marketPublishJson | ConvertFrom-Json
  $marketAppId = $marketData.application_id
  if (-not $marketAppId) { $marketAppId = $marketData.app_id }
  if (-not $marketAppId) { Fail "Failed to get market APP_ID" }
  Ok "market APP_ID: $marketAppId"
} catch {
  Fail "Failed to publish market: $_"
}

# Get chain ID from wallet
try {
  $walletJson = linera wallet show --json | ConvertFrom-Json
  $chainId = $walletJson.default_chain_id
  if (-not $chainId -and $walletJson.chains) { $chainId = $walletJson.chains[0].chain_id }
  if ($chainId) { Ok "Chain ID: $chainId" }
} catch {
  Say "Warning: Could not get chain ID from wallet"
  $chainId = ""
}

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
Say "`nAPP_IDs for README:"
Say "  OracleFeed: $oracleAppId"
Say "  Market: $marketAppId"
Say "  Chain ID: $chainId"
Say "`nNext steps:"
Say "  1. Start backend: cd backend && `$env:ENV='production'; python -m uvicorn server:app --port 8001 --reload"
Say "  2. Start frontend: cd frontend && npm start"
Say "  3. Open: http://localhost:3000"
