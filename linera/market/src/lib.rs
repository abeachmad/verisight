//! ONCHAIN: Market State (Linera Views)
//!
//! - MapView: event_id -> MarketState (yes/no pool, cutoff_ts, resolved, dll.).
//! - RegisterView: konfigurasi global (mis. parameter anti-manipulasi).
//!
//! Anti-manipulasi: velocity cap & cooldown dicatat per event/actor.
//!
//! ABI Operations (WRITE path, metered):
//!
//!   - CreateMarket { event_id, cutoff_ts }
//!   - Stake { event_id, side, amount }   // terapkan velocity cap/cooldown
//!   - Resolve { event_id, outcome }
//!
//! Tanggung jawab: cek cutoff/resolved, jaga invarian, update pool.
//!
//! ABI Queries (READ path, GraphQL, unmetered):
//!   - odds(event_id) -> Odds { yes, no, last_update }
//!   - market(event_id) -> Market
//!   - markets(limit, cursor) -> [Market]

use serde::{Deserialize, Serialize};

/// Market state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketState {
    pub event_id: String,
    pub description: String,
    pub cutoff_ts: u64,
    pub resolved: bool,
    pub outcome: Option<String>,
    pub pool_yes: u128,
    pub pool_no: u128,
    pub last_price_update_ms: u64,
}

/// Odds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Odds {
    pub yes_price: f64,
    pub no_price: f64,
}

/// Operations
#[derive(Debug, Serialize, Deserialize)]
pub enum Operation {
    CreateMarket {
        event_id: String,
        description: String,
        cutoff_ts: u64,
    },
    Stake {
        event_id: String,
        side: String,
        amount: u128,
    },
    Resolve {
        event_id: String,
        outcome: String,
    },
}

/// Message
#[derive(Debug, Serialize, Deserialize)]
pub enum Message {}

const MAX_PRICE_DELTA: f64 = 0.15;
const COOLDOWN_MS: u64 = 5000;
#[allow(dead_code)]
const MIN_STAKE: u128 = 1000;

impl MarketState {
    pub fn calculate_odds(&self) -> Odds {
        let total = self.pool_yes + self.pool_no;
        if total == 0 {
            return Odds {
                yes_price: 0.5,
                no_price: 0.5,
            };
        }

        let yes_price = self.pool_yes as f64 / total as f64;
        let no_price = self.pool_no as f64 / total as f64;

        Odds {
            yes_price,
            no_price,
        }
    }

    pub fn check_price_velocity(&self, new_yes: u128, new_no: u128) -> Result<(), String> {
        let old_odds = self.calculate_odds();

        let total = new_yes + new_no;
        if total == 0 {
            return Ok(());
        }

        let new_yes_price = new_yes as f64 / total as f64;
        let delta = (new_yes_price - old_odds.yes_price).abs();

        if delta > MAX_PRICE_DELTA {
            return Err("Price velocity exceeded".to_string());
        }

        Ok(())
    }

    pub fn check_cooldown(&self, current_ms: u64) -> Result<(), String> {
        if self.last_price_update_ms > 0 {
            let elapsed = current_ms.saturating_sub(self.last_price_update_ms);
            if elapsed < COOLDOWN_MS {
                return Err(format!(
                    "Cooldown active: {}ms remaining",
                    COOLDOWN_MS - elapsed
                ));
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_odds_calculation() {
        let market = MarketState {
            event_id: "test".to_string(),
            description: "Test".to_string(),
            cutoff_ts: 1000,
            resolved: false,
            outcome: None,
            pool_yes: 6000,
            pool_no: 4000,
            last_price_update_ms: 0,
        };

        let odds = market.calculate_odds();
        assert_eq!(odds.yes_price, 0.6);
        assert_eq!(odds.no_price, 0.4);
    }

    #[test]
    fn test_price_velocity_within_limit() {
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

        assert!(market.check_price_velocity(6000, 4000).is_ok());
    }

    #[test]
    fn test_price_velocity_exceeded() {
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

        assert!(market.check_price_velocity(8000, 2000).is_err());
    }

    #[test]
    fn test_cooldown_check() {
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

        assert!(market.check_cooldown(3000).is_err());
        assert!(market.check_cooldown(7000).is_ok());
    }
}
