import type { Groth16Proof } from 'snarkjs';

const UINT256_MAX = (1n << 256n) - 1n;

function normalizeField(value: string | number | bigint): bigint {
  const normalized = BigInt(value);
  if (normalized < 0n || normalized > UINT256_MAX) {
    throw new Error(`field element out of uint256 range: ${value}`);
  }
  return normalized;
}

function padWord(value: bigint): string {
  return value.toString(16).padStart(64, '0');
}

function requireLength(name: string, actual: number, expected: number) {
  if (actual !== expected) {
    throw new Error(`${name} length mismatch: expected ${expected}, got ${actual}`);
  }
}

export function toBytes32Hex(value: string | number | bigint): `0x${string}` {
  return `0x${padWord(normalizeField(value))}`;
}

export function encodePublicInputsBytes32(publicSignals: Array<string | number | bigint>): Array<`0x${string}`> {
  return publicSignals.map(toBytes32Hex);
}

export function encodeGroth16ProofBytes(proof: Groth16Proof): `0x${string}` {
  requireLength('proof.pi_a', proof.pi_a.length, 3);
  requireLength('proof.pi_b', proof.pi_b.length, 3);
  requireLength('proof.pi_c', proof.pi_c.length, 3);
  requireLength('proof.pi_b[0]', proof.pi_b[0]?.length ?? 0, 2);
  requireLength('proof.pi_b[1]', proof.pi_b[1]?.length ?? 0, 2);

  const words = [
    normalizeField(proof.pi_a[0]),
    normalizeField(proof.pi_a[1]),
    normalizeField(proof.pi_b[0][1]),
    normalizeField(proof.pi_b[0][0]),
    normalizeField(proof.pi_b[1][1]),
    normalizeField(proof.pi_b[1][0]),
    normalizeField(proof.pi_c[0]),
    normalizeField(proof.pi_c[1]),
  ];

  return `0x${words.map(padWord).join('')}`;
}
