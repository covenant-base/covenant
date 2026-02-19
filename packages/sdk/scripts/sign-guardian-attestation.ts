import { getAddress, recoverTypedDataAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  canonicalSettlementPublicInputs,
  guardianAttestationTypedData,
} from '../src/base/attestation.js';
import { encodeVerifyTaskCalldata } from '../src/base/attestation.js';
import {
  loadPrivateKey,
  optionalArg,
  parseArgs,
  parseJsonFile,
  requireExistingFile,
  requiredArg,
  writeJson,
} from './_guardian.js';

type BuildPayload = {
  chainId: number;
  taskMarket: `0x${string}`;
  settlementVerifier: `0x${string}`;
  guardian: `0x${string}`;
  attestation: {
    taskId: `0x${string}`;
    agentId: `0x${string}`;
    taskHash: `0x${string}`;
    resultHash: `0x${string}`;
    proofHash: `0x${string}`;
    criteriaRoot: `0x${string}`;
    deadline: string;
    submittedAt: string;
  };
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = requireExistingFile(requiredArg(args, 'input'));
  const out = optionalArg(args, 'out');
  const account = privateKeyToAccount(loadPrivateKey(optionalArg(args, 'pk-file')));
  const payload = parseJsonFile<BuildPayload>(inputPath);

  const attestation = {
    ...payload.attestation,
    deadline: BigInt(payload.attestation.deadline),
    submittedAt: BigInt(payload.attestation.submittedAt),
  };
  const publicInputs = canonicalSettlementPublicInputs(attestation);
  const typedData = guardianAttestationTypedData(payload.chainId, payload.settlementVerifier, attestation);
  const signature = await account.signTypedData(typedData);
  const recoveredSigner = await recoverTypedDataAddress({ ...typedData, signature });

  if (getAddress(recoveredSigner) !== getAddress(payload.guardian)) {
    throw new Error(`signature recovered ${recoveredSigner}, expected guardian ${payload.guardian}`);
  }

  writeJson(
    {
      ...payload,
      publicInputs,
      typedData,
      signature,
      signer: account.address,
      recoveredSigner,
      verifyTaskCall: {
        to: payload.taskMarket,
        data: encodeVerifyTaskCalldata(attestation.taskId, signature, publicInputs),
        value: '0',
      },
    },
    out,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
