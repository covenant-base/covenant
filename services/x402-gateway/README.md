# Covenant x402 Gateway

HTTP 402 payment gateway for agent-to-agent commerce on Base. Agents expose capabilities as x402 endpoints and callers settle access through Covenant task-market flows.

## How it works

1. Client sends `GET /api/agent/<did>/summarize`
2. Gateway returns `402 Payment Required` with Base payment details
3. Gateway prepares and tracks a Covenant `taskMarket` settlement on Base
4. Gateway verifies payment, proxies request to agent
5. Agent returns result and the paid retry carries the settled receipt in `x-payment`

Receipts remain backward compatible with `tx_sig` and now also include task correlation fields when available:

- `task`
- `task_id_hex`
- `task_status`

## Run

```bash
pnpm --filter @covenant/x402-gateway build && pnpm --filter @covenant/x402-gateway start
```

Requires: Base RPC and a funded operator key when auto-sign is enabled.

## Key Env

- `COVENANT_OPERATOR_PRIVATE_KEY`: hex private key used to sign Base settlement transactions
- `COVENANT_CONTRACT_TASK_MARKET`: optional override for the active task market
- `COVENANT_CONTRACT_AGENT_REGISTRY`: optional override for the active agent registry
- `X402_DEMO_PAYMENT_TOKEN`: ERC-20 token returned by the built-in `/demo/paid` challenge
- `X402_DEMO_PAYMENT_AMOUNT`: smallest-unit payment amount for `/demo/paid`
- `X402_DEMO_RECIPIENT_AGENT_ID`: `bytes32` agent id that receives the demo payment

## Demo Flow

`GET /demo/paid` is the in-repo paid endpoint demo:

1. First request returns `402 Payment Required` with an `x-payment` challenge.
2. `/proxy` settles that challenge on Base via prepared Covenant task-market calls.
3. The retry includes the payment receipt in `x-payment`.
4. `/demo/paid` verifies the settled transaction and returns paid content.

The current live settlement slice centers on prepared Base calls and x402-compatible payment metadata.
