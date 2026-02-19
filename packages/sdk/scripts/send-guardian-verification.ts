import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
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

type SignedPayload = {
  network: string;
  chainId: number;
  rpcUrl: string;
  taskMarket: `0x${string}`;
  attestation: {
    taskId: `0x${string}`;
  };
  publicInputs: [
    `0x${string}`,
    `0x${string}`,
    `0x${string}`,
    `0x${string}`,
    `0x${string}`,
    `0x${string}`,
    `0x${string}`,
    `0x${string}`,
  ];
  signature: `0x${string}`;
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = requireExistingFile(requiredArg(args, 'input'));
  const payload = parseJsonFile<SignedPayload>(inputPath);
  const account = privateKeyToAccount(loadPrivateKey(optionalArg(args, 'pk-file')));
  const rpcUrl = optionalArg(args, 'rpc-url') ?? payload.rpcUrl;

  const publicClient = createPublicClient({ transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, transport: http(rpcUrl) });
  const data = encodeVerifyTaskCalldata(payload.attestation.taskId, payload.signature, payload.publicInputs);

  const txHash = await walletClient.sendTransaction({
    account,
    to: payload.taskMarket,
    data,
    value: 0n,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  writeJson({
    network: payload.network,
    chainId: payload.chainId,
    taskMarket: payload.taskMarket,
    taskId: payload.attestation.taskId,
    sender: account.address,
    txHash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
    status: receipt.status,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
