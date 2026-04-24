import { ZERO_ADDRESS } from '@covenant/config/networks';
import { covenantContractAbis } from '../generated/contracts.js';

export const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
export const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;

export const COVENANT_CONTRACTS = [
  'agentRegistry',
  'capabilityRegistry',
  'treasury',
  'taskMarket',
  'proofVerifier',
  'disputeArbitration',
  'governance',
  'feeCollector',
  'staking',
  'templateRegistry',
  'token',
] as const;

export type CovenantContractName = (typeof COVENANT_CONTRACTS)[number];

export interface CovenantContractAddresses {
  agentRegistry: `0x${string}`;
  capabilityRegistry: `0x${string}`;
  treasury: `0x${string}`;
  taskMarket: `0x${string}`;
  proofVerifier: `0x${string}`;
  disputeArbitration: `0x${string}`;
  governance: `0x${string}`;
  feeCollector: `0x${string}`;
  staking: `0x${string}`;
  templateRegistry: `0x${string}`;
  token: `0x${string}`;
}

export const EMPTY_CONTRACT_ADDRESSES: CovenantContractAddresses = {
  agentRegistry: ZERO_ADDRESS,
  capabilityRegistry: ZERO_ADDRESS,
  treasury: ZERO_ADDRESS,
  taskMarket: ZERO_ADDRESS,
  proofVerifier: ZERO_ADDRESS,
  disputeArbitration: ZERO_ADDRESS,
  governance: ZERO_ADDRESS,
  feeCollector: ZERO_ADDRESS,
  staking: ZERO_ADDRESS,
  templateRegistry: ZERO_ADDRESS,
  token: ZERO_ADDRESS,
};

export function isConfiguredAddress(value?: string | null): value is `0x${string}` {
  return Boolean(value && value.toLowerCase() !== ZERO_ADDRESS.toLowerCase());
}

export function getContractAbi(name: CovenantContractName) {
  return covenantContractAbis[name];
}

export function truncateAddress(address?: string | null, width = 4): string {
  if (!address) return 'Not configured';
  return `${address.slice(0, width + 2)}...${address.slice(-width)}`;
}

export function normalizeHexData(input: string): `0x${string}` | null {
  const trimmed = input.trim().replace(/\s+/g, '');
  if (trimmed.length === 0) return '0x';
  const normalized = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
  const body = normalized.slice(2);
  if (body.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(body)) return null;
  return normalized as `0x${string}`;
}

export function normalizeBytes32(input: string): `0x${string}` | null {
  const normalized = normalizeHexData(input);
  if (!normalized) return null;
  return normalized.length === 66 ? normalized : null;
}
