# OracleFeed GraphQL Schema

## 📊 Schema Definition

```graphql
type EventRecord {
  """Unique event identifier"""
  event_id: String!
  
  """SHA256 hash of event payload"""
  payload_hash: String!
  
  """AI confidence score (0.0 - 1.0)"""
  confidence: Float!
  
  """Verification sources"""
  sources: [String!]!
  
  """IPFS Content Identifier (optional)"""
  cid: String
  
  """Block height when published"""
  block_height: Int!
  
  """Unix timestamp in milliseconds"""
  timestamp_ms: Int!
  
  """Transaction hash"""
  tx_hash: String!
}

type Query {
  """Get single event by ID"""
  event(event_id: String!): EventRecord
  
  """List events with pagination"""
  events(offset: Int = 0, limit: Int = 10): [EventRecord!]!
}

type Mutation {
  """Publish new verified event"""
  publishEvent(
    event_id: String!
    payload_hash: String!
    confidence: Float!
    sources: [String!]!
    cid: String
  ): String!
}
```

## 🔍 Query Examples

### Get Single Event

**Query**:
```graphql
query GetEvent {
  event(event_id: "btc-halving-2024") {
    event_id
    payload_hash
    confidence
    sources
    cid
    block_height
    timestamp_ms
    tx_hash
  }
}
```

**Response**:
```json
{
  "data": {
    "event": {
      "event_id": "btc-halving-2024",
      "payload_hash": "0xabc123def456789...",
      "confidence": 0.95,
      "sources": [
        "reuters.com",
        "coindesk.com",
        "blockchain.com"
      ],
      "cid": "QmTest123ABC",
      "block_height": 1000,
      "timestamp_ms": 1234567890000,
      "tx_hash": "0xtx123..."
    }
  }
}
```

### List Events

**Query**:
```graphql
query ListEvents {
  events(offset: 0, limit: 5) {
    event_id
    confidence
    block_height
    timestamp_ms
  }
}
```

**Response**:
```json
{
  "data": {
    "events": [
      {
        "event_id": "event-1",
        "confidence": 0.92,
        "block_height": 1000,
        "timestamp_ms": 1234567890000
      },
      {
        "event_id": "event-2",
        "confidence": 0.88,
        "block_height": 1001,
        "timestamp_ms": 1234567891000
      }
    ]
  }
}
```

### List Events with Pagination

**Query**:
```graphql
query ListEventsPage2 {
  events(offset: 10, limit: 10) {
    event_id
    confidence
  }
}
```

## ✏️ Mutation Examples

### Publish Event

**Mutation**:
```graphql
mutation PublishEvent {
  publishEvent(
    event_id: "btc-halving-2024"
    payload_hash: "0xabc123def456..."
    confidence: 0.95
    sources: ["reuters.com", "coindesk.com"]
    cid: "QmTest123"
  )
}
```

**Response**:
```json
{
  "data": {
    "publishEvent": "0xtx123..."
  }
}
```

### Publish Event without CID

**Mutation**:
```graphql
mutation PublishEventNoCID {
  publishEvent(
    event_id: "eth-merge-2024"
    payload_hash: "0xdef789..."
    confidence: 0.87
    sources: ["ethereum.org", "coindesk.com", "decrypt.co"]
  )
}
```

## 🔧 Using with Linera CLI

### Query Event
```bash
linera query-application \
  --chain-id <chain-id> \
  --application-id <app-id> \
  "event:btc-halving-2024"
```

### List Events
```bash
linera query-application \
  --chain-id <chain-id> \
  --application-id <app-id> \
  "events:0,10"
```

## 🐍 Python Client Example

```python
from linera_client import LineraClient

client = LineraClient()

# Query single event
event = client.query(
    chain_id="e476...",
    app_id="e476...",
    query="event:btc-halving-2024"
)

print(f"Event: {event['event_id']}")
print(f"Confidence: {event['confidence']}")
print(f"Sources: {', '.join(event['sources'])}")

# List events
events = client.query(
    chain_id="e476...",
    app_id="e476...",
    query="events:0,10"
)

for event in events:
    print(f"{event['event_id']}: {event['confidence']}")
```

## 🌐 JavaScript/TypeScript Example

```typescript
import { LineraClient } from '@linera/sdk';

const client = new LineraClient();

// Query event
const event = await client.query({
  chainId: 'e476...',
  appId: 'e476...',
  query: 'event:btc-halving-2024'
});

console.log(`Event: ${event.event_id}`);
console.log(`Confidence: ${event.confidence}`);

// List events
const events = await client.query({
  chainId: 'e476...',
  appId: 'e476...',
  query: 'events:0,10'
});

events.forEach(e => {
  console.log(`${e.event_id}: ${e.confidence}`);
});
```

## 📝 Query Format

### Simple Query Format
The contract uses a simple string-based query format:

**Get Event**:
```
event:{event_id}
```

**List Events**:
```
events:{offset},{limit}
```

### Examples
```
event:btc-halving-2024
events:0,10
events:20,5
```

## 🔐 Authentication

All mutations require authenticated signer:
- Signature verification
- Owner validation
- Transaction signing

## ⚡ Performance

- **Get Event**: O(1) - Direct MapView lookup
- **List Events**: O(n) - Iterator with limit
- **Publish Event**: O(1) - MapView insert

## 🚨 Error Handling

### Invalid Confidence
```json
{
  "error": "Invalid confidence: 1.5 (must be 0.0-1.0)"
}
```

### No Sources
```json
{
  "error": "No sources provided"
}
```

### Event Not Found
```json
{
  "error": "Event not found: unknown-event-id"
}
```

## 📊 Response Times

- Query single event: ~10ms
- List 10 events: ~50ms
- Publish event: ~100ms (includes block confirmation)

## 🔗 Related

- [OracleFeed README](README.md)
- [Linera GraphQL Docs](https://docs.linera.io/graphql)
- [Integration Guide](../../PLAN.md)
