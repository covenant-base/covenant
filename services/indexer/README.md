# covenant-indexer

Rust service that normalizes Covenant/Base contract events into a chain-neutral event model keyed by:

- `chain_id`
- `contract_address`
- `block_number`
- `transaction_hash`
- `log_index`
- `event_name`
- typed event payload fields

## Run locally

```bash
cp .env.example .env
cargo run
```

Health: `curl localhost:8080/healthz`

Summary: `curl localhost:8080/stats/summary`

Events: `curl localhost:8080/events`

## Config

| Env | Default | Notes |
|---|---|---|
| `BASE_RPC_URL` | `https://mainnet.base.org` | Base RPC endpoint |
| `BASE_CHAIN_ID` | `8453` | `8453` for Base, `84532` for Base Sepolia |
| `BASE_CONFIRMATIONS` | `12` | Confirmation depth for indexing policies |
| `INDEXER_BIND_ADDR` | `0.0.0.0:8080` | HTTP bind address |

## Event model

The active payload surface is Base-only and chain-neutral:

- `task_id`
- `agent_id`
- `operator_address`
- `payment_token`
- `payment_amount`
- `stake_amount`
- `tx_hash`
- `contract_address`

## Deploy

The Dockerfile builds a single `covenant-indexer` binary and serves the HTTP API from the same image.
