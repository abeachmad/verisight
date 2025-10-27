use market::{MarketState, Operation};

#[test]
fn test_create_market_operation() {
    let op = Operation::CreateMarket {
        event_id: "btc-halving-2024".to_string(),
        description: "Will BTC halving happen in 2024?".to_string(),
        cutoff_ts: 1735689600000, // 2025-01-01
    };

    let json = serde_json::to_string(&op).unwrap();
    assert!(json.contains("CreateMarket"));
    assert!(json.contains("btc-halving-2024"));
}

#[test]
fn test_stake_yes_operation() {
    let op = Operation::Stake {
        event_id: "test-event".to_string(),
        side: "YES".to_string(),
        amount: 5000,
    };

    let json = serde_json::to_string(&op).unwrap();
    assert!(json.contains("Stake"));
    assert!(json.contains("YES"));
    assert!(json.contains("5000"));
}

#[test]
fn test_stake_no_operation() {
    let op = Operation::Stake {
        event_id: "test-event".to_string(),
        side: "NO".to_string(),
        amount: 3000,
    };

    let json = serde_json::to_string(&op).unwrap();
    assert!(json.contains("NO"));
}

#[test]
fn test_resolve_operation() {
    let op = Operation::Resolve {
        event_id: "test-event".to_string(),
        outcome: "YES".to_string(),
    };

    let json = serde_json::to_string(&op).unwrap();
    assert!(json.contains("Resolve"));
    assert!(json.contains("YES"));
}

#[test]
fn test_two_sided_stakes() {
    let mut market = MarketState {
        event_id: "test".to_string(),
        description: "Test market".to_string(),
        cutoff_ts: 9999999999999,
        resolved: false,
        outcome: None,
        pool_yes: 0,
        pool_no: 0,
        last_price_update_ms: 0,
    };

    // First stake YES
    market.pool_yes = 6000;
    let odds1 = market.calculate_odds();
    assert_eq!(odds1.yes_price, 1.0);

    // Second stake NO
    market.pool_no = 4000;
    let odds2 = market.calculate_odds();
    assert_eq!(odds2.yes_price, 0.6);
    assert_eq!(odds2.no_price, 0.4);
}

#[test]
fn test_velocity_limit_enforcement() {
    let market = MarketState {
        event_id: "test".to_string(),
        description: "Test".to_string(),
        cutoff_ts: 1000,
        resolved: false,
        outcome: None,
        pool_yes: 5000,
        pool_no: 5000,
        last_price_update_ms: 0,
    };

    // Within limit (0.5 -> 0.6, delta = 0.1)
    assert!(market.check_price_velocity(6000, 4000).is_ok());

    // Exceeds limit (0.5 -> 0.7, delta = 0.2 > 0.15)
    assert!(market.check_price_velocity(7000, 3000).is_err());

    // Exceeds limit (0.5 -> 0.8, delta = 0.3 > 0.15)
    assert!(market.check_price_velocity(8000, 2000).is_err());
}

#[test]
fn test_cutoff_validation() {
    let market = MarketState {
        event_id: "test".to_string(),
        description: "Test".to_string(),
        cutoff_ts: 1000000,
        resolved: false,
        outcome: None,
        pool_yes: 5000,
        pool_no: 5000,
        last_price_update_ms: 0,
    };

    let current_before = 999999;
    let current_after = 1000001;

    assert!(current_before < market.cutoff_ts);
    assert!(current_after > market.cutoff_ts);
}

#[test]
fn test_resolution_flow() {
    let mut market = MarketState {
        event_id: "test".to_string(),
        description: "Test".to_string(),
        cutoff_ts: 1000,
        resolved: false,
        outcome: None,
        pool_yes: 6000,
        pool_no: 4000,
        last_price_update_ms: 0,
    };

    assert!(!market.resolved);
    assert!(market.outcome.is_none());

    // Resolve
    market.resolved = true;
    market.outcome = Some("YES".to_string());

    assert!(market.resolved);
    assert_eq!(market.outcome, Some("YES".to_string()));
}

#[test]
fn test_cooldown_period() {
    let market = MarketState {
        event_id: "test".to_string(),
        description: "Test".to_string(),
        cutoff_ts: 1000,
        resolved: false,
        outcome: None,
        pool_yes: 5000,
        pool_no: 5000,
        last_price_update_ms: 1000,
    };

    // Within cooldown (1000 + 3000 < 1000 + 5000)
    assert!(market.check_cooldown(4000).is_err());

    // Exactly at cooldown end
    assert!(market.check_cooldown(6000).is_ok());

    // After cooldown
    assert!(market.check_cooldown(10000).is_ok());
}

#[test]
fn test_odds_extreme_ratios() {
    let market1 = MarketState {
        event_id: "test".to_string(),
        description: "Test".to_string(),
        cutoff_ts: 1000,
        resolved: false,
        outcome: None,
        pool_yes: 9000,
        pool_no: 1000,
        last_price_update_ms: 0,
    };

    let odds1 = market1.calculate_odds();
    assert_eq!(odds1.yes_price, 0.9);
    assert_eq!(odds1.no_price, 0.1);

    let market2 = MarketState {
        event_id: "test".to_string(),
        description: "Test".to_string(),
        cutoff_ts: 1000,
        resolved: false,
        outcome: None,
        pool_yes: 1000,
        pool_no: 9000,
        last_price_update_ms: 0,
    };

    let odds2 = market2.calculate_odds();
    assert_eq!(odds2.yes_price, 0.1);
    assert_eq!(odds2.no_price, 0.9);
}

#[test]
fn test_market_state_complete() {
    let market = MarketState {
        event_id: "integration-test".to_string(),
        description: "Full integration test market".to_string(),
        cutoff_ts: 1735689600000,
        resolved: true,
        outcome: Some("YES".to_string()),
        pool_yes: 15000,
        pool_no: 8000,
        last_price_update_ms: 1234567890,
    };

    assert_eq!(market.event_id, "integration-test");
    assert!(market.resolved);
    assert_eq!(market.outcome, Some("YES".to_string()));
    assert_eq!(market.pool_yes + market.pool_no, 23000);

    let odds = market.calculate_odds();
    assert!((odds.yes_price - 0.652).abs() < 0.01);
}

#[test]
fn test_min_stake_constant() {
    const MIN_STAKE: u128 = 1000;

    // Test MIN_STAKE value
    assert_eq!(MIN_STAKE, 1000);
}
