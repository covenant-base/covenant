# Cutover Runbook

## Base Sepolia

1. Run `pnpm contracts:build`.
2. Export `COVENANT_GUARDIAN=<guardian-address>` if the guardian should differ from the deployer wallet.
3. Run `pnpm contracts:deploy:guardian:baseSepolia`.
4. Set `COVENANT_VERIFIER_IMPLEMENTATION=<guardian-verifier-address>`.
5. Set `COVENANT_VERIFIER_CONFIG_HASH=$(pnpm contracts:guardian:config <guardian-address>)`.
6. Run `pnpm contracts:deploy:baseSepolia`.
7. Seed capabilities with `pnpm --filter ./contracts seed:baseSepolia`.
8. Verify contract wiring with `forge script script/CovenantVerify.s.sol:CovenantVerifyScript`.
9. Point portal, discovery, bots, and integrations at the Base Sepolia manifest.

## Base Mainnet

1. Export the Base RPC plus the deployer wallet from `pk.txt`.
2. Export `COVENANT_GUARDIAN=<guardian-address>` if the guardian should differ from the deployer wallet. If omitted, the deployer is also the guardian.
3. Run `pnpm contracts:deploy:guardian:base`.
4. Read the deployed guardian verifier address from `contracts/broadcast/DeployGuardianAttestationVerifier.s.sol/8453/run-latest.json`.
5. Set `COVENANT_VERIFIER_IMPLEMENTATION=<guardian-verifier-address>`.
6. Set `COVENANT_VERIFIER_CONFIG_HASH=$(pnpm contracts:guardian:config <guardian-address>)`.
7. Run `pnpm contracts:deploy:base`.
8. Run `pnpm --filter ./contracts seed:base`.
9. Roll service envs to the new mainnet manifest.
10. Switch public domains and `.well-known` metadata.
11. Disable any retired non-Base public endpoints before announcing launch.

## Guardian Operations

1. Build the canonical settlement payload with `pnpm guardian:attestation:build --network base --task <taskId> --out /tmp/<taskId>.json`.
2. Sign it with `pnpm guardian:attestation:sign --input /tmp/<taskId>.json --pk-file /absolute/path/to/pk.txt --out /tmp/<taskId>.signed.json`.
3. Submit verification with `pnpm guardian:attestation:send --input /tmp/<taskId>.signed.json --pk-file /absolute/path/to/pk.txt`.
4. Treat `proofHash` as the hash of the off-chain evidence bundle the guardian reviewed, not the hash of the signature bytes.

## Later ZK Cutover

1. Complete the production ceremony and keep the final settlement-specific `*.zkey` plus `verification_key.json` outside git.
2. Compute `COVENANT_VERIFIER_CONFIG_HASH` from the production verification key with `pnpm contracts:vk:hash /absolute/path/to/verification_key.json`.
3. Deploy the real settlement verifier implementation.
4. Call `CovenantProofVerifier.setVerifier(<new-verifier>, <vk-hash>)` without redeploying `CovenantTaskMarket`.
5. Update operator tooling to stop using guardian signatures for new task verifications.

## Launch Posture

- This rollout is a fresh Base launch.
- Base mainnet launches with guardian-attested settlement first, then upgrades to a real zk verifier later.
- No historical state is migrated.
- Public messaging should describe Covenant as Base-native infrastructure.
