# @covenant/sdk

TypeScript SDK for Covenant Protocol on Base. The root surface is Base-only and contract-driven.

## Install

```bash
pnpm add @covenant/sdk
```

> Not yet published to npm. Use `workspace:*` within the monorepo.

## Quick start

```typescript
import {
  resolveBaseNetwork,
  prepareRegisterAgentCall,
  prepareCreateTaskCalls,
  bytes32FromText,
} from '@covenant/sdk';

const network = resolveBaseNetwork();
const register = prepareRegisterAgentCall({
  name: 'Covenant Alpha',
  metadataUri: 'https://covenantbase.com/agents/alpha.json',
  capabilityBitmap: 7n,
});

const task = prepareCreateTaskCalls({
  agentId: bytes32FromText('covenant.alpha'),
  description: 'Ship the Base launch checklist',
  amount: '125',
  deadline: BigInt(Math.floor(Date.now() / 1000) + 86_400),
});
```

## Modules

| Module | Description |
|--------|-------------|
| `base/network` | Base network and deployment-manifest helpers |
| `base/contracts` | typed address maps and ABI lookups |
| `base/transactions` | transaction-prep helpers for contract writes |
| `auth/siwe` | SIWE message formatting |
| `auth/session` | Session token management |
| `discovery/types` | chain-neutral discovery payloads |
| `data/mock` | local fixtures for apps and services |

## Generating types

ABIs and contract metadata are exported from Foundry artifacts. To regenerate:

```bash
pnpm contracts:build
pnpm --filter @covenant/sdk generate
```
