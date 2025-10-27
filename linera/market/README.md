# Market Contract

YES/NO prediction market with AMM pricing and anti-manipulation.

## 📋 ABI

### Operations

#### CreateMarket
```rust
Operation::CreateMarket {
    event_id: String,
    description: String,
    cutoff_ts: u64,         // Unix timestamp (ms)
}
```

#### Stake
```rust
Operation::Stake {
    event_id: String,
    side: String,           // "YES" or "NO"
    amount: u128,           // Min: 1000
}
```

**Validation**:
- Amount ≥ 1000 (MIN_STAKE)
- Current time < cutoff_ts
- Market not resolved
- Price velocity < 0.15 per stake
- Cooldown: 5000ms after large price moves

#### Resolve
```rust
Operation::Resolve {
    event_id: String,
    outcome: String,        // "YES" or "NO"
}
```

### Queries

#### Get Market
```
market:{event_id}
```

**Response**:
```json
{
  "event_id": "btc-halving-2024",
  "description": "Will BTC halving happen in 2024?",
  "cutoff_ts": 1735689600000,
  "resolved": false,
  "outcome": null,
  "pool_yes": 6000,
  "pool_no": 4000,
  "last_price_update_ms": 1234567890
}
```

#### Get Odds
```
odds:{event_id}
```

**Response**:
```json
{
  "yes_price": 0.6,
  "no_price": 0.4
}
```

#### List Markets
```
markets:{offset},{limit}
```

## 🎯 AMM Pricing

### Constant Product Formula
```
yes_price = pool_yes / (pool_yes + pool_no)
no_price = pool_no / (pool_yes + pool_no)
```

### Examples

| Pool YES | Pool NO | YES Price | NO Price |
|----------|---------|-----------|----------|
| 5000 | 5000 | 0.50 | 0.50 |
| 6000 | 4000 | 0.60 | 0.40 |
| 7000 | 3000 | 0.70 | 0.30 |
| 9000 | 1000 | 0.90 | 0.10 |

## 🛡️ Anti-Manipulation

### 1. Price Velocity Cap
**Limit**: Max price change of 0.15 per stake

**Example**:
- Current: YES 0.50, NO 0.50
- ✅ Allowed: YES 0.60, NO 0.40 (delta = 0.10)
- ❌ Blocked: YES 0.70, NO 0.30 (delta = 0.20 > 0.15)

### 2. Cooldown Period
**Duration**: 5000ms (5 seconds)

After a stake that causes significant price movement, subsequent stakes must wait 5 seconds.

### 3. Minimum Stake
**Amount**: 1000 units

Prevents spam attacks with tiny stakes.

### 4. Cutoff Timestamp
No stakes allowed after cutoff time.

### 5. Resolution Lock
No stakes allowed after market is resolved.

## 🔐 Security

- **Cutoff enforcement**: Prevents late manipulation
- **Velocity cap**: Limits price manipulation
- **Cooldown**: Rate limiting for large moves
- **Min stake**: Prevents spam
- **Immutable resolution**: Cannot change outcome

## 🧪 Tests

### Unit Tests (9 tests)
```bash
cargo test
```

**Tests**:
- ✅ Odds calculation (equal, empty, extreme)
- ✅ Price velocity (within/exceeded)
- ✅ Cooldown check
- ✅ Min stake validation
- ✅ Serialization

### Integration Tests (13 tests)
```bash
cargo test --test integration
```

**Tests**:
- ✅ Create market operation
- ✅ Stake YES/NO operations
- ✅ Resolve operation
- ✅ Two-sided stakes
- ✅ Velocity limit enforcement
- ✅ Cutoff validation
- ✅ Resolution flow
- ✅ Cooldown period
- ✅ Odds extreme ratios

## 📊 GraphQL Schema

```graphql
type MarketState {
  event_id: String!
  description: String!
  cutoff_ts: Int!
  resolved: Boolean!
  outcome: String
  pool_yes: Int!
  pool_no: Int!
  last_price_update_ms: Int!
}

type Odds {
  yes_price: Float!
  no_price: Float!
}

type Query {
  market(event_id: String!): MarketState
  odds(event_id: String!): Odds
  markets(offset: Int, limit: Int): [MarketState!]!
}

type Mutation {
  createMarket(
    event_id: String!
    description: String!
    cutoff_ts: Int!
  ): String!
  
  stake(
    event_id: String!
    side: String!
    amount: Int!
  ): String!
  
  resolve(
    event_id: String!
    outcome: String!
  ): String!
}
```

## 🚀 Usage Example

### Create Market
```rust
let op = Operation::CreateMarket {
    event_id: "btc-halving-2024".to_string(),
    description: "Will BTC halving happen in 2024?".to_string(),
    cutoff_ts: 1735689600000, // 2025-01-01
};
```

### Stake YES
```rust
let op = Operation::Stake {
    event_id: "btc-halving-2024".to_string(),
    side: "YES".to_string(),
    amount: 5000,
};
```

### Stake NO
```rust
let op = Operation::Stake {
    event_id: "btc-halving-2024".to_string(),
    side: "NO".to_string(),
    amount: 3000,
};
```

### Resolve Market
```rust
let op = Operation::Resolve {
    event_id: "btc-halving-2024".to_string(),
    outcome: "YES".to_string(),
};
```

### Query Odds
```bash
linera query-application <chain-id> <app-id> "odds:btc-halving-2024"
```

## 📈 Price Movement Example

```
Initial: YES 0.50, NO 0.50 (5000/5000)

Stake 1: +2000 YES
Result: YES 0.58, NO 0.42 (7000/5000)
Delta: 0.08 ✅ Allowed

Stake 2: +3000 YES (after cooldown)
Result: YES 0.67, NO 0.33 (10000/5000)
Delta: 0.09 ✅ Allowed

Stake 3: +5000 YES (immediate)
Result: YES 0.75, NO 0.25 (15000/5000)
Delta: 0.08 ✅ Allowed

Stake 4: +10000 YES (immediate)
Result: YES 0.83, NO 0.17 (25000/5000)
Delta: 0.08 ✅ Allowed

Large Stake: +20000 YES
Result: YES 0.90, NO 0.10 (45000/5000)
Delta: 0.07 ✅ Allowed
Cooldown: 5000ms activated
```

## 🔗 Integration

### Backend Integration
```python
from linera_client import LineraClient

client = LineraClient()

# Create market
tx = client.execute_operation(
    chain_id="...",
    app_id="...",
    operation={
        "CreateMarket": {
            "event_id": "btc-halving-2024",
            "description": "Will BTC halving happen in 2024?",
            "cutoff_ts": 1735689600000
        }
    }
)

# Stake YES
tx = client.execute_operation(
    chain_id="...",
    app_id="...",
    operation={
        "Stake": {
            "event_id": "btc-halving-2024",
            "side": "YES",
            "amount": 5000
        }
    }
)

# Get odds
odds = client.query(
    chain_id="...",
    app_id="...",
    query="odds:btc-halving-2024"
)
print(f"YES: {odds['yes_price']}, NO: {odds['no_price']}")
```

## 📝 Constants

```rust
const MAX_PRICE_DELTA: f64 = 0.15;    // 15% max price change
const COOLDOWN_MS: u64 = 5000;        // 5 second cooldown
const MIN_STAKE: u128 = 1000;         // Minimum stake amount
```

## 🔄 Future Enhancements

- [ ] Multi-outcome markets (>2 options)
- [ ] Liquidity provider rewards
- [ ] Dynamic velocity caps based on liquidity
- [ ] Partial fills for large orders
- [ ] Market maker incentives
- [ ] Slippage protection
