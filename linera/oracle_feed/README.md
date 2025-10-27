# OracleFeed Contract

AI-verified event oracle for Linera blockchain.

## 📋 ABI

### Operations

#### PublishEvent
```rust
Operation::PublishEvent {
    event_id: String,        // Unique event identifier
    payload_hash: String,    // Hash of event payload
    confidence: f32,         // 0.0 - 1.0
    sources: Vec<String>,    // Verification sources (min 1)
    cid: Option<String>,     // IPFS CID (optional)
}
```

**Validation**:
- `confidence` must be between 0.0 and 1.0
- `sources` must have at least 1 source
- Emits log: `EventPublished: {event_id} at block {height} with confidence {conf}`

### Queries (GraphQL-like)

#### Get Single Event
```
event:{event_id}
```

**Example**:
```
event:btc-halving-2024
```

**Response**:
```json
{
  "event_id": "btc-halving-2024",
  "payload_hash": "0xabc123...",
  "confidence": 0.95,
  "sources": ["reuters.com", "coindesk.com"],
  "cid": "QmTest123",
  "block_height": 1000,
  "timestamp_ms": 1234567890000,
  "tx_hash": "0xtx123..."
}
```

#### List Events
```
events:{offset},{limit}
```

**Example**:
```
events:0,10
```

**Response**:
```json
[
  {
    "event_id": "event-1",
    "payload_hash": "0x...",
    "confidence": 0.92,
    ...
  },
  {
    "event_id": "event-2",
    "payload_hash": "0x...",
    "confidence": 0.88,
    ...
  }
]
```

## 🗄️ State

### EventRecord
```rust
struct EventRecord {
    event_id: String,
    payload_hash: String,     // SHA256 hash of event data
    confidence: f32,          // AI confidence score
    sources: Vec<String>,     // Verification sources
    cid: Option<String>,      // IPFS CID for large data
    block_height: u64,        // Block when published
    timestamp_ms: u64,        // Unix timestamp (ms)
    tx_hash: String,          // Transaction hash
}
```

### Storage
- `MapView<String, EventRecord>` - Key: event_id, Value: EventRecord

## 🔐 Security

- **Confidence validation**: 0.0 ≤ confidence ≤ 1.0
- **Source requirement**: Minimum 1 source
- **Immutable storage**: Events cannot be modified after publishing
- **Authenticated operations**: Only authorized signers can publish

## 🧪 Tests

### Unit Tests
```bash
cargo test
```

**Tests included**:
- ✅ Confidence validation (0.0-1.0 range)
- ✅ Event record creation
- ✅ Sources validation (min 1)
- ✅ Serialization/deserialization

### Integration Tests
```bash
cargo test --test integration
```

## 📊 GraphQL Schema

```graphql
type EventRecord {
  event_id: String!
  payload_hash: String!
  confidence: Float!
  sources: [String!]!
  cid: String
  block_height: Int!
  timestamp_ms: Int!
  tx_hash: String!
}

type Query {
  event(event_id: String!): EventRecord
  events(offset: Int, limit: Int): [EventRecord!]!
}

type Mutation {
  publishEvent(
    event_id: String!
    payload_hash: String!
    confidence: Float!
    sources: [String!]!
    cid: String
  ): String!
}
```

## 🚀 Usage Example

### Publish Event
```rust
let operation = Operation::PublishEvent {
    event_id: "btc-halving-2024".to_string(),
    payload_hash: "0xabc123def456...".to_string(),
    confidence: 0.95,
    sources: vec![
        "reuters.com".to_string(),
        "coindesk.com".to_string(),
        "blockchain.com".to_string(),
    ],
    cid: Some("QmTest123ABC".to_string()),
};
```

### Query Event
```bash
# Using Linera CLI
linera query-application <chain-id> <app-id> "event:btc-halving-2024"
```

### List Events
```bash
linera query-application <chain-id> <app-id> "events:0,10"
```

## 📈 On-Chain Proof

Each event includes:
- **TX Hash**: Linera transaction hash
- **Block Height**: Block number when published
- **Timestamp**: Unix timestamp (milliseconds)
- **Payload Hash**: SHA256 hash of event data
- **IPFS CID**: Optional content identifier for large data

## 🔗 Integration

### Backend Integration
```python
from linera_client import LineraClient

client = LineraClient()

# Publish event
tx_hash = client.execute_operation(
    chain_id="...",
    app_id="...",
    operation={
        "PublishEvent": {
            "event_id": "event-123",
            "payload_hash": "0xabc...",
            "confidence": 0.92,
            "sources": ["source1", "source2"],
            "cid": "QmTest"
        }
    }
)

# Query event
event = client.query(
    chain_id="...",
    app_id="...",
    query="event:event-123"
)
```

## 📝 Notes

- Events are immutable once published
- Confidence scores are stored as f32 (4 bytes)
- Sources are stored as Vec<String> (dynamic size)
- IPFS CID is optional for large event data
- Block height and timestamp are automatically set from runtime context

## 🔄 Future Enhancements

- [ ] Event update mechanism (with versioning)
- [ ] Multi-signature verification
- [ ] Confidence threshold enforcement
- [ ] Event expiration/archival
- [ ] Cross-chain event verification
