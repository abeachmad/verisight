# 🎬 Demo Plan

## Demo 1: Mock Mode (30-60s)

### Purpose
Show UI/UX flow without blockchain dependency

### Steps
1. **Landing Page** (5s)
   - Show hero section
   - Navigate to Events

2. **Events List** (10s)
   - Show AI-verified events
   - Confidence badges (95%, 87%, etc.)
   - Click event to detail

3. **Market Detail** (20s)
   - Event info with confidence bar
   - Mock on-chain evidence (CID, TX hash, chain ID)
   - Odds chart (mock data)
   - Stake panel

4. **Stake Logic** (15s)
   - Show enabled stake button
   - Show disabled state (cutoff passed)
   - Show disabled state (resolved)

5. **Dashboard** (10s)
   - StatusBar metrics
   - Analytics overview

### Evidence
- Screenshots of each page
- Video recording (60s max)

---

## Demo 2: Linera Mode (60-90s)

### Purpose
Prove Linera SDK integration with on-chain evidence

### Prerequisites
- Devnet running
- Apps deployed (oracle_feed + market)
- Frontend in LINERA mode

### Steps
1. **StatusBar** (10s)
   - Show Linera service URL
   - Block height (real)
   - Latency (real)
   - Status indicator (green)

2. **Events with On-Chain Evidence** (20s)
   - Navigate to Events
   - Click event
   - Show **real** on-chain evidence:
     - ✅ IPFS CID (clickable, opens gateway)
     - ✅ TX Hash (copyable)
     - ✅ Chain ID (from Linera)
     - ✅ Confidence % (from oracle)
     - ✅ Sources (verification links)

3. **Real-Time Odds Polling** (15s)
   - Show odds chart
   - Explain 3s polling interval
   - Show odds update (if stake happens)

4. **Stake with Anti-Manipulation** (20s)
   - Enter stake amount
   - Show potential payout
   - Click "Place Prediction"
   - Show velocity cap warning (if triggered)
   - Show cooldown message (if triggered)
   - Show auto-disabled when cutoff passed

5. **GraphQL Query** (15s)
   - Open browser DevTools Network tab
   - Show GraphQL request to Linera service
   - Show response with market data

### Evidence Required
- ✅ TX hash visible and copyable
- ✅ Chain ID displayed
- ✅ IPFS CID link works
- ✅ Odds polling (3s interval)
- ✅ Stake button logic (enabled/disabled)
- ✅ GraphQL request in Network tab

### Key Proof Points
1. **Uses Linera SDK**: WASM contracts deployed
2. **On-chain data**: TX hash, chain ID, CID
3. **Real-time**: GraphQL polling every 3s
4. **Anti-manipulation**: Velocity cap, cooldown
5. **Microchains**: Isolated state per event

---

## Recording Tips

### Setup
- Resolution: 1920x1080 or 1280x720
- Browser zoom: 100%
- Clear browser cache before recording
- Close unnecessary tabs

### Tools
- Windows: OBS Studio, ShareX, Game Bar (Win+G)
- Screen recording: 30fps minimum
- Audio: Optional narration

### Narration Script (Optional)

**Mock Mode:**
> "Verisight: AI-verified prediction markets. Events are verified by AI agents with confidence scores. Users can stake on outcomes with real-time odds."

**Linera Mode:**
> "Every event is published on-chain using Linera microchains. Here's the proof: IPFS CID for full data, transaction hash for immutability, and chain ID. Odds update in real-time via GraphQL. Anti-manipulation guards prevent price manipulation."

---

## Submission Checklist

### Videos
- [ ] Mock mode demo (30-60s)
- [ ] Linera mode demo (60-90s)
- [ ] Upload to YouTube (unlisted)

### Screenshots
- [ ] Landing page
- [ ] Events list with confidence
- [ ] Market detail with on-chain evidence
- [ ] Stake panel (enabled + disabled)
- [ ] StatusBar with metrics
- [ ] DevTools showing GraphQL request

### Documentation
- [ ] README with 3 modes (mock/devnet/testnet)
- [ ] CHANGELOG with wave entry
- [ ] Evidence of APP_IDs in config

### Code
- [ ] All tests passing
- [ ] WASM builds successfully
- [ ] No secrets in repo
- [ ] .env.example provided

---

## Timeline

- **Mock Mode**: 5 minutes setup + 2 minutes recording
- **Linera Mode**: 10 minutes deploy + 3 minutes recording
- **Total**: ~20 minutes
