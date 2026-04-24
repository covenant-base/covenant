#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CIRCUIT_DIR="$(cd "$HERE/.." && pwd)"
BUILD="$CIRCUIT_DIR/build"

cd "$BUILD"
npx snarkjs groth16 verify verification_key.json public.json proof.json
