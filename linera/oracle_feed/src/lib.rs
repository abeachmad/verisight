//! ONCHAIN: OracleFeed State (Linera Views)
//!
//! - Microchain scope: isolasi state per event untuk paralelisme & keamanan.
//! - Views:
//!   * RegisterView: simpan metadata event (event_id, payload_hash, confidence, sources, cid, created_at).
//!   * MapView: indeks event_id -> EventState untuk query cepat.
//!   * (Opsional) QueueView: audit/event feed.
//!
//! Contract = WRITE (metered). Service = READ (GraphQL, unmetered).
//!
//! ABI Operations (WRITE path):
//!   - PublishEvent { event_id, payload_hash, confidence, sources[], cid }
//!
//! ABI Queries (READ path):
//!   - event(event_id) -> Event
//!   - events(limit, cursor) -> [Event]

use serde::{Deserialize, Serialize};

/// Event record stored on-chain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventRecord {
    pub event_id: String,
    pub payload_hash: String,
    pub confidence: f32,
    pub sources: Vec<String>,
    pub cid: Option<String>,
    pub block_height: u64,
    pub timestamp_ms: u64,
    pub tx_hash: String,
}

/// Operations (ABI)
#[derive(Debug, Serialize, Deserialize)]
pub enum Operation {
    PublishEvent {
        event_id: String,
        payload_hash: String,
        confidence: f32,
        sources: Vec<String>,
        cid: Option<String>,
    },
}

/// Message
#[derive(Debug, Serialize, Deserialize)]
pub enum Message {}

/// Query
#[derive(Debug, Serialize, Deserialize)]
pub enum Query {
    GetEvent { event_id: String },
    ListEvents { offset: usize, limit: usize },
}

/// Query response
#[derive(Debug, Serialize, Deserialize)]
pub enum QueryResponse {
    Event(Option<EventRecord>),
    Events(Vec<EventRecord>),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_confidence_validation() {
        assert!((0.0..=1.0).contains(&0.0));
        assert!((0.0..=1.0).contains(&0.5));
        assert!((0.0..=1.0).contains(&1.0));
        assert!(!(0.0..=1.0).contains(&-0.1));
        assert!(!(0.0..=1.0).contains(&1.1));
    }

    #[test]
    fn test_event_record_creation() {
        let record = EventRecord {
            event_id: "test-123".to_string(),
            payload_hash: "0xabc123".to_string(),
            confidence: 0.95,
            sources: vec!["source1".to_string(), "source2".to_string()],
            cid: Some("QmTest123".to_string()),
            block_height: 100,
            timestamp_ms: 1234567890,
            tx_hash: "0xtx123".to_string(),
        };

        assert_eq!(record.event_id, "test-123");
        assert_eq!(record.confidence, 0.95);
        assert_eq!(record.sources.len(), 2);
        assert!(record.cid.is_some());
    }

    #[test]
    fn test_sources_validation() {
        let empty_sources: Vec<String> = vec![];
        assert!(empty_sources.is_empty());

        let valid_sources = ["source1".to_string()];
        assert!(!valid_sources.is_empty());
    }

    #[test]
    fn test_serialization() {
        let record = EventRecord {
            event_id: "test-456".to_string(),
            payload_hash: "0xdef456".to_string(),
            confidence: 0.87,
            sources: vec!["reuters".to_string()],
            cid: None,
            block_height: 200,
            timestamp_ms: 9876543210,
            tx_hash: "0xtx456".to_string(),
        };

        let json = serde_json::to_string(&record).unwrap();
        assert!(json.contains("test-456"));
        assert!(json.contains("0.87"));

        let deserialized: EventRecord = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.event_id, record.event_id);
        assert_eq!(deserialized.confidence, record.confidence);
    }
}
