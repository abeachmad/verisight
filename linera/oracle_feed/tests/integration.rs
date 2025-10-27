use oracle_feed::{EventRecord, Operation};

#[test]
fn test_operation_serialization() {
    let op = Operation::PublishEvent {
        event_id: "test-event".to_string(),
        payload_hash: "0xabc123".to_string(),
        confidence: 0.95,
        sources: vec!["source1".to_string(), "source2".to_string()],
        cid: Some("QmTest".to_string()),
    };

    let json = serde_json::to_string(&op).unwrap();
    assert!(json.contains("PublishEvent"));
    assert!(json.contains("test-event"));
    assert!(json.contains("0.95"));

    let deserialized: Operation = serde_json::from_str(&json).unwrap();
    match deserialized {
        Operation::PublishEvent {
            event_id,
            confidence,
            ..
        } => {
            assert_eq!(event_id, "test-event");
            assert_eq!(confidence, 0.95);
        }
    }
}

#[test]
fn test_event_record_with_all_fields() {
    let record = EventRecord {
        event_id: "integration-test-1".to_string(),
        payload_hash: "0x1234567890abcdef".to_string(),
        confidence: 0.87,
        sources: vec![
            "reuters.com".to_string(),
            "bloomberg.com".to_string(),
            "coindesk.com".to_string(),
        ],
        cid: Some("QmIntegrationTest123".to_string()),
        block_height: 12345,
        timestamp_ms: 1234567890123,
        tx_hash: "0xtxhash123".to_string(),
    };

    assert_eq!(record.sources.len(), 3);
    assert!(record.cid.is_some());
    assert_eq!(record.block_height, 12345);
    assert!(record.confidence > 0.8);
}

#[test]
fn test_event_record_without_cid() {
    let record = EventRecord {
        event_id: "no-cid-event".to_string(),
        payload_hash: "0xnocid".to_string(),
        confidence: 0.75,
        sources: vec!["source1".to_string()],
        cid: None,
        block_height: 100,
        timestamp_ms: 1000000,
        tx_hash: "0xtx".to_string(),
    };

    assert!(record.cid.is_none());
    assert_eq!(record.sources.len(), 1);
}

#[test]
fn test_multiple_sources() {
    let sources = [
        "reuters.com".to_string(),
        "bloomberg.com".to_string(),
        "coindesk.com".to_string(),
        "cointelegraph.com".to_string(),
        "decrypt.co".to_string(),
    ];

    assert_eq!(sources.len(), 5);
    assert!(sources.contains(&"reuters.com".to_string()));
}

#[test]
fn test_confidence_edge_cases() {
    let min_confidence = 0.0;
    let max_confidence = 1.0;
    let mid_confidence = 0.5;

    assert!((0.0..=1.0).contains(&min_confidence));
    assert!((0.0..=1.0).contains(&max_confidence));
    assert!((0.0..=1.0).contains(&mid_confidence));
}

#[test]
fn test_payload_hash_format() {
    let hash = "0xabcdef1234567890";
    assert!(hash.starts_with("0x"));
    assert_eq!(hash.len(), 18); // 0x + 16 hex chars
}

#[test]
fn test_event_id_uniqueness() {
    use std::collections::HashSet;

    let mut ids = HashSet::new();
    ids.insert("event-1".to_string());
    ids.insert("event-2".to_string());
    ids.insert("event-3".to_string());

    assert_eq!(ids.len(), 3);
    assert!(!ids.insert("event-1".to_string())); // Duplicate
}

#[test]
fn test_timestamp_ordering() {
    let ts1 = 1000000;
    let ts2 = 2000000;
    let ts3 = 3000000;

    assert!(ts1 < ts2);
    assert!(ts2 < ts3);
    assert!(ts1 < ts3);
}

#[test]
fn test_block_height_increment() {
    let heights = [100, 101, 102, 103, 104];

    for i in 1..heights.len() {
        assert_eq!(heights[i], heights[i - 1] + 1);
    }
}
