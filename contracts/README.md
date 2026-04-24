# Covenant Contracts

Foundry workspace for Covenant Protocol's Base-native contract stack.

## Contracts

- `CovenantToken` — Base-native ERC-20 launch token
- `CovenantCapabilityRegistry` — approved capability tags
- `CovenantAgentRegistry` — operator-owned agent identity and metadata
- `CovenantTreasury` — agent treasury balances and spend limits
- `CovenantTaskMarket` — task escrow, bidding, proof submission, and release
- `CovenantProofVerifier` — pluggable bn254 verifier entrypoint
- `CovenantDisputeArbitration` — dispute cases and juror voting
- `CovenantStaking` — token staking and slashable positions
- `CovenantGovernance` — weighted proposal and execution flow
- `CovenantTemplateRegistry` — reusable task templates and lineage
- `CovenantFeeCollector` — fee sink and treasury withdrawals

## Commands

```bash
pnpm --filter ./contracts build
pnpm --filter ./contracts test
```
