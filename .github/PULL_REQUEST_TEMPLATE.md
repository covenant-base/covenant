<!-- Optional workflow: maintainers usually push directly to main. Use this template when a PR is the right collaboration artifact. -->

## Summary

<!-- One paragraph: what changed and why. Reference the issue or spec. -->

Implements: `docs/specs/<feature>.md`

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation / spec only
- [ ] Infrastructure / tooling

## Contributor declaration

- [ ] I have described the work honestly and included known tradeoffs, limitations, and follow-up risks.
- [ ] I did not include secrets, private keys, customer data, or non-public operational details.
- [ ] I disclosed AI-assisted contributions where they materially influenced generated code, tests, or prose.
- [ ] I confirm this change is intended for public release under the repository license.

## On-chain checklist (required if `contracts/` or `circuits/` changed)

- [ ] Spec is already merged, or is included alongside this change, and the implementation matches it
- [ ] Unit tests cover happy path + every documented failure mode
- [ ] Foundry tests pass locally
- [ ] Gas and event surfaces were reviewed for regressions
- [ ] No unchecked admin or settlement path was introduced
- [ ] Events emitted for every state transition
- [ ] Invariants doc updated if new ones introduced

### Contract delta

```
before: <surface>: <value>
after:  <surface>: <value>
```

### New protocol dependencies

<!-- List any new contract/service/crate this code now depends on. "None" is a valid answer. -->

## Circuit checklist (if `circuits/` changed)

- [ ] Constraint count measured and within spec budget
- [ ] Public input ordering documented and stable
- [ ] Test vectors included
- [ ] Trusted-setup impact noted (new circuit? parameter change?)

## Test plan

<!-- How a reviewer can validate this locally. Commands, not prose. -->

- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm --filter ./contracts test`
- [ ] Additional checks are listed below, or not applicable with rationale.

## Security review

- [ ] No auth, signing, payment, settlement, governance, proof, or x402 trust boundary changed.
- [ ] Security-sensitive changes include failure-mode tests and reviewer notes.
- [ ] New dependencies, GitHub Actions, and external services were reviewed for supply-chain risk.

## Related

<!-- Issues, prior PRs, security findings. -->
