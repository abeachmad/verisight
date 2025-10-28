#!/bin/bash
# Full validation script for WSL2/Linux
# Usage: ./scripts/dev-check.sh

set -e

echo ""
echo "=== Verisight Dev Check (WSL2/Linux) ==="
echo ""

# 1. Rust checks
echo "[1/5] Rust Format Check..."
cd linera/oracle_feed && cargo fmt --check && cd ../..
cd linera/market && cargo fmt --check && cd ../..
echo "  ✓ Rust formatting OK"

echo ""
echo "[2/5] Rust Clippy..."
cd linera/oracle_feed && cargo clippy -- -D warnings && cd ../..
cd linera/market && cargo clippy -- -D warnings && cd ../..
echo "  ✓ Clippy passed"

echo ""
echo "[3/5] Rust Tests..."
cd linera/oracle_feed && cargo test && cd ../..
cd linera/market && cargo test && cd ../..
echo "  ✓ All Rust tests passed"

echo ""
echo "[4/5] WASM Build..."
cd linera/oracle_feed && cargo build --target wasm32-unknown-unknown --release && cd ../..
cd linera/market && cargo build --target wasm32-unknown-unknown --release && cd ../..
echo "  ✓ WASM builds successful"

echo ""
echo "[5/5] Frontend Check..."
cd frontend
if [ -d "node_modules" ]; then
    npm run lint
    npm run build
    echo "  ✓ Frontend OK"
else
    echo "  ⚠ node_modules not found, run: npm install"
fi
cd ..

echo ""
echo "=== All Checks Passed ==="
echo "Ready for deployment!"
