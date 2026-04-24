export type HexAddress = `0x${string}`;

export type CovenantContractKey =
  | 'agentRegistry'
  | 'capabilityRegistry'
  | 'treasury'
  | 'taskMarket'
  | 'proofVerifier'
  | 'disputeArbitration'
  | 'governance'
  | 'feeCollector'
  | 'staking'
  | 'templateRegistry'
  | 'token';

export type CovenantDeployments = Record<CovenantContractKey, HexAddress>;

export interface CovenantNetwork {
  key: string;
  id: number;
  name: string;
  explorerUrl: string;
  defaultRpcUrl: string;
}

export declare const ZERO_ADDRESS: HexAddress;
export declare const covenantContractKeys: readonly CovenantContractKey[];
export declare const covenantBaseNetworks: Record<string, Readonly<CovenantNetwork>>;
export function defaultCovenantDeployments(): CovenantDeployments;
export function resolveCovenantDeployments(
  env?: Record<string, string | undefined>,
  overrides?: Partial<CovenantDeployments>,
): CovenantDeployments;
export function resolveCovenantNetwork(
  env?: Record<string, string | undefined>,
  overrides?: {
    network?: string;
    rpcUrl?: string;
    contracts?: Partial<CovenantDeployments>;
  },
): CovenantNetwork & { rpcUrl: string; contracts: CovenantDeployments };
