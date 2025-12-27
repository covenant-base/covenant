# Contributing to Covenant

Thanks for the interest. Covenant is protocol infrastructure, not a generic library, so we treat contract behavior, settlement flows, and public interfaces with the same level of review discipline.

## Before you start

- Read the [README](./README.md) for the current architecture.
- Skim [`docs/specs/service-model.md`](./docs/specs/service-model.md) for the current service model and [`ROADMAP.md`](./ROADMAP.md) for planned milestones.
- Check `packages/config/deployments/` before adding new hardcoded addresses or URLs.

## Development setup

Prerequisites: Node 22+, pnpm 10+, Rust stable, Foundry.

```bash
git clone git@github.com:covenant-base/covenant.git
cd covenant
pnpm install
```

Useful checks:

- `pnpm typecheck`
- `pnpm test`
- `pnpm --filter ./contracts test`
- `pnpm --filter ./apps/portal build`

## Where changes go

| Area | Workflow |
|---|---|
| `contracts/` | Spec → implement → unit/integration tests → security review |
| `services/` | Spec → implement → operational hardening → tests |
| `apps/`, `packages/` | Spec or issue → implement → reviewer |
| `docs/specs/`, `docs/` | Clear rationale → implement → publish with the same change |

Security-sensitive work is never a “follow-up.” If a change affects funds, signatures, auth, governance, or proofs, include the hardening in the same scope.

## Spec-first for non-trivial work

Before writing a new contract surface, service, or major product flow, add or update the relevant `docs/specs/<feature>.md` document with:

- goal and scope
- interfaces, events, and invariants
- deployment or runtime assumptions
- failure modes and rollback considerations
- concrete done criteria

## Code style

- TypeScript: Prettier + shared ESLint config in `packages/config`
- Solidity: keep contracts small, explicit, and test-first
- Rust: `cargo fmt` + `cargo clippy -- -D warnings`
- Match established patterns before introducing new abstractions
- Avoid dead code and placeholder TODOs

## Submitting changes

- Maintainers push directly to `main` by default.
- Run the relevant local checks before pushing.
- Keep scope tight and intentional.
- Include tests for the main path and the documented failure modes.
- Mention contract/address/config implications when relevant.
- Update docs and manifests in the same change when public behavior changes.
- Use a pull request only when an external contribution, a risky change, or an async review trail would benefit from one.

## Reporting bugs

- **Security-sensitive:** follow [SECURITY.md](./SECURITY.md)
- **Everything else:** open an issue with reproduction steps, affected files, and relevant logs or traces

## License

By contributing, you agree your contributions will be licensed under the [Apache License 2.0](./LICENSE).
