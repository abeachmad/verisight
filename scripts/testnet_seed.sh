#!/bin/bash
set -e

echo "🌱 Seeding sample markets to Linera Testnet..."

# Load testnet config
source configs/linera.testnet.env

if [ -z "$LINERA_MARKET_APP_ID" ]; then
    echo "❌ Error: LINERA_MARKET_APP_ID not set. Run testnet_publish.sh first."
    exit 1
fi

# Get default chain ID
CHAIN_ID=$(linera wallet show | grep "Default chain" | awk '{print $3}')
echo "📍 Using chain: $CHAIN_ID"

GRAPHQL_URL="$LINERA_TESTNET_SERVICE_URL/chains/$CHAIN_ID/applications/$LINERA_MARKET_APP_ID"

# Sample market 1: Bitcoin price prediction
echo "📊 Creating market 1: Bitcoin > $100k by EOY 2024..."
CUTOFF_1=$(($(date +%s) + 86400 * 30))  # 30 days from now

MUTATION_1=$(cat <<EOF
mutation {
  createMarket(
    eventId: "btc_100k_eoy_2024",
    cutoffMs: $CUTOFF_1
  )
}
EOF
)

curl -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$(echo $MUTATION_1 | tr '\n' ' ')\"}" \
  && echo "✅ Market 1 created: btc_100k_eoy_2024 (cutoff: $CUTOFF_1)"

sleep 2

# Sample market 2: Ethereum upgrade
echo "📊 Creating market 2: Ethereum Pectra upgrade in Q1 2025..."
CUTOFF_2=$(($(date +%s) + 86400 * 60))  # 60 days from now

MUTATION_2=$(cat <<EOF
mutation {
  createMarket(
    eventId: "eth_pectra_q1_2025",
    cutoffMs: $CUTOFF_2
  )
}
EOF
)

curl -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$(echo $MUTATION_2 | tr '\n' ' ')\"}" \
  && echo "✅ Market 2 created: eth_pectra_q1_2025 (cutoff: $CUTOFF_2)"

sleep 2

# Sample market 3: AI milestone
echo "📊 Creating market 3: GPT-5 release in 2025..."
CUTOFF_3=$(($(date +%s) + 86400 * 90))  # 90 days from now

MUTATION_3=$(cat <<EOF
mutation {
  createMarket(
    eventId: "gpt5_release_2025",
    cutoffMs: $CUTOFF_3
  )
}
EOF
)

curl -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$(echo $MUTATION_3 | tr '\n' ' ')\"}" \
  && echo "✅ Market 3 created: gpt5_release_2025 (cutoff: $CUTOFF_3)"

echo ""
echo "✅ Seeding complete! 3 sample markets created."
echo ""
echo "🔍 Verify markets with GraphQL query:"
echo "   curl -X POST $GRAPHQL_URL \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"query\": \"{ markets(offset: 0, limit: 10) }\"}'"
