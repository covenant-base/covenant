# Security Policy

Covenant treats anything that can move value, alter execution rights, or affect protocol integrity as in scope for responsible disclosure.

## Supported versions

Pre-mainnet: the latest `main` branch is in scope.

Post-launch: the latest deployed contract release and the immediately previous release remain in scope during the rollout window.

## Reporting a vulnerability

Do not open a public issue for anything that could compromise funds, keys, governance, proofs, or settlement integrity.

Preferred channels:

1. **GitHub private advisory:** [github.com/covenant-base/covenant/security/advisories/new](https://github.com/covenant-base/covenant/security/advisories/new)
2. **Email:** [security@covenantbase.com](mailto:security@covenantbase.com)

Include:

- affected contract, service, route, or package
- impact and realistic attacker outcome
- minimal repro or transaction sequence
- suggested mitigation, if available

We aim to acknowledge within 48 hours and share an initial triage decision within 7 days.

## Scope

### In scope

- Base contracts in `contracts/`
- proof generation and verification paths
- auth/session signing flows
- services that prepare, sign, relay, or verify protocol actions
- SDK/client helpers that could cause incorrect settlement or loss of funds

### Out of scope

- spelling and copy issues
- read-only UI bugs that do not affect signing or value movement
- third-party vulnerabilities that should be reported upstream
- attacks requiring prior compromise of a user wallet or signing device

## Severity

| Severity | Example |
|---|---|
| Critical | direct fund loss, unauthorized upgrade or execution, proof forgery |
| High | unauthorized state transition, settlement bypass, serious economic abuse |
| Medium | logic flaw without direct loss of funds |
| Low | defense-in-depth or hardening issue |

Severity is assigned by Covenant maintainers after triage.
