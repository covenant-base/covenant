#!/usr/bin/env bash
set -euo pipefail

# TRUSTED-SETUP-DEV-ONLY
# This script produces a *local, single-contributor* Groth16 zkey purely so the dev workflow
# (prove/verify, fixture generation for spec 06) can run end-to-end without blocking on the
# real MPC ceremony. The resulting zkey and VK MUST NOT be used on mainnet. The on-chain
# VerifierKey PDA will reject any VK flagged as dev-only (see proof_verifier::is_production).

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CIRCUIT_DIR="$(cd "$HERE/.." && pwd)"
BUILD="$CIRCUIT_DIR/build"
PTAU="$BUILD/pot15_final.ptau"

mkdir -p "$BUILD"
cd "$BUILD"

if [[ ! -f "$PTAU" ]]; then
  echo "Running dev-only powers-of-tau ceremony (insecure, single contributor)..."
  npx snarkjs powersoftau new bn128 15 pot15_0000.ptau -v
  echo "dev-only-entropy-$(date +%s)" | npx snarkjs powersoftau contribute pot15_0000.ptau pot15_0001.ptau --name="covenant-dev" -v
  npx snarkjs powersoftau prepare phase2 pot15_0001.ptau "$PTAU" -v
  rm -f pot15_0000.ptau pot15_0001.ptau
fi

npx snarkjs groth16 setup task_completion.r1cs "$PTAU" task_completion_0000.zkey
echo "dev-only-phase2-$(date +%s)" | npx snarkjs zkey contribute task_completion_0000.zkey task_completion.zkey --name="covenant-dev" -v
rm -f task_completion_0000.zkey

npx snarkjs zkey export verificationkey task_completion.zkey verification_key.json

cat > verification_key.meta.json <<'EOF'
{
  "status": "dev-only",
  "warning": "Single-contributor test SRS. Not for mainnet. See circuits/README.md.",
  "ceremony": "TRUSTED-SETUP-DEV-ONLY"
}
EOF

echo "VK written to $BUILD/verification_key.json"
