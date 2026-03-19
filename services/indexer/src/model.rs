use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct BaseEventRecord {
    pub chain_id: u64,
    pub contract_address: String,
    pub block_number: u64,
    pub transaction_hash: String,
    pub log_index: u64,
    pub event_name: String,
    pub payload: Map<String, Value>,
    pub tx_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LogEnvelope {
    pub chain_id: u64,
    pub contract_address: String,
    pub block_number: u64,
    pub transaction_hash: String,
    pub log_index: u64,
    pub event_name: String,
    #[serde(default)]
    pub payload: Map<String, Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexerSnapshot {
    pub chain_id: u64,
    pub latest_block: u64,
    pub indexed_events: usize,
}

fn normalize_prefixed_hex(value: &str, expected_len: usize) -> Result<String> {
    let trimmed = value.trim();
    if !trimmed.starts_with("0x") {
        return Err(anyhow!("value must be 0x-prefixed"));
    }

    let body = &trimmed[2..];
    if body.len() != expected_len {
        return Err(anyhow!("unexpected hex length"));
    }

    if !body.chars().all(|ch| ch.is_ascii_hexdigit()) {
        return Err(anyhow!("value contains non-hex characters"));
    }

    Ok(format!("0x{}", body.to_lowercase()))
}

pub fn normalize_event(input: LogEnvelope) -> Result<BaseEventRecord> {
    let contract_address = normalize_prefixed_hex(&input.contract_address, 40)?;
    let transaction_hash = normalize_prefixed_hex(&input.transaction_hash, 64)?;

    Ok(BaseEventRecord {
        chain_id: input.chain_id,
        contract_address,
        block_number: input.block_number,
        transaction_hash: transaction_hash.clone(),
        log_index: input.log_index,
        event_name: input.event_name,
        payload: input.payload,
        tx_hash: transaction_hash,
    })
}

pub fn seed_events(chain_id: u64) -> Vec<BaseEventRecord> {
    let samples = vec![
        LogEnvelope {
            chain_id,
            contract_address: "0x1111111111111111111111111111111111111111".to_string(),
            block_number: 12_345_678,
            transaction_hash:
                "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa".to_string(),
            log_index: 0,
            event_name: "AgentRegistered".to_string(),
            payload: Map::from_iter([
                (
                    "agent_id".to_string(),
                    Value::String(
                        "0x9ccadcf0df859eb8f9dfdd87f442f8e345aceed7d0b62c6af4d72ac3e8e4d4ea"
                            .to_string(),
                    ),
                ),
                (
                    "operator_address".to_string(),
                    Value::String("0x2222222222222222222222222222222222222222".to_string()),
                ),
            ]),
        },
        LogEnvelope {
            chain_id,
            contract_address: "0x3333333333333333333333333333333333333333".to_string(),
            block_number: 12_345_700,
            transaction_hash:
                "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb".to_string(),
            log_index: 2,
            event_name: "TaskCreated".to_string(),
            payload: Map::from_iter([
                (
                    "task_id".to_string(),
                    Value::String(
                        "0xe04ee7d92d8052eb0a9e0dc5e53d79b0aa37448ceb3c5dfc8e3872596492e1b2"
                            .to_string(),
                    ),
                ),
                (
                    "payment_amount".to_string(),
                    Value::String("125000000000000000000".to_string()),
                ),
            ]),
        },
    ];

    samples
        .into_iter()
        .map(normalize_event)
        .collect::<Result<Vec<_>>>()
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::{normalize_event, LogEnvelope};
    use serde_json::{Map, Value};

    #[test]
    fn normalizes_base_event_fields() {
        let event = normalize_event(LogEnvelope {
            chain_id: 8453,
            contract_address: "0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD".to_string(),
            block_number: 42,
            transaction_hash:
                "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA".to_string(),
            log_index: 1,
            event_name: "TaskSettled".to_string(),
            payload: Map::from_iter([(
                "payment_amount".to_string(),
                Value::String("100".to_string()),
            )]),
        })
        .expect("event should normalize");

        assert_eq!(event.chain_id, 8453);
        assert_eq!(event.contract_address, "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd");
        assert_eq!(
            event.transaction_hash,
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        );
        assert_eq!(event.tx_hash, event.transaction_hash);
        assert_eq!(event.payload["payment_amount"], "100");
    }
}
