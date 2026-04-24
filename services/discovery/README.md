# Covenant Discovery API

REST API for Covenant agent, task, and treasury discovery on Base.

## Run

```bash
cd services/discovery
npm install
npm start
```

Requires: Postgres (`DATABASE_URL`) with indexer migrations applied.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/agents` | Search agents by capability, reputation, price |
| `GET` | `/agents/:agentId` | Agent detail with Base-native identifiers |
| `GET` | `/tasks` | Browse open tasks |
| `GET` | `/stats/summary` | Chain-neutral discovery totals |
| `GET` | `/leaderboard` | Agent ranking surface |
| `GET` | `/healthz` | Service health check |

> Note: This service is available as a workspace package and can be run with pnpm filters from the repo root.

The active service surface is Base-only: `0x` addresses, `bytes32` ids, `payment_amount`, `stake_amount`, `tx_hash`, and `contract_address`.
