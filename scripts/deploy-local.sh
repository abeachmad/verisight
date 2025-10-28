#!/bin/bash
# Deploy to local Linera devnet (WSL2/Linux)
# Usage: ./scripts/deploy-local.sh

set -e

echo ""
echo "=== Linera Local Devnet Deployment ==="
echo ""

# Check if linera CLI is installed
if ! command -v linera &> /dev/null; then
    echo "[ERROR] Linera CLI not found. Install with:"
    echo "  cargo install linera-service"
    exit 1
fi

# 1. Build WASM
echo "[1/4] Building WASM contracts..."
cd linera/oracle_feed
cargo build --target wasm32-unknown-unknown --release
cd ../market
cargo build --target wasm32-unknown-unknown --release
cd ../..
echo "  ✓ WASM builds complete"

# 2. Start devnet (if not running)
echo ""
echo "[2/4] Checking Linera devnet..."
if ! linera wallet show &> /dev/null; then
    echo "  Starting local devnet..."
    linera net up &
    sleep 5
fi
echo "  ✓ Devnet ready"

# 3. Publish oracle_feed
echo ""
echo "[3/4] Publishing oracle_feed contract..."
ORACLE_OUTPUT=$(linera publish \
    --wasm-path linera/oracle_feed/target/wasm32-unknown-unknown/release/oracle_feed.wasm \
    --json)

ORACLE_APP_ID=$(echo "$ORACLE_OUTPUT" | jq -r '.application_id')
echo "  ✓ OracleFeed APP_ID: $ORACLE_APP_ID"

# 4. Publish market
echo ""
echo "[4/4] Publishing market contract..."
MARKET_OUTPUT=$(linera publish \
    --wasm-path linera/market/target/wasm32-unknown-unknown/release/market.wasm \
    --json)

MARKET_APP_ID=$(echo "$MARKET_OUTPUT" | jq -r '.application_id')
echo "  ✓ Market APP_ID: $MARKET_APP_ID"

# Get chain ID
CHAIN_ID=$(linera wallet show --json | jq -r '.default_chain')
SERVICE_URL="http://localhost:8080"

# Save to .env.local
echo ""
echo "Writing frontend/.env.local..."
cat > frontend/.env.local <<EOF
# Linera Devnet Configuration
REACT_APP_MODE=linera
REACT_APP_LINERA_SERVICE_URL=$SERVICE_URL
REACT_APP_ORACLEFEED_APP_ID=$ORACLE_APP_ID
REACT_APP_MARKET_APP_ID=$MARKET_APP_ID
REACT_APP_CHAIN_ID=$CHAIN_ID
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
EOF

echo "  ✓ Configuration saved"

# Summary
echo ""
echo "=== Deployment Complete ==="
echo "OracleFeed APP_ID: $ORACLE_APP_ID"
echo "Market APP_ID:     $MARKET_APP_ID"
echo "Chain ID:          $CHAIN_ID"
echo "Service URL:       $SERVICE_URL"
echo ""
echo "Next steps:"
echo "  cd frontend && npm start"
echo "  Open http://localhost:3000"
