import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export type GuardianNetwork = 'base' | 'baseSepolia' | 'localBase';

export interface DeploymentManifest {
  key: GuardianNetwork;
  id: number;
  name: string;
  explorerUrl: string;
  defaultRpcUrl: string;
  contracts: {
    taskMarket: `0x${string}`;
    proofVerifier: `0x${string}`;
  };
}

export function parseArgs(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      throw new Error(`unexpected argument: ${arg}`);
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args.set(key, 'true');
      continue;
    }
    args.set(key, next);
    i++;
  }
  return args;
}

export function requiredArg(args: Map<string, string>, key: string): string {
  const value = args.get(key);
  if (!value || value === 'true') {
    throw new Error(`missing required --${key}`);
  }
  return value;
}

export function optionalArg(args: Map<string, string>, key: string): string | undefined {
  const value = args.get(key);
  return value && value !== 'true' ? value : undefined;
}

export function repoRoot(): string {
  return resolve(import.meta.dirname, '..', '..', '..');
}

export function loadDeploymentManifest(network: GuardianNetwork): DeploymentManifest {
  const path = resolve(repoRoot(), 'packages', 'config', 'deployments', `${network}.json`);
  return JSON.parse(readFileSync(path, 'utf8')) as DeploymentManifest;
}

export function resolveRpcUrl(network: GuardianNetwork, override: string | undefined, manifest: DeploymentManifest): string {
  if (override) return override;

  const envNames: Record<GuardianNetwork, string[]> = {
    base: ['BASE_RPC_URL', 'COVENANT_BASE_RPC_URL'],
    baseSepolia: ['BASE_SEPOLIA_RPC_URL', 'COVENANT_BASE_RPC_URL'],
    localBase: ['COVENANT_BASE_RPC_URL'],
  };

  for (const name of envNames[network]) {
    const value = process.env[name];
    if (value) return value;
  }

  if (!manifest.defaultRpcUrl) {
    throw new Error(`missing rpc url for ${network}`);
  }

  return manifest.defaultRpcUrl;
}

export function parseJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(path), 'utf8')) as T;
}

export function writeJson(value: unknown, outPath?: string) {
  const json = `${JSON.stringify(value, jsonReplacer, 2)}\n`;
  if (!outPath) {
    process.stdout.write(json);
    return;
  }

  const resolved = resolve(outPath);
  mkdirSync(dirname(resolved), { recursive: true });
  writeFileSync(resolved, json);
}

export function jsonReplacer(_key: string, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value;
}

export function loadPrivateKey(filePath?: string): `0x${string}` {
  const source = filePath
    ? readFileSync(resolve(filePath), 'utf8')
    : process.env.PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY ?? '';
  const trimmed = source.trim();
  const normalized = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
    throw new Error('private key must be a 32-byte hex value');
  }
  return normalized as `0x${string}`;
}

export function requireExistingFile(path: string) {
  const resolved = resolve(path);
  if (!existsSync(resolved)) {
    throw new Error(`file not found: ${resolved}`);
  }
  return resolved;
}
