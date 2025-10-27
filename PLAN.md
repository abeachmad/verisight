# 🎯 Verisight - Linera MVP Implementation Plan

**Target**: Production-ready on-chain oracle + prediction market on Linera L1  
**Timeline**: 7-10 days  
**Current Status**: Off-chain prototype with mock oracle

---

## 📊 1. Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  Landing │ Markets │ Trading │ Dashboard │ Governance       │
│                    WalletContext (MetaMask)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/WebSocket
┌────────────────────────┴────────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  REST API    │  │  WebSocket   │  │   Auth JWT   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────┐      │
│  │           AI Agents (Mock Mode)                  │      │
│  │  EventDetector │ SourceVerifier │ ConfidenceScorer│     │
│  └──────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │        LineraOracleMock (Ready for integration)  │      │
│  └──────────────────────────────────────────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                    MongoDB (Off-chain)                       │
│  events │ markets │ predictions │ strategies │ users        │
└──────────────────────────────────────────────────────────────┘
```

### Current Modules

**Backend** (`/backend/`)
- `server.py` - FastAPI app, REST endpoints, WebSocket
- `ai_agents/` - 4 AI agents (mock mode)
  - `event_detector.py`
  - `source_verifier.py`
  - `confidence_scorer.py`
  - `summary_composer.py`
- `oracle/linera_oracle.py` - Mock oracle (structure ready)

**Frontend** (`/frontend/src/`)
- `pages/` - 7 pages (Landing, Markets, CreateMarket, MarketDetail, CopyTrading, Dashboard, Governance)
- `components/` - Navbar, Footer, 40+ shadcn/ui components
- `context/WalletContext.js` - MetaMask integration

**Database**: MongoDB (off-chain storage)

---

## 🎯 2. Gap Analysis: Current vs Target

### ✅ Already Have
- ✅ Frontend UI complete (React + TailwindCSS)
- ✅ Backend API structure (FastAPI)
- ✅ AI agents pipeline (mock mode)
- ✅ Oracle structure ready
- ✅ WebSocket real-time updates
- ✅ Wallet authentication (MetaMask)
- ✅ MongoDB integration

### ❌ Missing for Linera MVP

#### A. On-Chain Components (CRITICAL)
- ❌ **Linera smart contracts** (Rust)
  - OracleFeed contract (event verification)
  - Market contract (prediction market logic)
  - Token contract (betting/rewards)
- ❌ **Linera SDK integration** in backend
- ❌ **On-chain storage** (replace MongoDB for critical data)
- ❌ **Microchain deployment** scripts

#### B. Backend Integration
- ❌ **Real Linera oracle** (replace mock)
- ❌ **GraphQL client** for Linera queries
- ❌ **Transaction signing** and submission
- ❌ **Event listeners** for on-chain events
- ❌ **Hybrid storage** (on-chain + off-chain)

#### C. Frontend Integration
- ❌ **Linera wallet** integration (replace/extend MetaMask)
- ❌ **On-chain transaction** UI
- ❌ **Real-time chain** state sync
- ❌ **Gas estimation** display

#### D. Data & Testing
- ❌ **Seed data** generator (demo events/markets)
- ❌ **Integration tests** (backend ↔ Linera)
- ❌ **E2E tests** (frontend ↔ backend ↔ Linera)
- ❌ **Load testing** (concurrent users)

#### E. Security & Anti-Manipulation
- ❌ **Rate limiting** (API + on-chain)
- ❌ **Sybil resistance** (wallet verification)
- ❌ **Oracle manipulation** detection
- ❌ **Market manipulation** detection (wash trading, etc.)
- ❌ **Audit logging** (all transactions)

#### F. Monitoring & Metrics
- ❌ **Prometheus metrics** (API, chain, AI agents)
- ❌ **Grafana dashboards** (telemetry)
- ❌ **Error tracking** (Sentry/similar)
- ❌ **Performance monitoring** (response times, gas usage)

#### G. DevOps & CI/CD
- ❌ **GitHub Actions** (test, build, deploy)
- ❌ **Docker Compose** (full stack)
- ❌ **Deployment scripts** (testnet/mainnet)
- ❌ **Environment configs** (dev/staging/prod)

#### H. Documentation
- ❌ **Smart contract docs** (Rust docs)
- ❌ **API documentation** (OpenAPI/Swagger)
- ❌ **Integration guide** (how to use oracle)
- ❌ **Deployment guide** (step-by-step)

---

## 🚀 3. Implementation Plan (7-10 Days)

### Phase 1: Linera Foundation (Days 1-2) - **CRITICAL PATH**
**Goal**: Deploy basic smart contracts + connect backend

**Effort**: L (Large)  
**Dependencies**: None  
**Blockers**: Linera SDK setup, Rust environment

#### Tasks:
1. **Setup Linera Development Environment**
   - Install Linera CLI (`cargo install linera`)
   - Setup local testnet
   - Create wallet and fund accounts
   - Configure network endpoints

2. **Smart Contract: OracleFeed** (Rust)
   - Event struct (id, title, result, confidence, timestamp)
   - `publish_event()` - Store verified events
   - `get_event()` - Query event by ID
   - `list_events()` - Paginated list
   - Access control (only authorized oracle)

3. **Smart Contract: Market** (Rust)
   - Market struct (id, event_id, options, total_pool, status)
   - `create_market()` - Create prediction market
   - `place_bet()` - User places bet on option
   - `resolve_market()` - Resolve based on oracle feed
   - `claim_winnings()` - Winners claim rewards
   - AMM pricing (constant product formula)

4. **Deploy Contracts to Testnet**
   - Deploy OracleFeed
   - Deploy Market
   - Test basic operations
   - Document contract addresses

#### Files Created/Modified:
```
NEW:
  contracts/
    oracle_feed/
      src/lib.rs              # OracleFeed contract
      Cargo.toml
    market/
      src/lib.rs              # Market contract
      Cargo.toml
    Cargo.toml                # Workspace
  scripts/
    deploy_contracts.sh       # Deployment script
    setup_testnet.sh          # Local testnet setup
  .env.linera                 # Linera config

MODIFIED:
  backend/.env                # Add contract addresses
```

---

### Phase 2: Backend Integration (Days 3-4)
**Goal**: Replace mock oracle with real Linera integration

**Effort**: M (Medium)  
**Dependencies**: Phase 1 complete  
**Blockers**: Contract ABIs, GraphQL schema

#### Tasks:
1. **Linera Client Integration**
   - Install Linera Python SDK (if available) or use GraphQL
   - Create `linera_client.py` wrapper
   - Implement transaction signing
   - Implement query methods

2. **Replace Mock Oracle**
   - Update `linera_oracle.py` with real implementation
   - `publish_event()` → call OracleFeed contract
   - `get_event()` → query from chain
   - Error handling and retries

3. **Market Backend Integration**
   - Add market creation endpoint → call Market contract
   - Add betting endpoint → call `place_bet()`
   - Add resolution endpoint → call `resolve_market()`
   - Sync on-chain state to MongoDB (cache)

4. **Event Listeners**
   - Listen to `EventPublished` events
   - Listen to `MarketCreated` events
   - Listen to `BetPlaced` events
   - Update MongoDB cache
   - Broadcast via WebSocket

#### Files Created/Modified:
```
NEW:
  backend/linera/
    client.py                 # Linera client wrapper
    contracts.py              # Contract ABIs
    events.py                 # Event listeners
  backend/services/
    market_service.py         # Market business logic
    oracle_service.py         # Oracle business logic

MODIFIED:
  backend/oracle/linera_oracle.py  # Real implementation
  backend/server.py                # Add new endpoints
  backend/requirements.txt         # Add Linera SDK
```

---

### Phase 3: Frontend Integration (Days 5-6)
**Goal**: Connect UI to Linera chain

**Effort**: M (Medium)  
**Dependencies**: Phase 2 complete  
**Blockers**: Linera wallet SDK

#### Tasks:
1. **Linera Wallet Integration**
   - Research Linera wallet options
   - Integrate wallet connection
   - Update `WalletContext.js`
   - Handle transaction signing

2. **On-Chain Transaction UI**
   - Add transaction confirmation modals
   - Show gas estimates
   - Display transaction status
   - Handle errors gracefully

3. **Real-Time Chain Sync**
   - Subscribe to WebSocket for chain events
   - Update UI on `EventPublished`
   - Update UI on `MarketCreated`
   - Update UI on `BetPlaced`
   - Optimistic UI updates

4. **Market Trading Flow**
   - Update `MarketDetail.js` for on-chain betting
   - Show real-time odds from chain
   - Display user's on-chain positions
   - Show transaction history

#### Files Created/Modified:
```
NEW:
  frontend/src/context/
    LineraContext.js          # Linera wallet context
  frontend/src/hooks/
    useLineraWallet.js        # Wallet hook
    useMarketContract.js      # Market contract hook
    useOracleContract.js      # Oracle contract hook
  frontend/src/components/
    TransactionModal.jsx      # TX confirmation
    GasEstimate.jsx           # Gas display

MODIFIED:
  frontend/src/context/WalletContext.js  # Extend for Linera
  frontend/src/pages/MarketDetail.js     # On-chain betting
  frontend/src/pages/Markets.js          # Show chain data
  frontend/src/pages/CreateMarket.js     # Create on-chain
  frontend/package.json                  # Add Linera SDK
```

---

### Phase 4: Seed Data & Demo (Day 7)
**Goal**: Populate with realistic demo data

**Effort**: S (Small)  
**Dependencies**: Phase 3 complete  
**Blockers**: None

#### Tasks:
1. **Seed Data Generator**
   - Create 10-20 demo events (sports, crypto, politics)
   - Create 5-10 markets per event
   - Simulate 50-100 users
   - Simulate 200-500 bets
   - Verify events via AI agents

2. **Demo Script**
   - Automated demo flow
   - Create event → verify → create market → place bets → resolve
   - Run on testnet
   - Generate realistic activity

3. **Sample Data Documentation**
   - Document seed data structure
   - Provide reset script
   - Provide custom seed script

#### Files Created/Modified:
```
NEW:
  scripts/
    seed_data.py              # Seed generator
    demo_flow.py              # Automated demo
    reset_testnet.sh          # Reset script
  data/
    sample_events.json        # Sample events
    sample_markets.json       # Sample markets
    sample_users.json         # Sample users
```

---

### Phase 5: Security & Anti-Manipulation (Day 8)
**Goal**: Prevent abuse and manipulation

**Effort**: M (Medium)  
**Dependencies**: Phase 3 complete  
**Blockers**: None

#### Tasks:
1. **Rate Limiting**
   - API rate limiting (per IP, per wallet)
   - On-chain rate limiting (cooldown periods)
   - WebSocket connection limits

2. **Sybil Resistance**
   - Wallet verification (signature check)
   - Minimum stake requirement
   - Reputation system (optional)

3. **Oracle Manipulation Detection**
   - Multi-source verification
   - Confidence threshold enforcement
   - Manual review queue for low confidence
   - Audit trail for all oracle updates

4. **Market Manipulation Detection**
   - Wash trading detection (same wallet both sides)
   - Sudden volume spike alerts
   - Odds manipulation detection
   - Suspicious pattern flagging

5. **Audit Logging**
   - Log all transactions (on-chain + off-chain)
   - Log all API calls
   - Log all AI agent decisions
   - Immutable audit trail

#### Files Created/Modified:
```
NEW:
  backend/security/
    rate_limiter.py           # Rate limiting
    sybil_detector.py         # Sybil detection
    manipulation_detector.py  # Market manipulation
    audit_logger.py           # Audit logging
  backend/middleware/
    rate_limit_middleware.py  # FastAPI middleware

MODIFIED:
  backend/server.py           # Add security middleware
  contracts/market/src/lib.rs  # Add on-chain checks
```

---

### Phase 6: Monitoring & Metrics (Day 9)
**Goal**: Observability and telemetry

**Effort**: M (Medium)  
**Dependencies**: Phase 5 complete  
**Blockers**: None

#### Tasks:
1. **Prometheus Metrics**
   - API metrics (requests, latency, errors)
   - Chain metrics (TPS, gas usage, block time)
   - AI agent metrics (verification time, confidence)
   - Market metrics (volume, users, bets)

2. **Grafana Dashboards**
   - System overview dashboard
   - API performance dashboard
   - Chain activity dashboard
   - AI agent performance dashboard
   - Market analytics dashboard

3. **Error Tracking**
   - Integrate Sentry (or similar)
   - Track backend errors
   - Track frontend errors
   - Track contract errors
   - Alert on critical errors

4. **Performance Monitoring**
   - API response times
   - Database query times
   - Chain transaction times
   - WebSocket latency
   - Frontend render times

#### Files Created/Modified:
```
NEW:
  monitoring/
    prometheus.yml            # Prometheus config
    grafana/
      dashboards/
        system.json           # System dashboard
        api.json              # API dashboard
        chain.json            # Chain dashboard
        ai_agents.json        # AI dashboard
        markets.json          # Market dashboard
  backend/metrics/
    prometheus_metrics.py     # Metrics exporter
    performance_monitor.py    # Performance tracking

MODIFIED:
  backend/server.py           # Add metrics endpoints
  docker-compose.yml          # Add Prometheus + Grafana
```

---

### Phase 7: Testing & CI/CD (Day 10)
**Goal**: Automated testing and deployment

**Effort**: M (Medium)  
**Dependencies**: All phases complete  
**Blockers**: None

#### Tasks:
1. **Integration Tests**
   - Backend ↔ Linera tests
   - AI agents ↔ Oracle tests
   - API endpoint tests
   - WebSocket tests

2. **E2E Tests**
   - Full user flow tests
   - Market creation → betting → resolution
   - Event verification flow
   - Wallet connection tests

3. **Load Testing**
   - Concurrent user simulation (100+ users)
   - High-volume betting simulation
   - API stress testing
   - Chain stress testing

4. **GitHub Actions CI/CD**
   - Automated testing on PR
   - Automated contract deployment
   - Automated backend deployment
   - Automated frontend deployment
   - Environment-specific configs

5. **Docker Compose**
   - Full stack in Docker
   - Backend + Frontend + MongoDB + Prometheus + Grafana
   - One-command startup
   - Development and production configs

#### Files Created/Modified:
```
NEW:
  tests/
    integration/
      test_linera_integration.py
      test_oracle_integration.py
      test_market_integration.py
    e2e/
      test_user_flow.py
      test_market_flow.py
    load/
      locustfile.py           # Load testing
  .github/
    workflows/
      test.yml                # Test workflow
      deploy_contracts.yml    # Contract deployment
      deploy_backend.yml      # Backend deployment
      deploy_frontend.yml     # Frontend deployment
  docker-compose.yml          # Full stack
  docker-compose.prod.yml     # Production
  Dockerfile.backend          # Backend image
  Dockerfile.frontend         # Frontend image

MODIFIED:
  backend/requirements.txt    # Add test dependencies
  frontend/package.json       # Add test dependencies
```

---

## 📋 4. Detailed File Checklist

### Phase 1: Linera Foundation
- [ ] `contracts/oracle_feed/src/lib.rs`
- [ ] `contracts/oracle_feed/Cargo.toml`
- [ ] `contracts/market/src/lib.rs`
- [ ] `contracts/market/Cargo.toml`
- [ ] `contracts/Cargo.toml`
- [ ] `scripts/deploy_contracts.sh`
- [ ] `scripts/setup_testnet.sh`
- [ ] `.env.linera`
- [ ] `backend/.env` (update)

### Phase 2: Backend Integration
- [ ] `backend/linera/client.py`
- [ ] `backend/linera/contracts.py`
- [ ] `backend/linera/events.py`
- [ ] `backend/services/market_service.py`
- [ ] `backend/services/oracle_service.py`
- [ ] `backend/oracle/linera_oracle.py` (update)
- [ ] `backend/server.py` (update)
- [ ] `backend/requirements.txt` (update)

### Phase 3: Frontend Integration
- [ ] `frontend/src/context/LineraContext.js`
- [ ] `frontend/src/hooks/useLineraWallet.js`
- [ ] `frontend/src/hooks/useMarketContract.js`
- [ ] `frontend/src/hooks/useOracleContract.js`
- [ ] `frontend/src/components/TransactionModal.jsx`
- [ ] `frontend/src/components/GasEstimate.jsx`
- [ ] `frontend/src/context/WalletContext.js` (update)
- [ ] `frontend/src/pages/MarketDetail.js` (update)
- [ ] `frontend/src/pages/Markets.js` (update)
- [ ] `frontend/src/pages/CreateMarket.js` (update)
- [ ] `frontend/package.json` (update)

### Phase 4: Seed Data & Demo
- [ ] `scripts/seed_data.py`
- [ ] `scripts/demo_flow.py`
- [ ] `scripts/reset_testnet.sh`
- [ ] `data/sample_events.json`
- [ ] `data/sample_markets.json`
- [ ] `data/sample_users.json`

### Phase 5: Security & Anti-Manipulation
- [ ] `backend/security/rate_limiter.py`
- [ ] `backend/security/sybil_detector.py`
- [ ] `backend/security/manipulation_detector.py`
- [ ] `backend/security/audit_logger.py`
- [ ] `backend/middleware/rate_limit_middleware.py`
- [ ] `backend/server.py` (update)
- [ ] `contracts/market/src/lib.rs` (update)

### Phase 6: Monitoring & Metrics
- [ ] `monitoring/prometheus.yml`
- [ ] `monitoring/grafana/dashboards/system.json`
- [ ] `monitoring/grafana/dashboards/api.json`
- [ ] `monitoring/grafana/dashboards/chain.json`
- [ ] `monitoring/grafana/dashboards/ai_agents.json`
- [ ] `monitoring/grafana/dashboards/markets.json`
- [ ] `backend/metrics/prometheus_metrics.py`
- [ ] `backend/metrics/performance_monitor.py`
- [ ] `backend/server.py` (update)
- [ ] `docker-compose.yml` (update)

### Phase 7: Testing & CI/CD
- [ ] `tests/integration/test_linera_integration.py`
- [ ] `tests/integration/test_oracle_integration.py`
- [ ] `tests/integration/test_market_integration.py`
- [ ] `tests/e2e/test_user_flow.py`
- [ ] `tests/e2e/test_market_flow.py`
- [ ] `tests/load/locustfile.py`
- [ ] `.github/workflows/test.yml`
- [ ] `.github/workflows/deploy_contracts.yml`
- [ ] `.github/workflows/deploy_backend.yml`
- [ ] `.github/workflows/deploy_frontend.yml`
- [ ] `docker-compose.yml`
- [ ] `docker-compose.prod.yml`
- [ ] `Dockerfile.backend`
- [ ] `Dockerfile.frontend`
- [ ] `backend/requirements.txt` (update)
- [ ] `frontend/package.json` (update)

---

## 📊 5. Effort Summary

| Phase | Days | Effort | Files | Priority |
|-------|------|--------|-------|----------|
| 1. Linera Foundation | 2 | L | 9 | CRITICAL |
| 2. Backend Integration | 2 | M | 8 | CRITICAL |
| 3. Frontend Integration | 2 | M | 11 | HIGH |
| 4. Seed Data & Demo | 1 | S | 6 | MEDIUM |
| 5. Security & Anti-Manipulation | 1 | M | 7 | HIGH |
| 6. Monitoring & Metrics | 1 | M | 10 | MEDIUM |
| 7. Testing & CI/CD | 1 | M | 17 | HIGH |
| **TOTAL** | **10** | - | **68** | - |

**Effort Legend:**
- S (Small): 2-4 hours
- M (Medium): 4-8 hours
- L (Large): 8-16 hours

---

## 🔗 6. Dependencies Graph

```
Phase 1 (Linera Foundation)
    ↓
Phase 2 (Backend Integration)
    ↓
Phase 3 (Frontend Integration)
    ↓
    ├─→ Phase 4 (Seed Data)
    ├─→ Phase 5 (Security)
    └─→ Phase 6 (Monitoring)
            ↓
        Phase 7 (Testing & CI/CD)
```

**Critical Path**: Phase 1 → 2 → 3 → 7 (7 days minimum)  
**Parallel Work**: Phases 4, 5, 6 can run in parallel after Phase 3

---

## 🎯 7. Success Criteria

### MVP Launch Checklist
- [ ] OracleFeed contract deployed and functional
- [ ] Market contract deployed and functional
- [ ] Backend connected to Linera chain
- [ ] Frontend can create markets on-chain
- [ ] Users can place bets on-chain
- [ ] Markets resolve based on oracle feed
- [ ] Winners can claim rewards
- [ ] Real-time updates via WebSocket
- [ ] Seed data populated (10+ markets)
- [ ] Rate limiting active
- [ ] Monitoring dashboards live
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Documentation complete

### Performance Targets
- API response time: < 200ms (p95)
- Chain transaction time: < 5s
- WebSocket latency: < 100ms
- AI verification time: < 30s
- Support 100+ concurrent users

### Security Targets
- No critical vulnerabilities
- Rate limiting: 100 req/min per IP
- Oracle confidence threshold: ≥ 0.7
- Audit logging: 100% coverage
- Sybil detection: Active

---

## 📚 8. Documentation Deliverables

- [ ] `ARCHITECTURE.md` - System architecture
- [ ] `CONTRACTS.md` - Smart contract documentation
- [ ] `API.md` - API documentation (OpenAPI)
- [ ] `DEPLOYMENT.md` - Deployment guide
- [ ] `INTEGRATION.md` - Integration guide
- [ ] `SECURITY.md` - Security best practices
- [ ] `MONITORING.md` - Monitoring guide
- [ ] `TESTING.md` - Testing guide

---

## 🚨 9. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Linera SDK issues | HIGH | MEDIUM | Use GraphQL fallback, community support |
| Contract bugs | HIGH | MEDIUM | Extensive testing, audit before mainnet |
| Performance bottlenecks | MEDIUM | MEDIUM | Load testing, optimization, caching |
| Oracle manipulation | HIGH | LOW | Multi-source verification, confidence threshold |
| Market manipulation | MEDIUM | MEDIUM | Detection algorithms, rate limiting |
| Deployment issues | MEDIUM | LOW | Staging environment, rollback plan |

---

## 📞 10. Next Steps

1. **Review this plan** with team
2. **Setup Linera environment** (Day 1 morning)
3. **Start Phase 1** (Linera Foundation)
4. **Daily standups** to track progress
5. **Adjust timeline** based on blockers

---

**Status**: 📋 READY TO START  
**Target Launch**: Day 10  
**Confidence**: 🟢 HIGH (with current architecture foundation)

---

*Last Updated: 2025-01-27*  
*Version: 1.0*
