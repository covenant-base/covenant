import { encodeFunctionData, getAddress, keccak256, padHex, stringToHex, toHex } from 'viem';
import { getContractAbi } from './contracts.js';

export const GUARDIAN_ATTESTATION_DOMAIN_NAME = 'CovenantGuardianAttestationVerifier';
export const GUARDIAN_ATTESTATION_DOMAIN_VERSION = '1';

export const guardianAttestationTypes = {
  SettlementAttestation: [
    { name: 'taskId', type: 'bytes32' },
    { name: 'agentId', type: 'bytes32' },
    { name: 'taskHash', type: 'bytes32' },
    { name: 'resultHash', type: 'bytes32' },
    { name: 'proofHash', type: 'bytes32' },
    { name: 'criteriaRoot', type: 'bytes32' },
    { name: 'deadline', type: 'bytes32' },
    { name: 'submittedAt', type: 'bytes32' },
  ],
} as const;

export interface CanonicalSettlementAttestation {
  taskId: `0x${string}`;
  agentId: `0x${string}`;
  taskHash: `0x${string}`;
  resultHash: `0x${string}`;
  proofHash: `0x${string}`;
  criteriaRoot: `0x${string}`;
  deadline: bigint;
  submittedAt: bigint;
}

export interface CanonicalSettlementTaskRecord {
  agentId: `0x${string}`;
  taskHash: `0x${string}`;
  resultHash: `0x${string}`;
  proofHash: `0x${string}`;
  criteriaRoot: `0x${string}`;
  deadline: bigint;
  submittedAt: bigint;
}

export type CanonicalSettlementPublicInputs = readonly [
  `0x${string}`,
  `0x${string}`,
  `0x${string}`,
  `0x${string}`,
  `0x${string}`,
  `0x${string}`,
  `0x${string}`,
  `0x${string}`,
];

const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;

function assertBytes32(name: string, value: string): `0x${string}` {
  if (!BYTES32_REGEX.test(value)) {
    throw new Error(`${name} must be a 32-byte hex value`);
  }
  return value as `0x${string}`;
}

function toBytes32(value: bigint): `0x${string}` {
  return padHex(toHex(value), { size: 32 });
}

export function canonicalSettlementAttestationFromTask(
  taskId: `0x${string}`,
  task: CanonicalSettlementTaskRecord,
): CanonicalSettlementAttestation {
  return {
    taskId: assertBytes32('taskId', taskId),
    agentId: assertBytes32('agentId', task.agentId),
    taskHash: assertBytes32('taskHash', task.taskHash),
    resultHash: assertBytes32('resultHash', task.resultHash),
    proofHash: assertBytes32('proofHash', task.proofHash),
    criteriaRoot: assertBytes32('criteriaRoot', task.criteriaRoot),
    deadline: BigInt(task.deadline),
    submittedAt: BigInt(task.submittedAt),
  };
}

export function canonicalSettlementPublicInputs(
  attestation: CanonicalSettlementAttestation,
): CanonicalSettlementPublicInputs {
  return [
    assertBytes32('taskId', attestation.taskId),
    assertBytes32('agentId', attestation.agentId),
    assertBytes32('taskHash', attestation.taskHash),
    assertBytes32('resultHash', attestation.resultHash),
    assertBytes32('proofHash', attestation.proofHash),
    assertBytes32('criteriaRoot', attestation.criteriaRoot),
    toBytes32(BigInt(attestation.deadline)),
    toBytes32(BigInt(attestation.submittedAt)),
  ];
}

export function guardianAttestationTypedData(
  chainId: number,
  verifyingContract: `0x${string}`,
  attestation: CanonicalSettlementAttestation,
) {
  const publicInputs = canonicalSettlementPublicInputs(attestation);
  return {
    domain: {
      name: GUARDIAN_ATTESTATION_DOMAIN_NAME,
      version: GUARDIAN_ATTESTATION_DOMAIN_VERSION,
      chainId,
      verifyingContract: getAddress(verifyingContract),
    },
    primaryType: 'SettlementAttestation' as const,
    types: guardianAttestationTypes,
    message: {
      taskId: publicInputs[0],
      agentId: publicInputs[1],
      taskHash: publicInputs[2],
      resultHash: publicInputs[3],
      proofHash: publicInputs[4],
      criteriaRoot: publicInputs[5],
      deadline: publicInputs[6],
      submittedAt: publicInputs[7],
    },
  };
}

export function guardianVerifierConfigHash(guardianAddress: `0x${string}`): `0x${string}` {
  return keccak256(stringToHex(`guardian-attestation-v1:${getAddress(guardianAddress)}`));
}

export function encodeVerifyTaskCalldata(
  taskId: `0x${string}`,
  proof: `0x${string}`,
  publicInputs: CanonicalSettlementPublicInputs,
): `0x${string}` {
  return encodeFunctionData({
    abi: getContractAbi('taskMarket'),
    functionName: 'verifyTask',
    args: [assertBytes32('taskId', taskId), proof, [...publicInputs]],
  });
}
