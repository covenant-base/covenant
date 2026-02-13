# Covenant Circuit Catalog

This folder holds machine-readable manifests for proof circuits and their artifact conventions.

## Naming

- Artifact stem: `<slug>-v<version>`
- Manifest path: `circuits/catalog/<slug>-v<version>.json`
- Verifier ids:
  - `groth16-bn254`
  - `ezkl`

## Purpose

The catalog is the stable metadata layer shared across:

- `proof-gen` job routing
- `proof_verifier` verification-key inventory
- portal documentation and operator tooling
- future benchmark and artifact publication workflows

## Manifest fields

- `slug`: stable machine name
- `displayName`: human-readable label
- `lifecycle`: `live`, `planned`, or `research`
- `version`: manifest and artifact version
- `verifier`: verification-key family
- `publicInputs`: ordered list used by verifiers and tooling
- `summary`: concise description of what the circuit proves
