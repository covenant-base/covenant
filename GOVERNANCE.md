# Governance

Covenant has two governance surfaces: the repository and the Base protocol. The repository governs code, docs, release process, and security response. The protocol governs contract parameters, treasury actions, and execution rights on Base.

## Repository governance

### Roles

- **Contributor:** anyone opening an issue or proposing a change.
- **Maintainer:** direct-to-`main` access, release authority, and security triage responsibility.
- **Lead maintainer:** resolves tie-breaks and spec-interpretation disputes when needed.

### Repository flow

- Direct pushes to `main` are the default maintainer workflow.
- Pull requests are optional and are mainly for external contributions, risky changes, or cases where a separate review artifact is useful.
- Anyone pushing to `main` is responsible for running the relevant checks first and leaving the default branch green.
- Contract, settlement, auth, proof, treasury, and signing-path changes should still get a second pair of eyes when practical, even though the repository does not require formal PR approvals by default.
- Security fixes may use a quieter path when public discussion would increase risk.

## Base protocol governance

### Upgrade authority

Covenant contracts are deployed on Base and controlled through a multisig-managed upgrade path until full governance timelocks are active.

Any production upgrade requires:

1. A change landed on `main`.
2. Reproducible contract artifacts and deployment manifests.
3. Successful CI on the affected contracts, apps, SDK surfaces, and services.
4. Multisig approval for execution.
5. Public notice except where delay would materially increase risk.

### Protocol parameters

Once governance is fully active, Covenant parameters move onchain:

- fee rates
- staking minimums and lock durations
- dispute windows
- treasury spend limits
- approved templates and operator policies

The governance contract and the deployment multisig remain distinct controls. Governance should not silently bypass release review, and the release path should not silently override governance-set values.

## Security-sensitive actions

The following actions require heightened review:

- contract upgrades
- treasury withdrawals or sweep-policy changes
- proof-verification key rotation
- auth/session changes
- bridge or gateway settlement policy changes

## Changing this document

Material changes to governance require maintainer sign-off and advance notice in the repository.
