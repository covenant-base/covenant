# Base Runtime

## Summary

Covenant is a Base-only protocol. Active runtime components resolve a single chain model:

- `chain_id`
- `rpc_url`
- `explorer_url`
- `contract_addresses`
- token metadata

## Deployment Model

- Local development targets `localBase` on Anvil.
- Staging targets `baseSepolia`.
- Production targets `base`.
- Deployments are emitted from Foundry broadcasts and synchronized into `packages/config/deployments/*.json`.

## Contract Surface

- `CovenantAgentRegistry`
- `CovenantCapabilityRegistry`
- `CovenantTreasury`
- `CovenantTaskMarket`
- `CovenantProofVerifier`
- `CovenantDisputeArbitration`
- `CovenantStaking`
- `CovenantGovernance`
- `CovenantTemplateRegistry`
- `CovenantFeeCollector`
- `CovenantToken`
