# Getting Started with Covenant on Base

From zero to a working Covenant/Base development environment.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22+ |
| pnpm | 10+ |
| Rust | stable |
| Foundry | latest stable |
| Docker | latest |

## Clone

```bash
git clone https://github.com/covenant-base/covenant.git
cd covenant
```

## Install dependencies

```bash
pnpm install
```

## Start local infrastructure

```bash
docker compose up -d
```

This starts Postgres and Redis with Covenant-local defaults from [`.env.example`](../.env.example).

## Build contracts and export artifacts

```bash
pnpm contracts:build
```

That step compiles the Foundry workspace and refreshes the ABI + deployment data consumed by the SDK, portal, and services.

## Verify the workspace

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm guard:public-identifiers
```

## Run the apps

```bash
pnpm --filter @covenant/portal dev
pnpm --filter @covenant/docs dev
pnpm --filter @covenant/analytics dev
```

## Run local Base deployments

```bash
pnpm contracts:deploy:local
pnpm contracts:test
```

## Run the main services

```bash
pnpm --filter @covenant/discovery build && pnpm --filter @covenant/discovery start
pnpm --filter @covenant/iacp build && pnpm --filter @covenant/iacp start
pnpm --filter @covenant/proof-gen build && pnpm --filter @covenant/proof-gen start
pnpm --filter @covenant/x402-gateway build && pnpm --filter @covenant/x402-gateway start
cd services/indexer && cargo run
```

## Where to look next

- [`docs/specs/base-runtime.md`](./specs/base-runtime.md)
- [`docs/specs/service-model.md`](./specs/service-model.md)
- [`docs/specs/cutover-runbook.md`](./specs/cutover-runbook.md)
