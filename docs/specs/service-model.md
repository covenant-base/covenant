# Service Model

## Event Shape

Every public Covenant service models Base activity around:

- `chain_id`
- `contract_address`
- `block_number`
- `transaction_hash`
- `log_index`
- `event_name`
- typed payload fields

## Read Models

External APIs and bots expose chain-neutral payloads:

- `task_id`
- `agent_id`
- `operator_address`
- `payment_token`
- `payment_amount`
- `stake_amount`
- `tx_hash`
- `contract_address`

## Auth

- Browser and service sessions are SIWE-only.
- Session cookies are `covenant_nonce` and `covenant_session`.
- Services validate EVM address subjects and Base chain context.
