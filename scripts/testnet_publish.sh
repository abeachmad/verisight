#!/bin/bash
set -e

echo "🚀 Publishing Verisight contracts to Linera Testnet..."

# Load testnet config
source configs/linera.testnet.env

# Build WASM contracts
echo "📦 Building WASM contracts..."
cd linera
cargo build --release --target wasm32-unknown-unknown
cd ..

# Initialize wallet if needed
if [ ! -d "$HOME/.config/linera" ]; then
    echo "🔑 Initializing Linera wallet..."
    linera wallet init --faucet "$LINERA_TESTNET_FAUCET_URL"
else
    echo "✅ Wallet already initialized"
fi

# Publish OracleFeed contract
echo "📤 Publishing OracleFeed contract..."
ORACLE_OUTPUT=$(linera publish-and-create \
    linera/target/wasm32-unknown-unknown/release/oracle_feed.wasm \
    --required-application-ids '[]')

ORACLE_APP_ID=$(echo "$ORACLE_OUTPUT" | grep -oP 'Application ID: \K[a-f0-9]+')
echo "✅ OracleFeed deployed: $ORACLE_APP_ID"

# Publish Market contract
echo "📤 Publishing Market contract..."
MARKET_OUTPUT=$(linera publish-and-create \
    linera/target/wasm32-unknown-unknown/release/market.wasm \
    --required-application-ids "[$ORACLE_APP_ID]")

MARKET_APP_ID=$(echo "$MARKET_OUTPUT" | grep -oP 'Application ID: \K[a-f0-9]+')
echo "✅ Market deployed: $MARKET_APP_ID"

# Update config files
echo "📝 Updating configuration files..."

# Update configs/linera.testnet.env
sed -i "s|LINERA_ORACLEFEED_APP_ID=.*|LINERA_ORACLEFEED_APP_ID=$ORACLE_APP_ID|" configs/linera.testnet.env
sed -i "s|LINERA_MARKET_APP_ID=.*|LINERA_MARKET_APP_ID=$MARKET_APP_ID|" configs/linera.testnet.env

# Update backend/.env
if [ -f "backend/.env" ]; then
    if grep -q "LINERA_ORACLEFEED_APP_ID" backend/.env; then
        sed -i "s|LINERA_ORACLEFEED_APP_ID=.*|LINERA_ORACLEFEED_APP_ID=$ORACLE_APP_ID|" backend/.env
        sed -i "s|LINERA_MARKET_APP_ID=.*|LINERA_MARKET_APP_ID=$MARKET_APP_ID|" backend/.env
    else
        echo "LINERA_ORACLEFEED_APP_ID=$ORACLE_APP_ID" >> backend/.env
        echo "LINERA_MARKET_APP_ID=$MARKET_APP_ID" >> backend/.env
    fi
fi

# Update frontend/.env
if [ -f "frontend/.env" ]; then
    if grep -q "REACT_APP_LINERA_ORACLEFEED_APP_ID" frontend/.env; then
        sed -i "s|REACT_APP_LINERA_ORACLEFEED_APP_ID=.*|REACT_APP_LINERA_ORACLEFEED_APP_ID=$ORACLE_APP_ID|" frontend/.env
        sed -i "s|REACT_APP_LINERA_MARKET_APP_ID=.*|REACT_APP_LINERA_MARKET_APP_ID=$MARKET_APP_ID|" frontend/.env
    else
        echo "REACT_APP_LINERA_ORACLEFEED_APP_ID=$ORACLE_APP_ID" >> frontend/.env
        echo "REACT_APP_LINERA_MARKET_APP_ID=$MARKET_APP_ID" >> frontend/.env
    fi
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Application IDs:"
echo "   OracleFeed: $ORACLE_APP_ID"
echo "   Market:     $MARKET_APP_ID"
echo ""
echo "🔗 GraphQL endpoints:"
echo "   OracleFeed: $LINERA_TESTNET_SERVICE_URL/chains/<chain-id>/applications/$ORACLE_APP_ID"
echo "   Market:     $LINERA_TESTNET_SERVICE_URL/chains/<chain-id>/applications/$MARKET_APP_ID"
echo ""
echo "Next: Run 'bash scripts/testnet_seed.sh' to create sample markets"
