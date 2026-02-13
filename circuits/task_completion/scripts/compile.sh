#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CIRCUIT_DIR="$(cd "$HERE/.." && pwd)"
BUILD="$CIRCUIT_DIR/build"
mkdir -p "$BUILD"

if ! command -v circom >/dev/null 2>&1; then
  echo "circom not found. Install via: cargo install --git https://github.com/iden3/circom.git --tag v2.1.9" >&2
  exit 1
fi

cd "$CIRCUIT_DIR"
circom task_completion.circom \
  --r1cs --wasm --sym \
  -l "$CIRCUIT_DIR/../node_modules" \
  -o "$BUILD"

if command -v snarkjs >/dev/null 2>&1; then
  snarkjs r1cs info "$BUILD/task_completion.r1cs" | tee "$BUILD/constraints.txt"
else
  echo "snarkjs not installed; skipping r1cs info. Run: pnpm install" >&2
fi
