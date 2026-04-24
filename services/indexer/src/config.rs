#[derive(Debug, Clone)]
pub struct AppConfig {
    pub bind_addr: String,
    pub base_rpc_url: String,
    pub chain_id: u64,
    pub confirmations: u64,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self {
            bind_addr: std::env::var("INDEXER_BIND_ADDR")
                .unwrap_or_else(|_| "0.0.0.0:8080".to_string()),
            base_rpc_url: std::env::var("BASE_RPC_URL")
                .unwrap_or_else(|_| "https://mainnet.base.org".to_string()),
            chain_id: std::env::var("BASE_CHAIN_ID")
                .ok()
                .and_then(|value| value.parse().ok())
                .unwrap_or(8453),
            confirmations: std::env::var("BASE_CONFIRMATIONS")
                .ok()
                .and_then(|value| value.parse().ok())
                .unwrap_or(12),
        }
    }
}
