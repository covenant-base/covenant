# Changelog

All notable changes to Covenant are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Base-only Foundry contract workspace with deployment manifests and artifact export.
- Next.js 15 apps for the portal, docs, and analytics surfaces.
- Base-native SDK, SDK UI, and service surfaces.
- Repository standards: README, LICENSE (Apache-2.0), SECURITY, CONTRIBUTING, CODE_OF_CONDUCT, GOVERNANCE.
- GitHub templates for issues, PRs, and Dependabot configuration.

### Infrastructure
- CI workflow: lint, typecheck, build, tests, Foundry checks, and Rust indexer checks.
- Security-scan workflow: `cargo audit`, `pnpm audit`, Semgrep — runs weekly.
- Render blueprint for services + Postgres + Redis.
