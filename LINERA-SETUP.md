# 🚀 Linera Contracts Setup Guide

## ✅ What's Been Created

### 📁 Structure
```
linera/
├── Cargo.toml                    # Workspace config
├── rust-toolchain.toml           # Auto-install wasm32 target
├── .gitignore
├── README.md                     # Full documentation
├── oracle_feed/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs                # OracleFeed contract (185 lines)
├── market/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs                # Market contract (280 lines)
└── scripts/
    ├── build_linera.sh           # Unix build script
    └── build_linera.bat          # Windows build script

.github/workflows/
└── linera-ci.yml                 # CI/CD for contracts
```

## 🎯 Contracts Overview

### 1. OracleFeed Contract
**Purpose**: Store AI-verified events on-chain

**Features**:
- ✅ Publish verified events with confidence scores
- ✅ Query events by ID
- ✅ List recent events (paginated)
- ✅ Immutable storage
- ✅ Authenticated publisher only

**State**:
```rust
struct VerifiedEvent {
    event_id: String,
    title: String,
    description: String,
    result: String,
    confidence: f64,        // 0.0 - 1.0
    proof_links: Vec<String>,
    reasoning: String,
    timestamp: Timestamp,
    publisher: Owner,
}
```

**Operations**:
- `PublishEvent` - Store event on-chain
- `GetEvent` - Query by ID
- `ListEvents` - Get recent events

### 2. Market Contract
**Purpose**: Prediction market with AMM pricing

**Features**:
- ✅ Create markets linked to oracle events
- ✅ Place bets on options (Yes/No or multiple)
- ✅ Automatic resolution based on oracle
- ✅ Proportional payout distribution
- ✅ AMM pricing (constant product)

**State**:
```rust
struct Market {
    id: String,
    event_id: String,
    title: String,
    options: Vec<MarketOption>,
    bets: Vec<Bet>,
    total_pool: Amount,
    status: MarketStatus,    // Active/Closed/Resolved
    resolution: Option<String>,
}
```

**Operations**:
- `CreateMarket` - Create new market
- `PlaceBet` - Bet on option
- `ResolveMarket` - Resolve with winning option
- `ClaimWinnings` - Claim rewards

## 🔧 Prerequisites

### 1. Install Rust
```bash
# Linux/macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# Download from: https://rustup.rs/
```

### 2. Install wasm32 Target
```bash
rustup target add wasm32-unknown-unknown
```

**Note**: `rust-toolchain.toml` will auto-install this when you run cargo commands.

### 3. Verify Installation
```bash
rustc --version
cargo --version
rustup target list | grep wasm32
```

## 🚀 Build Contracts

### Option 1: Use Build Script (Recommended)

**Windows**:
```cmd
cd linera
scripts\build_linera.bat
```

**Linux/macOS**:
```bash
cd linera
chmod +x scripts/build_linera.sh
./scripts/build_linera.sh
```

### Option 2: Manual Build
```bash
cd linera

# Build both contracts
cargo build --release --target wasm32-unknown-unknown

# Or build individually
cargo build --release --target wasm32-unknown-unknown -p oracle_feed
cargo build --release --target wasm32-unknown-unknown -p market
```

## 📦 Output Files

After successful build:
```
linera/target/wasm32-unknown-unknown/release/
├── oracle_feed.wasm    (~50-100KB optimized)
└── market.wasm         (~80-150KB optimized)
```

## ✅ Acceptance Criteria

### Test Build Success

**1. Check WASM files exist**:
```bash
cd linera
ls -lh target/wasm32-unknown-unknown/release/*.wasm
```

**2. Verify file sizes** (should be optimized):
```bash
# Linux/macOS
du -h target/wasm32-unknown-unknown/release/*.wasm

# Windows
dir target\wasm32-unknown-unknown\release\*.wasm
```

**3. Run tests**:
```bash
cd linera
cargo test
```

**4. Check formatting**:
```bash
cd linera
cargo fmt --all -- --check
```

**5. Run clippy**:
```bash
cd linera
cargo clippy --all-targets -- -D warnings
```

## 🧪 Testing

### Unit Tests
```bash
cd linera
cargo test
```

### Integration Tests (Coming in Phase 2)
Will test contracts with Linera testnet.

## 🔄 CI/CD

GitHub Actions workflow (`.github/workflows/linera-ci.yml`) will:
- ✅ Build both contracts on push/PR
- ✅ Run tests
- ✅ Check formatting
- ✅ Run clippy lints
- ✅ Security audit
- ✅ Upload WASM artifacts

## 📊 Optimization

Contracts are optimized for minimal WASM size:
```toml
[profile.release]
opt-level = "z"         # Optimize for size
lto = true              # Link-time optimization
codegen-units = 1       # Single codegen unit
strip = true            # Strip debug symbols
```

## 🔗 Next Steps (Phase 2)

1. **Deploy to Linera Testnet**
   - Setup Linera CLI
   - Create wallet
   - Deploy contracts
   - Get contract addresses

2. **Backend Integration**
   - Create Python client (`backend/linera/client.py`)
   - Replace mock oracle
   - Add event listeners

3. **Frontend Integration**
   - Add Linera wallet support
   - Transaction UI
   - Real-time chain sync

## 📚 Resources

- [Linera Documentation](https://docs.linera.io/)
- [Linera SDK GitHub](https://github.com/linera-io/linera-protocol)
- [Rust WASM Book](https://rustwasm.github.io/docs/book/)

## 🐛 Troubleshooting

### Error: "cargo: command not found"
Install Rust: https://rustup.rs/

### Error: "target 'wasm32-unknown-unknown' not found"
```bash
rustup target add wasm32-unknown-unknown
```

### Error: "linker 'cc' not found"
Install build tools:
- **Linux**: `sudo apt install build-essential`
- **macOS**: `xcode-select --install`
- **Windows**: Install Visual Studio Build Tools

### Build is slow
First build takes 5-10 minutes. Subsequent builds are cached.

## ✅ Success Checklist

- [ ] Rust installed (`rustc --version`)
- [ ] wasm32 target installed
- [ ] `cargo build --release --target wasm32-unknown-unknown` succeeds
- [ ] `oracle_feed.wasm` exists
- [ ] `market.wasm` exists
- [ ] File sizes are reasonable (<200KB each)
- [ ] `cargo test` passes
- [ ] CI workflow passes on GitHub

---

**Status**: ✅ Phase 1 Complete - Linera Workspace Ready  
**Next**: Phase 2 - Backend Integration
