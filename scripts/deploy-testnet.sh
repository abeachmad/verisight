#!/bin/bash
# Deploy to Linera testnet (WSL2/Linux)
# Usage: ./scripts/deploy-testnet.sh <service-url> <oracle-app-id> <market-app-id>

set -e

if [ $# -ne 3 ]; then
    echo "Usage: $0 <service-url> <oracle-app-id> <market-app-id>"
    echo "Example: $0 https://rpc.testnet.linera.net e476... a12b..."
    exit 1
fi

SERVICE_URL=$1
ORACLE_APP_ID=$2
MARKET_APP_ID=$3

echo ""
echo "=== Linera Testnet Connection ==="
echo ""

# Probe GraphQL endpoint
echo "[1/2] Probing GraphQL endpoint..."
for i in {1..3}; do
    if curl -s -X POST "$SERVICE_URL" \
        -H "Content-Type: application/json" \
        -d '{"query": "{ __typename }"}' > /dev/null; then
        echo "  ✓ GraphQL endpoint reachable"
        break
    else
        echo "  Attempt $i/3 failed, retrying..."
        sleep 2
    fi
done

# Get chain ID from wallet
CHAIN_ID=$(linera wallet show --json 2>/dev/null | jq -r '.default_chain' || echo "")
if [ -z "$CHAIN_ID" ]; then
    echo "  ⚠ Could not get chain ID from wallet, using placeholder"
    CHAIN_ID="<your-chain-id>"
fi

# Write config
echo ""
echo "[2/2] Writing frontend/.env.local..."
cat > frontend/.env.local <<EOF
# Linera Testnet Configuration
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
echo "=== Testnet Connection Ready ==="
echo "Service URL:       $SERVICE_URL"
echo "OracleFeed APP_ID: $ORACLE_APP_ID"
echo "Market APP_ID:     $MARKET_APP_ID"
echo "Chain ID:          $CHAIN_ID"
echo ""
echo "Next steps:"
echo "  cd frontend && npm start"
echo "  Open http://localhost:3000"
