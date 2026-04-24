#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const contractsDir = join(root, 'contracts');
const network = process.argv[2];

const NETWORKS = {
  localBase: {
    rpcEnvNames: ['COVENANT_BASE_RPC_URL'],
    privateKeyEnvNames: ['LOCAL_PRIVATE_KEY', 'PRIVATE_KEY', 'DEPLOYER_PRIVATE_KEY'],
    defaultPrivateKey:
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  baseSepolia: {
    rpcEnvNames: ['BASE_SEPOLIA_RPC_URL', 'COVENANT_BASE_RPC_URL'],
    privateKeyEnvNames: ['PRIVATE_KEY', 'DEPLOYER_PRIVATE_KEY'],
  },
  base: {
    rpcEnvNames: ['BASE_RPC_URL', 'COVENANT_BASE_RPC_URL'],
    privateKeyEnvNames: ['PRIVATE_KEY', 'DEPLOYER_PRIVATE_KEY'],
  },
};

function die(message) {
  console.error(message);
  process.exit(1);
}

function firstEnv(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.length > 0) return value;
  }
  return null;
}

if (!network || !(network in NETWORKS)) {
  die('usage: node scripts/seed-base-network.mjs <localBase|baseSepolia|base>');
}

const manifestPath = join(root, 'packages', 'config', 'deployments', `${network}.json`);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const capabilityRegistry = manifest?.contracts?.capabilityRegistry;

if (!capabilityRegistry || capabilityRegistry === '0x0000000000000000000000000000000000000000') {
  die(`missing capabilityRegistry address in ${manifestPath}`);
}

const config = NETWORKS[network];
const rpcUrl = firstEnv(config.rpcEnvNames) ?? manifest.defaultRpcUrl;
const privateKey = firstEnv(config.privateKeyEnvNames) ?? config.defaultPrivateKey ?? null;

if (!rpcUrl) {
  die(`missing rpc url for ${network}`);
}

if (!privateKey) {
  die(`missing private key for ${network}`);
}

const result = spawnSync(
  'forge',
  [
    'script',
    'script/CovenantSeed.s.sol:CovenantSeedScript',
    '--rpc-url',
    rpcUrl,
    '--broadcast',
    '--private-key',
    privateKey,
  ],
  {
    cwd: contractsDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      COVENANT_CAPABILITY_REGISTRY: capabilityRegistry,
    },
  },
);

process.exit(result.status ?? 1);
