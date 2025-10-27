# Changelog

All notable changes to Verisight will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

<!-- BEGIN KETTY:CHANGELOG WAVE01 v1 -->
## Wave 01 — 2025-01-28

### Added
- StatusBar: URL testnet, blockHeight(5s), latency, status badge (a11y)
- MarketDetail: CID/IPFS link, tx_hash (copy), chain_id; odds polling(3s); stake disabled (cutoff/resolved); toast cooldown
- Events page: list oracle events + status badges
- **Linera Smart Contracts**:
  - OracleFeed contract: PublishEvent operation, event()/events() queries
  - Market contract: CreateMarket/Stake/Resolve operations, odds()/market()/markets() queries
  - Anti-manipulation: Price velocity cap (15%), cooldown period (5s), minimum stake (1000)
- **Backend Integration**:
  - Linera client with retry logic and exponential backoff
  - IPFS client for uploading event summaries
  - Health endpoint with mongo/ipfs/linera status checks
  - On-chain data storage (tx_hash, chain_id, cid) in MongoDB
- **Testing**: 29 unit tests (Rust), 15 integration tests (Python), E2E test suite

### Changed
- **Environment Configuration**: 
  - Added `REACT_APP_LINERA_TESTNET_SERVICE_URL` for public RPC endpoint
  - Added `REACT_APP_IPFS_GATEWAY_URL` for public IPFS gateway
  - Removed sensitive APP_IDs from frontend env (fetched from backend at runtime)
- **Security Improvements**:
  - Abort controllers for all polling requests
  - Exponential backoff for health check retries
  - External links use `rel="noopener noreferrer"`
  - Copy-to-clipboard for TX hashes

### Fixed
- Polling cleanup on route change/unmount to prevent memory leaks
- Accessibility improvements: aria-labels, screen reader text, status indicators
- IPFS client error handling for missing CID responses

### Docs
- ONCHAIN.md, SUBMISSION.md, SECURITY_CHECKLIST.md

### Testnet
- OracleFeed APP_ID=${ORACLEFEED_APP_ID}
- Market APP_ID=${MARKET_APP_ID}
<!-- END KETTY:CHANGELOG WAVE01 v1 -->

---

## [Unreleased]

### Planned
- Multi-outcome markets (>2 options)
- Liquidity provider rewards
- Advanced AMM curves (logarithmic)
- Mobile app (React Native)
- Social features (comments, discussions)
- NFT rewards for top traders

---

## Release Notes

### How to Tag a Wave

```bash
# Create and push a wave tag
git tag wave-01
git push origin wave-01

# This triggers automatic GitHub Release creation
```

### Deployment Verification

After tagging, verify deployment:

```bash
# Check wallet
linera wallet show

# Query markets
curl -X POST https://rpc.testnet.linera.net/chains/<chain-id>/applications/<market-app-id> \
  -H 'Content-Type: application/json' \
  -d '{"query": "{ markets(offset: 0, limit: 10) }"}'
```

---

**Built with ❤️ on Linera L1**
