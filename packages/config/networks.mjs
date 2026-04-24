import baseManifest from './deployments/base.json' with { type: 'json' };
import baseSepoliaManifest from './deployments/baseSepolia.json' with { type: 'json' };
import localBaseManifest from './deployments/localBase.json' with { type: 'json' };

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const covenantContractKeys = Object.freeze([
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
]);

const EMPTY_DEPLOYMENTS = Object.freeze(
  Object.fromEntries(covenantContractKeys.map((key) => [key, ZERO_ADDRESS])),
);

const MANIFESTS = Object.freeze({
  base: Object.freeze(baseManifest),
  baseSepolia: Object.freeze(baseSepoliaManifest),
  localBase: Object.freeze(localBaseManifest),
});

const BASE_NETWORKS = Object.freeze(
  Object.fromEntries(
    Object.entries(MANIFESTS).map(([key, manifest]) => [
      key,
      Object.freeze({
        key: manifest.key,
        id: manifest.id,
        name: manifest.name,
        explorerUrl: manifest.explorerUrl,
        defaultRpcUrl: manifest.defaultRpcUrl,
      }),
    ]),
  ),
);

function envNameForContract(key) {
  return `COVENANT_CONTRACT_${key.replace(/[A-Z]/g, (value) => `_${value}`).toUpperCase()}`;
}

function withFallback(raw, fallback) {
  return raw && raw.length > 0 ? raw : fallback;
}

export function defaultCovenantDeployments() {
  return { ...EMPTY_DEPLOYMENTS };
}

function manifestDeploymentsFor(network) {
  const manifest = MANIFESTS[network];
  if (!manifest) return defaultCovenantDeployments();
  return { ...EMPTY_DEPLOYMENTS, ...manifest.contracts };
}

export function resolveCovenantDeployments(env = process.env, overrides = {}, network = undefined) {
  const result = manifestDeploymentsFor(network);
  for (const key of covenantContractKeys) {
    const envValue = env[envNameForContract(key)];
    result[key] = withFallback(overrides[key], withFallback(envValue, ZERO_ADDRESS));
  }
  return result;
}

export function resolveCovenantNetwork(env = process.env, overrides = {}) {
  const selected = overrides.network ?? env.NEXT_PUBLIC_BASE_NETWORK ?? env.COVENANT_BASE_NETWORK ?? 'baseSepolia';
  const network = BASE_NETWORKS[selected] ?? BASE_NETWORKS.baseSepolia;
  const rpcUrl =
    overrides.rpcUrl ??
    env.NEXT_PUBLIC_BASE_RPC_URL ??
    env.COVENANT_BASE_RPC_URL ??
    network.defaultRpcUrl;
  return {
    ...network,
    rpcUrl,
    contracts: resolveCovenantDeployments(env, overrides.contracts ?? {}, selected),
  };
}

export { BASE_NETWORKS as covenantBaseNetworks };
