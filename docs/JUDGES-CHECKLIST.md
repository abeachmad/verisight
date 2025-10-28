# 📋 Judges Checklist - Verisight Buildathon Submission

## 🎯 Quick Overview

**Project**: Verisight - AI-verified prediction markets on Linera L1  
**Submission Type**: Testable (Mock Mode + Code Evidence)  
**Linera SDK Usage**: ✅ WASM contracts + deployment scripts  
**Demo Strategy**: Dual-mode (Mock for UX, Code for Linera integration proof)

---

## 📹 Demo Videos

### 1. Mock Mode Demo (30-60s)
**Purpose**: Show complete UI/UX flow without blockchain dependency

**How to run**:
```powershell
.\scripts\start-mock.ps1
# Opens http://localhost:3000
```

**What to capture**:
- ✅ Landing page with hero section
- ✅ Events list with AI confidence scores (95%, 87%, etc.)
- ✅ Market detail page showing:
  - Event info with confidence bar
  - Mock on-chain evidence (IPFS CID, TX hash, chain ID)
  - Real-time odds chart
  - Stake panel with anti-manipulation logic
- ✅ StatusBar metrics (latency, block height, status)
- ✅ Copy Trading dashboard
- ✅ Analytics overview

**Key features to highlight**:
- AI verification with multi-source consensus
- Real-time odds updates (3s polling)
- Stake button logic (enabled/disabled based on cutoff/resolution)
- Anti-manipulation guards (velocity cap, cooldown)

---

### 2. Linera Integration Evidence (5-10 min)
**Purpose**: Prove Linera SDK usage through code and builds

**How to run**:
```powershell
.\scripts\show-linera-evidence.ps1
```

**What this generates**:
- ✅ WASM builds for both contracts (oracle_feed + market)
- ✅ All Rust tests passing
- ✅ Deployment commands shown
- ✅ Log file saved to `docs/screens/build-and-tests.log`

**Screenshots to capture**:
1. Terminal showing successful WASM builds
2. Test results (all passing)
3. WASM file sizes
4. Deployment commands (linera publish)

---

## 📸 Required Screenshots

### Frontend (Mock Mode)
1. **Landing Page**
   - Hero section with "AI-verified events → Linera microchains"
   - Navigation menu

2. **Events List**
   - Multiple events with confidence badges
   - AI verification status
   - Event categories

3. **Market Detail Page**
   - Event title and description
   - Confidence bar (e.g., 95%)
   - On-chain evidence section:
     - ✅ IPFS CID (clickable link)
     - ✅ TX Hash (copyable)
     - ✅ Chain ID
     - ✅ Block Height
   - Odds chart (Yes/No percentages)
   - Stake panel with amount input

4. **Stake Button States**
   - Enabled (before cutoff)
   - Disabled with "Cutoff passed" message
   - Disabled with "Market resolved" message

5. **StatusBar**
   - Service URL
   - Block height (updating)
   - Latency (ms)
   - Status indicator (green/yellow/red)

6. **Copy Trading Dashboard**
   - Strategy cards with performance metrics
   - Follow/Unfollow buttons

7. **DevTools Network Tab** (optional)
   - GraphQL requests to backend
   - Polling interval (3s)

### Backend (Code Evidence)
1. **WASM Build Output**
   - `cargo build --target wasm32-unknown-unknown --release`
   - Success message for oracle_feed
   - Success message for market
   - WASM file sizes

2. **Test Results**
   - `cargo test` output
   - All tests passing (oracle_feed + market)
   - Test count and duration

3. **Deployment Scripts**
   - `scripts/deploy-local.ps1` content
   - `scripts/deploy-testnet.ps1` content
   - `linera publish` commands visible

---

## 📄 Documentation Evidence

### Core Docs
- ✅ `README.md` - Dual-mode strategy explained
- ✅ `CHANGELOG.md` - Wave 02 entry with Linera integration
- ✅ `docs/ONCHAIN.md` - Linera ABI and GraphQL queries
- ✅ `docs/LINERA_WINDOWS_WORKAROUND.md` - Windows installation guide
- ✅ `QUICK-START.md` - 3-mode usage (mock/devnet/testnet)
- ✅ `SANITY-CHECK.md` - Testing checklist

### Code Structure
- ✅ `linera/oracle_feed/` - Oracle contract (Rust + WASM)
- ✅ `linera/market/` - Market contract (Rust + WASM)
- ✅ `scripts/` - Deployment and testing scripts
- ✅ `backend/` - FastAPI + AI agents
- ✅ `frontend/` - React + TailwindCSS

---

## 🔧 Code Quality Evidence

### Rust (Linera Contracts)
```powershell
# Run from repo root
cd linera/oracle_feed
cargo fmt --check
cargo clippy -- -D warnings
cargo test
cargo build --target wasm32-unknown-unknown --release

cd ../market
cargo fmt --check
cargo clippy -- -D warnings
cargo test
cargo build --target wasm32-unknown-unknown --release
```

**Expected results**:
- ✅ 0 formatting issues
- ✅ 0 clippy warnings
- ✅ All tests passing
- ✅ WASM builds successful

### Backend (Python)
```powershell
cd backend
python -m pytest tests/ -v
```

**Expected results**:
- ✅ 29 tests passing
- ✅ 0 failures

### Frontend (React)
```powershell
cd frontend
npm run lint
npm run format
npm run build
```

**Expected results**:
- ✅ 0 lint errors
- ✅ Build successful

---

## 🚀 Deployment Readiness

### Mock Mode (Immediate)
```powershell
.\scripts\start-mock.ps1
```
- ✅ Backend starts on port 8001
- ✅ Frontend starts on port 3000
- ✅ Full functionality without blockchain

### Linera Devnet (WSL2/Linux)
```bash
# Install Linera CLI
cargo install linera-service

# Deploy contracts
./scripts/deploy-local.sh

# Outputs:
# - OracleFeed APP_ID
# - Market APP_ID
# - Chain ID
# - Service URL
```

### Linera Testnet (Future)
```powershell
.\scripts\deploy-testnet.ps1 `
  -ServiceUrl https://rpc.testnet.linera.net `
  -OracleFeedAppId <APP_ID> `
  -MarketAppId <APP_ID>
```

---

## 🎓 Linera SDK Usage Proof

### 1. WASM Contracts
- **Location**: `linera/oracle_feed/` and `linera/market/`
- **Language**: Rust with Linera SDK
- **Target**: `wasm32-unknown-unknown`
- **Features**:
  - Contract/Service architecture
  - Views (Register, Map, Queue)
  - ABI (Operations, Queries)
  - GraphQL service layer

### 2. Key Linera Features Used

**Oracle Feed Contract**:
- `EventRecord` struct with validation
- Confidence scoring (0.0-1.0)
- Multi-source verification (≥2 sources required)
- Block height tracking

**Market Contract**:
- `MarketState` with odds calculation
- Anti-manipulation guards:
  - Velocity cap (MAX_PRICE_DELTA = 0.15)
  - Cooldown period (COOLDOWN_MS = 5000)
- Stake tracking per user
- Resolution logic

### 3. Deployment Scripts
- `deploy-local.ps1` - Devnet deployment with APP_ID extraction
- `deploy-testnet.ps1` - Testnet connection with GraphQL probe
- `toggle-mode.ps1` - Switch between mock/linera modes

---

## ✅ Submission Checklist

### Videos
- [ ] Mock mode demo (30-60s) - uploaded to YouTube
- [ ] Code evidence walkthrough (5-10 min) - optional

### Screenshots
- [ ] Landing page
- [ ] Events list with confidence scores
- [ ] Market detail with on-chain evidence (CID, TX, chain ID)
- [ ] Stake panel (enabled + disabled states)
- [ ] StatusBar with metrics
- [ ] WASM build output
- [ ] Test results (all passing)

### Documentation
- [ ] README with dual-mode strategy
- [ ] CHANGELOG with Wave 02 entry
- [ ] LINERA_WINDOWS_WORKAROUND.md
- [ ] JUDGES-CHECKLIST.md (this file)
- [ ] All code comments and docs up to date

### Code
- [ ] All Rust tests passing (oracle_feed + market)
- [ ] All backend tests passing (29 tests)
- [ ] Frontend builds successfully
- [ ] No secrets in repo
- [ ] .env.example provided
- [ ] WASM builds successful

### Deployment
- [ ] Mock mode works (start-mock.ps1)
- [ ] show-linera-evidence.ps1 generates logs
- [ ] deploy-local.ps1 ready (for WSL2/Linux)
- [ ] deploy-testnet.ps1 ready

---

## 🏆 Why This Submission is Valid

1. **Uses Linera SDK**: WASM contracts written in Rust with Linera SDK
2. **Testable**: Mock mode demonstrates full functionality
3. **Deployable**: Scripts ready for devnet/testnet deployment
4. **Complete**: Frontend + Backend + Contracts + AI agents
5. **Quality**: All tests passing, 0 warnings, clean code
6. **Documented**: Comprehensive docs for setup and deployment

---

## 📞 Quick Start for Judges

```powershell
# 1. Clone repo
git clone <repo-url>
cd verisight

# 2. Run mock mode (fastest)
.\scripts\start-mock.ps1

# 3. Show Linera evidence
.\scripts\show-linera-evidence.ps1

# 4. Check logs
Get-Content docs\screens\build-and-tests.log
```

**Expected time**: 5 minutes to see everything working

---

## 🔗 Links

- **Demo Video**: [YouTube link]
- **Repository**: [GitHub link]
- **Documentation**: See `README.md` and `docs/` folder
- **Live Demo**: http://localhost:3000 (after running start-mock.ps1)

---

**Built with ❤️ on Linera L1**
