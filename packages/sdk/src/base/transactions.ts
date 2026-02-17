import { encodeFunctionData, keccak256, stringToHex, parseAbi, parseUnits } from 'viem';
import { covenantBrand } from '@covenant/config/brand';
import { defaultCovenantContracts, resolveBaseNetwork } from './network.js';
import { getContractAbi, normalizeBytes32 } from './contracts.js';
import { encodeVerifyTaskCalldata, type CanonicalSettlementPublicInputs } from './attestation.js';

export interface PreparedTransactionCall {
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
  label: string;
}

export interface PreparedTransactionBundle {
  chainId: number;
  network: string;
  calls: PreparedTransactionCall[];
}

export interface RegisterAgentInput {
  agentId?: `0x${string}`;
  name: string;
  metadataUri: string;
  capabilityBitmap: bigint;
}

export interface CreateTaskInput {
  taskId?: `0x${string}`;
  agentId: `0x${string}`;
  description: string;
  amount: string;
  deadline: bigint;
}

export interface VerifyTaskInput {
  taskId: `0x${string}`;
  proof: `0x${string}`;
  publicInputs: CanonicalSettlementPublicInputs;
  taskMarket?: `0x${string}`;
}

const erc20Abi = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
]);

export function bytes32FromText(value: string): `0x${string}` {
  return keccak256(stringToHex(value));
}

export function prepareRegisterAgentCall(input: RegisterAgentInput): PreparedTransactionBundle {
  const network = resolveBaseNetwork();
  const contracts = defaultCovenantContracts();
  const agentId = input.agentId ?? bytes32FromText(input.name.toLowerCase());
  const abi = getContractAbi('agentRegistry');

  return {
    chainId: network.id,
    network: network.name,
    calls: [
      {
        to: contracts.agentRegistry,
        data: encodeFunctionData({
          abi,
          functionName: 'registerAgent',
          args: [agentId, input.metadataUri, input.capabilityBitmap],
        }),
        value: '0',
        label: 'Register agent',
      },
    ],
  };
}

export function prepareCreateTaskCalls(input: CreateTaskInput): PreparedTransactionBundle {
  const network = resolveBaseNetwork();
  const contracts = defaultCovenantContracts();
  const taskId = input.taskId ?? bytes32FromText(`${input.description}:${input.agentId}`);
  const paymentAmount = parseUnits(input.amount, covenantBrand.token.decimals);
  const taskAbi = getContractAbi('taskMarket');

  return {
    chainId: network.id,
    network: network.name,
    calls: [
      {
        to: contracts.token,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [contracts.taskMarket, paymentAmount],
        }),
        value: '0',
        label: `Approve ${covenantBrand.token.symbol}`,
      },
      {
        to: contracts.taskMarket,
        data: encodeFunctionData({
          abi: taskAbi,
          functionName: 'createTask',
          args: [
            taskId,
            normalizeBytes32(input.agentId) ?? input.agentId,
            contracts.token,
            paymentAmount,
            bytes32FromText(input.description),
            bytes32FromText(`criteria:${input.description}`),
            input.deadline,
          ],
        }),
        value: '0',
        label: 'Create task',
      },
    ],
  };
}

export function prepareStakeCall(amount: string, lockDuration: bigint): PreparedTransactionBundle {
  const network = resolveBaseNetwork();
  const contracts = defaultCovenantContracts();
  const value = parseUnits(amount, covenantBrand.token.decimals);
  const stakingAbi = getContractAbi('staking');

  return {
    chainId: network.id,
    network: network.name,
    calls: [
      {
        to: contracts.token,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [contracts.staking, value],
        }),
        value: '0',
        label: `Approve ${covenantBrand.token.symbol}`,
      },
      {
        to: contracts.staking,
        data: encodeFunctionData({
          abi: stakingAbi,
          functionName: 'stake',
          args: [value, lockDuration],
        }),
        value: '0',
        label: 'Stake COV',
      },
    ],
  };
}

export function prepareGovernanceVoteCall(proposalId: bigint, support: boolean): PreparedTransactionBundle {
  const network = resolveBaseNetwork();
  const contracts = defaultCovenantContracts();
  const governanceAbi = getContractAbi('governance');

  return {
    chainId: network.id,
    network: network.name,
    calls: [
      {
        to: contracts.governance,
        data: encodeFunctionData({
          abi: governanceAbi,
          functionName: 'vote',
          args: [proposalId, support],
        }),
        value: '0',
        label: support ? 'Vote for proposal' : 'Vote against proposal',
      },
    ],
  };
}

export function prepareVerifyTaskCall(input: VerifyTaskInput): PreparedTransactionBundle {
  const network = resolveBaseNetwork();
  const contracts = defaultCovenantContracts();
  const taskMarket = input.taskMarket ?? contracts.taskMarket;

  return {
    chainId: network.id,
    network: network.name,
    calls: [
      {
        to: taskMarket,
        data: encodeVerifyTaskCalldata(input.taskId, input.proof, input.publicInputs),
        value: '0',
        label: 'Verify task',
      },
    ],
  };
}
