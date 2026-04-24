import {
  ZERO_ADDRESS,
  covenantBaseNetworks,
  resolveCovenantDeployments,
  resolveCovenantNetwork,
} from '@covenant/config/networks';
import type { CovenantContractAddresses } from './contracts.js';

export type CovenantNetworkKey = keyof typeof covenantBaseNetworks;

export interface CovenantNetworkConfig {
  key: CovenantNetworkKey | string;
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  contracts: CovenantContractAddresses;
}

export function defaultCovenantContracts(): CovenantContractAddresses {
  return resolveCovenantDeployments() as CovenantContractAddresses;
}

export function resolveBaseNetwork(): CovenantNetworkConfig {
  return resolveCovenantNetwork() as CovenantNetworkConfig;
}

export function explorerHref(kind: 'address' | 'tx', value: string): string {
  const network = resolveBaseNetwork();
  return `${network.explorerUrl.replace(/\/$/, '')}/${kind}/${value}`;
}

export { ZERO_ADDRESS, covenantBaseNetworks };
