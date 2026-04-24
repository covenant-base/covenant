#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CIRCUIT_DIR="$(cd "$HERE/.." && pwd)"
BUILD="$CIRCUIT_DIR/build"
INPUT="${1:-$CIRCUIT_DIR/inputs/sample_input.json}"

cd "$BUILD"
npx snarkjs groth16 fullprove \
  "$INPUT" \
  task_completion_js/task_completion.wasm \
  task_completion.zkey \
  proof.json public.json

echo "proof -> $BUILD/proof.json"
echo "public -> $BUILD/public.json"
