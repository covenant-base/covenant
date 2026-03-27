# Covenant Compute Broker

Attestation and lease-lifecycle service for DePIN-backed compute tasks. The broker reserves
compute with a supported provider, signs lease attestations for on-chain bond posting, and
drives the off-chain activation, reclaim, and expiry-sweep paths needed by the compute-bond
roadmap.

## Run

```bash
pnpm --filter @covenant/compute-broker build && pnpm --filter @covenant/compute-broker start
```

## Status

M2 (research) implementation: request/cancel/activate/reclaim/status/expiry-sweep endpoints
are live. Production provider partnerships and on-chain compute-bond enforcement are pending.

## HTTP surface

- `POST /bonds/request` — reserve provider capacity and sign a broker attestation
- `POST /bonds/cancel` — cancel a reservation with an agent-signed request
- `POST /leases/activate` — mark a reserved lease active after task lock-in
- `POST /leases/reclaim` — reclaim a lease after slash/release handling
- `POST /leases/expire-sweep` — sweep expired leases whose slashable window elapsed
- `GET /leases/:id` — inspect provider lease status
