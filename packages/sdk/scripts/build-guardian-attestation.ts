import { createPublicClient, getAddress, http, parseAbi } from 'viem';
import {
  canonicalSettlementAttestationFromTask,
  canonicalSettlementPublicInputs,
  guardianAttestationTypedData,
  guardianVerifierConfigHash,
} from '../src/base/attestation.js';
import {
  loadDeploymentManifest,
  optionalArg,
  parseArgs,
  resolveRpcUrl,
  requiredArg,
  writeJson,
  type GuardianNetwork,
} from './_guardian.js';

const proofVerifierAbi = parseAbi([
  'function verifier() view returns (address)',
  'function verifierKeyHash() view returns (bytes32)',
]);

const guardianVerifierAbi = parseAbi([
  'function guardian() view returns (address)',
]);

const taskMarketAbi = parseAbi([
  'function tasks(bytes32 taskId) view returns (address client, bytes32 agentId, address paymentToken, uint128 paymentAmount, bytes32 taskHash, bytes32 resultHash, bytes32 proofHash, bytes32 criteriaRoot, uint64 deadline, uint64 submittedAt, uint64 disputeWindowEnd, uint8 status, address assignedBidder)',
]);

const TASK_STATUS = ['None', 'Funded', 'ProofSubmitted', 'Verified', 'Released', 'Disputed', 'Resolved'] as const;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const network = (optionalArg(args, 'network') ?? 'base') as GuardianNetwork;
  const taskId = requiredArg(args, 'task');
  const out = optionalArg(args, 'out');
  const manifest = loadDeploymentManifest(network);
  const rpcUrl = resolveRpcUrl(network, optionalArg(args, 'rpc-url'), manifest);
  const taskMarket = getAddress(optionalArg(args, 'task-market') ?? manifest.contracts.taskMarket);
  const proofVerifier = getAddress(optionalArg(args, 'proof-verifier') ?? manifest.contracts.proofVerifier);

  const client = createPublicClient({ transport: http(rpcUrl) });

  const settlementVerifier = getAddress(
    optionalArg(args, 'guardian-verifier') ??
      (await client.readContract({
        address: proofVerifier,
        abi: proofVerifierAbi,
        functionName: 'verifier',
      })),
  );

  const [guardian, verifierConfigHash, task] = await Promise.all([
    client.readContract({
      address: settlementVerifier,
      abi: guardianVerifierAbi,
      functionName: 'guardian',
    }),
    client.readContract({
      address: proofVerifier,
      abi: proofVerifierAbi,
      functionName: 'verifierKeyHash',
    }),
    client.readContract({
      address: taskMarket,
      abi: taskMarketAbi,
      functionName: 'tasks',
      args: [taskId as `0x${string}`],
    }),
  ]);

  const status = Number(task[11]);
  if (status !== 2) {
    throw new Error(`task ${taskId} is ${TASK_STATUS[status] ?? `Unknown(${status})`}, expected ProofSubmitted`);
  }

  const expectedGuardianConfigHash = guardianVerifierConfigHash(getAddress(guardian));
  if (verifierConfigHash !== expectedGuardianConfigHash) {
    throw new Error(
      `proof verifier config hash mismatch: expected ${expectedGuardianConfigHash}, found ${verifierConfigHash}`,
    );
  }

  const attestation = canonicalSettlementAttestationFromTask(taskId as `0x${string}`, {
    agentId: task[1],
    taskHash: task[4],
    resultHash: task[5],
    proofHash: task[6],
    criteriaRoot: task[7],
    deadline: task[8],
    submittedAt: task[9],
  });

  writeJson(
    {
      network,
      chainId: manifest.id,
      rpcUrl,
      taskMarket,
      proofVerifier,
      settlementVerifier,
      guardian: getAddress(guardian),
      taskStatus: {
        code: status,
        label: TASK_STATUS[status] ?? `Unknown(${status})`,
      },
      verifierConfigHash,
      expectedGuardianConfigHash,
      attestation,
      publicInputs: canonicalSettlementPublicInputs(attestation),
      typedData: guardianAttestationTypedData(manifest.id, settlementVerifier, attestation),
    },
    out,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
