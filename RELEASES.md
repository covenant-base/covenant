# Releases

Covenant releases are versioned snapshots of contracts, services, packages, docs, and deployment metadata.

## Versioning

- Public packages follow SemVer.
- Contract deployments are tracked by network manifest, commit SHA, and artifact digest.
- Breaking protocol changes require a spec update, migration notes, and maintainer approval.

## Release checklist

- `pnpm typecheck`
- `pnpm test`
- `pnpm --filter ./contracts test`
- `pnpm build`
- `pnpm size`
- `pnpm guard:public-identifiers`
- ABI and deployment manifest review for contract changes.
- Security review notes for auth, signing, x402, proof, governance, or settlement changes.

## Publishing

Releases should include a concise summary, upgrade notes, test evidence, and links to deployment manifests or package artifacts. Do not publish generated artifacts that are not reproducible from the tagged source tree.
