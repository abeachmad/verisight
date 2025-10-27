<!-- BEGIN KETTY:ONCHAIN_DOC v1 -->
# ONCHAIN: Verisight on Linera

## Arsitektur Ringkas
- **Microchains** per event.
- **Contract** (WRITE, metered) vs **Service** (READ, GraphQL).
- **Views**: RegisterView, MapView, (ops) QueueView.

## OracleFeed ABI
**Operation**: `PublishEvent { event_id, payload_hash, confidence, sources[], cid }`  
**Query**: `event(event_id)`, `events(limit, cursor)`

**Contoh GraphQL**
```graphql
# POST: ${ORACLEFEED_SERVICE_URL}/graphql
query GetEvent($id: String!) {
  event(event_id: $id) { event_id confidence cid created_at }
}
```

## Market ABI
**Operation**: `CreateMarket { event_id, cutoff_ts }`, `Stake { event_id, side, amount }`, `Resolve { event_id, outcome }`  
**Query**: `odds(event_id)`, `market(event_id)`, `markets(limit, cursor)`

**Contoh GraphQL**
```graphql
# POST: ${MARKET_SERVICE_URL}/graphql
query Odds($id: String!) { odds(event_id: $id) { yes no last_update } }
```

## Anti-Manipulasi
Velocity cap (maxStakePerWindow dalam windowSec) & cooldown per actor. Pelanggaran → 429.

## APP_ID & Endpoint
Variabel di .env backend/ops:
- `ORACLEFEED_APP_ID`, `MARKET_APP_ID`
- `ORACLEFEED_SERVICE_URL`, `MARKET_SERVICE_URL`

<!-- END KETTY:ONCHAIN_DOC v1 -->

---

## Arsitektur Ringkas (Detail)
- **Microchains**: isolasi state per event → paralel & aman dari kontensi.
- **Contract (WRITE, metered)**: operasi yang memutasi state.
- **Service (READ, unmetered)**: GraphQL untuk UI/klien.
- **Views**: RegisterView, MapView, (opsional) QueueView.

## OracleFeed ABI
**Operations**
- `PublishEvent { event_id, payload_hash, confidence, sources[], cid }`

**Queries**
- `event(event_id) -> Event`
- `events(limit, cursor) -> [Event]`

**Contoh query (GraphQL)**
```graphql
# POST: ${ORACLEFEED_SERVICE_URL}/graphql
query GetEvent($id: String!) {
  event(event_id: $id) { event_id confidence cid created_at }
}
```

## Market ABI
**Operations**
- `CreateMarket { event_id, cutoff_ts }`
- `Stake { event_id, side, amount }`
- `Resolve { event_id, outcome }`

**Queries**
- `odds(event_id) -> Odds { yes, no }`
- `market(event_id) -> Market`
- `markets(limit, cursor) -> [Market]`

**Contoh query (GraphQL)**
```graphql
# POST: ${MARKET_SERVICE_URL}/graphql
query GetOdds($id: String!) {
  odds(event_id: $id) { yes_price no_price }
}
```

---

# On-Chain Architecture - Linera Smart Contracts (Detailed)

## Overview

Verisight uses **two Linera smart contracts** to provide decentralized oracle and prediction market functionality:

1. **OracleFeed** - AI-verified event oracle
2. **Market** - YES/NO prediction markets with AMM pricing

Both contracts follow Linera's **microchain architecture** for parallelism, security, and scalability.

---

## Contract Architecture

### Linera Microchain Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Linera Microchain                        │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │  OracleFeed  │         │    Market    │                │
│  │   Contract   │────────▶│   Contract   │                │
│  │              │         │              │                │
│  │  (WRITE)     │         │  (WRITE)     │                │
│  └──────────────┘         └──────────────┘                │
│         │                        │                         │
│         ▼                        ▼                         │
│  ┌──────────────┐         ┌──────────────┐                │
│  │  OracleFeed  │         │    Market    │                │
│  │   Service    │         │   Service    │                │
│  │              │         │              │                │
│  │  (READ)      │         │  (READ)      │                │
│  └──────────────┘         └──────────────┘                │
│         │                        │                         │
│         └────────────┬───────────┘                         │
│                      ▼                                     │
│              ┌──────────────┐                              │
│              │   GraphQL    │                              │
│              │   Endpoint   │                              │
│              └──────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

- **Contract (WRITE path)**: Metered operations that mutate state
- **Service (READ path)**: Unmetered GraphQL queries
- **Views**: Persistent data structures (RegisterView, MapView, QueueView)
- **Microchain isolation**: Each event/market can run in parallel

---

## OracleFeed Contract

### Purpose
Store AI-verified event data on-chain with cryptographic proof.

### State (Linera Views)

```rust
//! ONCHAIN: OracleFeed State (Linera Views)
//! - Microchain scope: isolasi state per event untuk paralelisme & keamanan.
//! - Views:
//!   * RegisterView: simpan metadata event (event_id, payload_hash, confidence, sources, cid, created_at).
//!   * MapView: indeks event_id -> EventState untuk query cepat.
//!   * (Opsional) QueueView: audit/event feed.
```

**Data Structure:**
```rust
pub struct EventRecord {
    pub event_id: String,        // Unique identifier
    pub payload_hash: String,     // SHA256 of event data
    pub confidence: f32,          // AI confidence (0.0-1.0)
    pub sources: Vec<String>,     // Verification sources
    pub cid: Option<String>,      // IPFS content ID
    pub block_height: u64,        // Block number
    pub timestamp_ms: u64,        // Unix timestamp
    pub tx_hash: String,          // Transaction hash
}
```

### ABI Operations (WRITE)

**PublishEvent**
```rust
Operation::PublishEvent {
    event_id: String,
    payload_hash: String,
    confidence: f32,      // Must be 0.0-1.0
    sources: Vec<String>, // Must have ≥1 source
    cid: Option<String>,
}
```

**Validation Rules:**
- `confidence` must be between 0.0 and 1.0
- `sources` must contain at least 1 source
- `event_id` must be unique
- `payload_hash` must be valid SHA256

**Responsibilities:**
- Validate input parameters
- Mutate state (add event to MapView)
- Emit event logs
- Update block height and timestamp

### ABI Queries (READ)

**GetEvent**
```graphql
query {
  event(eventId: "btc_100k_eoy_2024") {
    eventId
    payloadHash
    confidence
    sources
    cid
    blockHeight
    timestampMs
    txHash
  }
}
```

**ListEvents**
```graphql
query {
  events(offset: 0, limit: 10) {
    eventId
    confidence
    timestampMs
  }
}
```

---

## Market Contract

### Purpose
Decentralized YES/NO prediction markets with AMM pricing and anti-manipulation.

### State (Linera Views)

```rust
//! ONCHAIN: Market State (Linera Views)
//! - MapView: event_id -> MarketState (yes/no pool, cutoff_ts, resolved, dll.)
//! - RegisterView: konfigurasi global (mis. parameter anti-manipulasi).
//! Anti-manipulasi: velocity cap & cooldown dicatat per event/actor.
```

**Data Structure:**
```rust
pub struct MarketState {
    pub event_id: String,
    pub description: String,
    pub cutoff_ts: u64,           // Trading deadline
    pub resolved: bool,
    pub outcome: Option<String>,  // "yes" or "no"
    pub pool_yes: u128,           // YES pool size
    pub pool_no: u128,            // NO pool size
    pub last_price_update_ms: u64,
}
```

### AMM Pricing (Constant Product)

**Odds Calculation:**
```rust
yes_price = pool_yes / (pool_yes + pool_no)
no_price = pool_no / (pool_yes + pool_no)
```

**Example:**
- Pool: 6000 YES, 4000 NO
- YES odds: 6000 / 10000 = 0.6 (60%)
- NO odds: 4000 / 10000 = 0.4 (40%)

### Anti-Manipulation Mechanisms

**1. Price Velocity Cap**
```rust
const MAX_PRICE_DELTA: f64 = 0.15; // 15% max price change per stake
```
- Prevents single large stakes from manipulating odds
- Rejects stakes that would move price >15%

**2. Cooldown Period**
```rust
const COOLDOWN_MS: u64 = 5000; // 5 seconds between price updates
```
- Rate limits rapid trading
- Prevents flash loan attacks

**3. Minimum Stake**
```rust
const MIN_STAKE: u128 = 1000; // Minimum stake amount
```
- Prevents spam with tiny stakes

### ABI Operations (WRITE)

**CreateMarket**
```rust
Operation::CreateMarket {
    event_id: String,
    description: String,
    cutoff_ts: u64,  // Unix timestamp
}
```

**Validation:**
- `cutoff_ts` must be in the future
- `event_id` must exist in OracleFeed
- Market must not already exist

**Stake**
```rust
Operation::Stake {
    event_id: String,
    side: String,     // "yes" or "no"
    amount: u128,
}
```

**Validation:**
- Market must be active (not resolved)
- Current time < cutoff_ts
- Amount ≥ MIN_STAKE
- Price velocity check passes
- Cooldown check passes

**Resolve**
```rust
Operation::Resolve {
    event_id: String,
    outcome: String,  // "yes" or "no"
}
```

**Validation:**
- Current time ≥ cutoff_ts
- Market not already resolved
- Outcome must be "yes" or "no"

### ABI Queries (READ)

**GetOdds**
```graphql
query {
  odds(eventId: "btc_100k_eoy_2024") {
    yesPrice
    noPrice
  }
}
```

**GetMarket**
```graphql
query {
  market(eventId: "btc_100k_eoy_2024") {
    eventId
    description
    cutoffTs
    resolved
    outcome
    poolYes
    poolNo
  }
}
```

**ListMarkets**
```graphql
query {
  markets(offset: 0, limit: 10) {
    eventId
    description
    resolved
  }
}
```

---

## Integration Flow

### 1. Event Verification → Oracle

```
Backend AI Agents
    ↓
Calculate payload_hash (SHA256)
    ↓
Upload summary to IPFS → CID
    ↓
OracleFeed.PublishEvent(event_id, payload_hash, confidence, sources, cid)
    ↓
Event stored on-chain with tx_hash
```

### 2. Market Creation

```
User/Backend
    ↓
Market.CreateMarket(event_id, description, cutoff_ts)
    ↓
Market initialized with empty pools
```

### 3. Trading

```
User stakes 1000 on YES
    ↓
Market.Stake(event_id, "yes", 1000)
    ↓
Check: cutoff not passed ✓
Check: velocity cap ✓
Check: cooldown ✓
    ↓
Update pool_yes += 1000
Update last_price_update_ms
    ↓
New odds calculated automatically
```

### 4. Resolution

```
Cutoff time reached
    ↓
Oracle verifies outcome
    ↓
Market.Resolve(event_id, "yes")
    ↓
Market marked as resolved
Payouts calculated
```

---

## Security Considerations

### OracleFeed
- **Immutability**: Events cannot be modified after publishing
- **Cryptographic proof**: payload_hash ensures data integrity
- **Source verification**: Multiple sources required for high confidence
- **IPFS backup**: Full event data stored off-chain but verifiable

### Market
- **Time-based cutoff**: No trading after deadline
- **Anti-manipulation**: Velocity cap + cooldown prevent price manipulation
- **Constant product AMM**: Fair pricing based on pool ratios
- **Resolution finality**: Outcome cannot be changed after resolution

---

## Performance Characteristics

### Microchain Benefits
- **Parallel execution**: Each event/market runs independently
- **Scalability**: No global state bottlenecks
- **Low latency**: Local state access

### Gas Costs (Metered Operations)
- **PublishEvent**: ~50k gas (state write + validation)
- **CreateMarket**: ~30k gas (state initialization)
- **Stake**: ~40k gas (state update + checks)
- **Resolve**: ~20k gas (state update)

### Query Performance (Unmetered)
- **GetEvent**: O(1) - MapView lookup
- **GetOdds**: O(1) - Calculation from state
- **ListEvents**: O(n) - Paginated scan

---

## Testing

### Unit Tests
```bash
cd linera
cargo test
```

**Coverage:**
- Confidence validation (0.0-1.0)
- Source validation (≥1 required)
- Odds calculation (constant product)
- Velocity cap enforcement
- Cooldown enforcement

### Integration Tests
```bash
cargo test --test integration
```

**Scenarios:**
- Full event lifecycle (publish → query)
- Market lifecycle (create → stake → resolve)
- Anti-manipulation edge cases
- Concurrent operations

---

## Deployment

### Build WASM
```bash
cd linera
./scripts/build_linera.sh  # or .bat on Windows
```

### Publish to Testnet
```bash
bash scripts/testnet_publish.sh
```

**Output:**
- OracleFeed APP_ID
- Market APP_ID
- Updated `.env` files

### Verify Deployment
```bash
linera wallet show

curl -X POST https://rpc.testnet.linera.net/chains/<chain-id>/applications/<app-id> \
  -H 'Content-Type: application/json' \
  -d '{"query": "{ markets(offset: 0, limit: 10) }"}'
```

---

## Future Enhancements

### OracleFeed
- [ ] Multi-signature verification
- [ ] Reputation system for sources
- [ ] Event dispute mechanism
- [ ] Historical event archive (QueueView)

### Market
- [ ] Multi-outcome markets (>2 options)
- [ ] Liquidity provider rewards
- [ ] Advanced AMM curves (e.g., logarithmic)
- [ ] Cross-chain market aggregation

---

## References

- [Linera Documentation](https://linera.dev)
- [Linera SDK](https://docs.rs/linera-sdk)
- [GraphQL Specification](https://graphql.org)
- [IPFS Documentation](https://docs.ipfs.tech)

---

**Built with ❤️ on Linera L1**
