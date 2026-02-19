import { describe, expect, it } from 'vitest';
import { getAddress, keccak256, stringToHex, toFunctionSelector } from 'viem';
import {
  canonicalSettlementPublicInputs,
  encodeVerifyTaskCalldata,
  guardianAttestationTypedData,
  guardianVerifierConfigHash,
} from '../base/attestation.js';

describe('guardian attestation helpers', () => {
  const attestation = {
    taskId: `0x${'11'.repeat(32)}`,
    agentId: `0x${'22'.repeat(32)}`,
    taskHash: `0x${'33'.repeat(32)}`,
    resultHash: `0x${'44'.repeat(32)}`,
    proofHash: `0x${'55'.repeat(32)}`,
    criteriaRoot: `0x${'66'.repeat(32)}`,
    deadline: 1234n,
    submittedAt: 5678n,
  } as const;

  it('builds canonical settlement public inputs in the required order', () => {
    expect(canonicalSettlementPublicInputs(attestation)).toEqual([
      attestation.taskId,
      attestation.agentId,
      attestation.taskHash,
      attestation.resultHash,
      attestation.proofHash,
      attestation.criteriaRoot,
      `0x${'0'.repeat(60)}04d2`,
      `0x${'0'.repeat(60)}162e`,
    ]);
  });

  it('binds guardian typed data to chain id and verifying contract', () => {
    const typedData = guardianAttestationTypedData(8453, '0x1234567890123456789012345678901234567890', attestation);

    expect(typedData.domain).toEqual({
      name: 'CovenantGuardianAttestationVerifier',
      version: '1',
      chainId: 8453,
      verifyingContract: '0x1234567890123456789012345678901234567890',
    });
    expect(typedData.message.deadline).toBe(`0x${'0'.repeat(60)}04d2`);
    expect(typedData.message.submittedAt).toBe(`0x${'0'.repeat(60)}162e`);
  });

  it('derives the opaque guardian verifier config hash from a canonical address string', () => {
    const guardian = '0x000000000000000000000000000000000000a11c';

    expect(guardianVerifierConfigHash(guardian)).toBe(
      keccak256(stringToHex(`guardian-attestation-v1:${getAddress(guardian)}`)),
    );
  });

  it('encodes verifyTask calldata without manual public-input ordering', () => {
    const calldata = encodeVerifyTaskCalldata(
      attestation.taskId,
      '0x1234',
      canonicalSettlementPublicInputs(attestation),
    );

    expect(calldata.startsWith(toFunctionSelector('verifyTask(bytes32,bytes,bytes32[])'))).toBe(true);
  });
});
