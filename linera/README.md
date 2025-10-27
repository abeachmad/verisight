# Linera Smart Contracts

Verisight on-chain components for Linera L1 blockchain.

## 📦 Contracts

### 1. OracleFeed (`oracle_feed/`)
AI-verified event oracle that publishes verified events on-chain.

**Features**:
- Publish verified events with confidence scores
- Query events by ID
- List recent events
- Immutable event storage

**Operations**:
- `PublishEvent` - Store AI-verified event on-chain
- `GetEvent` - Query event by ID
- `ListEvents` - Get paginated list of events

### 2. Market (`market/`)
Prediction market with AMM pricing and betting.

**Features**:
- Create prediction markets linked to oracle events
- Place bets on market options
- Automatic market resolution based on oracle
- Proportional payout distribution

**Operations**:
- `CreateMarket` - Create new prediction market
- `PlaceBet` - Bet on market option
- `ResolveMarket` - Resolve market with winning option
- `ClaimWinnings` - Claim winnings after resolution

## 🔧 Prerequisites

1. **Rust** (1.70+)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **wasm32 target**
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

3. **Linera CLI** (optional, for deployment)
   ```bash
   cargo install linera-service
   ```

## 🚀 Build

### Linux/macOS
```bash
cd linera
chmod +x scripts/build_linera.sh
./scripts/build_linera.sh
```

### Windows
```cmd
cd linera
scripts\build_linera.bat
```

### Manual Build
```bash
cd linera

# Build oracle_feed
cargo build --release --target wasm32-unknown-unknown -p oracle_feed

# Build market
cargo build --release --target wasm32-unknown-unknown -p market
```

## 📁 Output

WASM files will be generated at:
```
linera/target/wasm32-unknown-unknown/release/
├── oracle_feed.wasm
└── market.wasm
```

## 🧪 Test

```bash
cd linera
cargo test
```

## 📊 Contract Sizes

Optimized for minimal WASM size:
- `opt-level = "z"` - Optimize for size
- `lto = true` - Link-time optimization
- `codegen-units = 1` - Single codegen unit
- `strip = true` - Strip debug symbols

Expected sizes: ~50-100KB per contract

## 🔗 Integration

### Backend Integration
See `backend/linera/` for Python client integration.

### Deployment
See `scripts/deploy_contracts.sh` for deployment to Linera testnet.

## 📚 Documentation

- [Linera SDK Docs](https://docs.linera.io/)
- [Rust WASM Book](https://rustwasm.github.io/docs/book/)

## 🛠️ Development

### Project Structure
```
linera/
├── Cargo.toml              # Workspace config
├── oracle_feed/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs          # OracleFeed contract
├── market/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs          # Market contract
└── scripts/
    ├── build_linera.sh     # Build script (Unix)
    └── build_linera.bat    # Build script (Windows)
```

### Adding Dependencies
Edit `linera/Cargo.toml` workspace dependencies:
```toml
[workspace.dependencies]
your-crate = "1.0"
```

Then use in contract:
```toml
[dependencies]
your-crate.workspace = true
```

## ⚠️ Notes

- Contracts use `linera-sdk` 0.11
- Target: `wasm32-unknown-unknown`
- Optimized for production deployment
- No `std` library (no_std compatible)

## 🔐 Security

- All operations require authenticated signer
- Confidence threshold validation (0.0-1.0)
- Market status checks prevent invalid operations
- Immutable event storage

## 📝 License

MIT
