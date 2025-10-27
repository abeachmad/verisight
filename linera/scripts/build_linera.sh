#!/bin/bash
set -e

echo "🔨 Building Linera Contracts..."

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Cargo not found. Please install Rust: https://rustup.rs/"
    exit 1
fi

# Check if wasm32 target is installed
if ! rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
    echo "📦 Installing wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
fi

# Navigate to linera directory
cd "$(dirname "$0")/.."

echo "📦 Building oracle_feed contract..."
cargo build --release --target wasm32-unknown-unknown -p oracle_feed

echo "📦 Building market contract..."
cargo build --release --target wasm32-unknown-unknown -p market

echo "✅ Build complete!"
echo ""
echo "📁 WASM files location:"
echo "   - oracle_feed: target/wasm32-unknown-unknown/release/oracle_feed.wasm"
echo "   - market: target/wasm32-unknown-unknown/release/market.wasm"
echo ""
echo "📊 File sizes:"
ls -lh target/wasm32-unknown-unknown/release/*.wasm 2>/dev/null || echo "   (Run from linera/ directory)"
