# @covenant/iacp

Inter-Agent Communication Protocol bus. Redis Streams durable substrate, WebSocket gateway for clients, Fastify HTTP control plane.

Spec context: [`docs/specs/service-model.md`](../../docs/specs/service-model.md).

## Run locally

1. Start Redis: `docker run --rm -p 6379:6379 redis:7-alpine`
2. `cp .env.example .env` and edit as needed
3. `pnpm install`
4. `pnpm --filter @covenant/iacp build && pnpm --filter @covenant/iacp start`

Health: `curl :8080/healthz`. Readiness (pings Redis): `curl :8080/readyz`.

## HTTP

- `POST /publish` — body `{ "envelope": {...} }` matching the zod schema in `src/schema.ts`. Returns `{ id, stream_id }`. 429 with `retry-after` when the per-agent bucket is empty.
- `GET /healthz`, `GET /readyz`.
- `GET /metrics` — Prometheus text format. See "Metrics" below.

## Auth

Session JWTs are issued by the portal's SIWE flow and re-minted for WS use via `POST /api/auth/ws-token`. IACP verifies them with the shared HMAC secret. The `sub` claim is the operator's `0x` address.

## WebSocket

Connect to `ws://localhost:8080/ws?token=<session_jwt>`. Frames are JSON:

```
{ "type": "sub",   "topic": "task.<id>.events" }
{ "type": "unsub", "topic": "task.<id>.events" }
{ "type": "publish", "envelope": { ... } }
{ "type": "ping" }
```

Server frames: `msg`, `ack`, `reject`, `rate_limit`, `pong`.

## Rate limiting

Two token buckets guard the publish path:

- **Per-agent messages** (shared WS + REST) — default 20 burst / 5 msg/s sustained. Over-limit: WS gets a `{type:"rate_limit", axis:"msg", retry_after_ms, id}` control frame; REST gets HTTP 429 with a `retry-after` header.
- **Per-socket bandwidth** (WS only) — default 256 KiB burst / 64 KiB/s sustained, measured on raw inbound frame bytes. Over-limit: `{type:"rate_limit", axis:"bw", retry_after_ms, id}`. Reset on disconnect.

Tune with `IACP_RL_BURST`, `IACP_RL_SUSTAINED_PER_S`, `IACP_BW_BURST_BYTES`, `IACP_BW_SUSTAINED_BYTES_PER_S`. Idle buckets (full for `IACP_RL_SWEEP_MS`, default 30s) are swept.

## Metrics

`GET /metrics` exposes the prom-client registry:

- `iacp_publish_total{topic,result}` — publishes by topic category (`agent_inbox`/`task_events`/`broadcast`/`system`/`other`) and result (`ok`/`rate_limited`/`rejected`).
- `iacp_publish_duration_seconds{topic,path}` — histogram of publish latency.
- `iacp_rate_limited_total{axis,path}` — axis is `msg` or `bw`, path is `ws` or `rest`.
- `iacp_envelope_rejected_total{reason,path}` — `bad_frame` / `forbidden_topic` / `from_mismatch` / `bad_sig` / `stale_ts` / `not_active` / `bad_envelope` / `unauthorized`.
- `iacp_ws_connections` — gauge of live sockets.
- `iacp_topic_subscribers{topic}` — gauge of subscribers per topic category.
- `iacp_rate_limiter_buckets{scope}` — gauge of live buckets per scope (`msg`/`bw`).
- Default `iacp_process_*` / `iacp_nodejs_*` from `prom-client` default collectors.

Agent label was intentionally dropped from `iacp_rate_limited_total` — 32-byte pubkey cardinality at scrape intervals is unbounded; path+axis is sufficient for alerting.

## Known pre-mainnet limitations

SIWE session verification, Base-aware operator gating, envelope freshness checks, rate limiting, and Prometheus `/metrics` are the active path. Durable archival for expired streams is not part of this service yet.

Do not point this at production Redis or expose it on a public port until the readiness markers are resolved.
