# 🚀 Quick Start Guide

## Mode 1: Mock Mode (Fast - No Linera Required)

### One-Click Start
```powershell
.\scripts\start-mock.ps1
```

### Manual Start
```powershell
# Terminal 1: Backend
cd backend
$env:ENV="development"
uvicorn server:app --host 127.0.0.1 --port 8001 --reload

# Terminal 2: Frontend
cd frontend
npm start
```

**Access**: http://localhost:3000

---

## Mode 2: Linera Devnet (Full Integration)

### Prerequisites
- Linera CLI installed: `cargo install linera`
- WASM target: `rustup target add wasm32-unknown-unknown`

### Deploy & Start
```powershell
# Step 1: Validate & Build
.\scripts\dev-check.ps1

# Step 2: Deploy to Devnet
.\scripts\deploy-local.ps1

# Step 3: Start Backend
cd backend
$env:ENV="production"
uvicorn server:app --port 8001 --reload

# Step 4: Start Frontend (new terminal)
cd frontend
npm start
```

**Access**: http://localhost:3000 (with Linera GraphQL)

---

## Mode 3: Linera Testnet

### Prerequisites
- Testnet GraphQL URL
- Deployed APP_IDs (oracle_feed + market)

### Connect & Start
```powershell
# Configure testnet
.\scripts\deploy-testnet.ps1 `
  -ServiceUrl https://YOUR-TESTNET/graphql `
  -OracleFeedAppId <ORACLE_APP_ID> `
  -MarketAppId <MARKET_APP_ID> `
  -ChainId <CHAIN_ID>

# Start Backend
cd backend
$env:ENV="production"
uvicorn server:app --port 8001 --reload

# Start Frontend (new terminal)
cd frontend
npm start
```

**Access**: http://localhost:3000 (with testnet data)

---

## Toggle Between Modes

```powershell
# Switch to mock
.\scripts\toggle-mode.ps1 -Mode mock

# Switch to linera (after deploy)
.\scripts\toggle-mode.ps1 -Mode linera
```

**Note**: Linera mode requires deployment first (devnet or testnet)

---

## Troubleshooting

### Backend won't start
```powershell
cd backend
pip install -r requirements.txt
```

### Frontend won't start
```powershell
cd frontend
npm install --legacy-peer-deps
```

### Linera service not found
```powershell
# Check if deployed
cat linera\scripts\.last_deploy.json

# Re-deploy
.\scripts\dev-check.ps1 -Mode devnet
```

---

## What's Running?

### Mock Mode
- Backend: Mock data, no blockchain
- Frontend: Local API calls
- Database: Optional (in-memory fallback)

### Linera Mode
- Backend: Real Linera GraphQL queries
- Frontend: On-chain data (tx_hash, chain_id, CID)
- Contracts: oracle_feed + market on devnet

---

## Next Steps

1. **Review UI**: Use mock mode
2. **Test Integration**: Use linera mode
3. **Record Demo**: Both modes for submission
4. **Submit**: Include evidence from linera mode
