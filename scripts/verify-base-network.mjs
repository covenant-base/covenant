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
  },
  baseSepolia: {
    rpcEnvNames: ['BASE_SEPOLIA_RPC_URL', 'COVENANT_BASE_RPC_URL'],
  },
  base: {
    rpcEnvNames: ['BASE_RPC_URL', 'COVENANT_BASE_RPC_URL'],
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
  die('usage: node scripts/verify-base-network.mjs <localBase|baseSepolia|base>');
}

const manifestPath = join(root, 'packages', 'config', 'deployments', `${network}.json`);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const config = NETWORKS[network];
const rpcUrl = firstEnv(config.rpcEnvNames) ?? manifest.defaultRpcUrl;

if (!rpcUrl) {
  die(`missing rpc url for ${network}`);
}

const contracts = manifest.contracts ?? {};
const env = {
  ...process.env,
  COVENANT_CONTRACT_AGENT_REGISTRY: contracts.agentRegistry,
  COVENANT_CONTRACT_FEE_COLLECTOR: contracts.feeCollector,
  COVENANT_CONTRACT_GOVERNANCE: contracts.governance,
  COVENANT_CONTRACT_PROOF_VERIFIER: contracts.proofVerifier,
  COVENANT_CONTRACT_STAKING: contracts.staking,
  COVENANT_CONTRACT_TASK_MARKET: contracts.taskMarket,
  COVENANT_CONTRACT_TREASURY: contracts.treasury,
};

const missing = Object.entries(env)
  .filter(([key, value]) => key.startsWith('COVENANT_CONTRACT_') && (!value || value === '0x0000000000000000000000000000000000000000'))
  .map(([key]) => key);

if (missing.length > 0) {
  die(`missing manifest addresses for ${missing.join(', ')}`);
}

const result = spawnSync(
  'forge',
  [
    'script',
    'script/CovenantVerify.s.sol:CovenantVerifyScript',
    '--rpc-url',
    rpcUrl,
  ],
  {
    cwd: contractsDir,
    stdio: 'inherit',
    env,
  },
);

process.exit(result.status ?? 1);
