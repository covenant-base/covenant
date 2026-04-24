#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const network = process.argv[2];
const chainId = process.argv[3];

if (!network || !chainId) {
  console.error('usage: node scripts/write-deployment-manifest.mjs <network> <chainId>');
  process.exit(2);
}

const broadcastPath = join(
  root,
  'contracts',
  'broadcast',
  'CovenantDeploy.s.sol',
  chainId,
  'run-latest.json',
);
const manifestPath = join(root, 'packages', 'config', 'deployments', `${network}.json`);

const broadcast = JSON.parse(readFileSync(broadcastPath, 'utf8'));
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const addresses = {};

for (const tx of broadcast.transactions ?? []) {
  if (tx.transactionType !== 'CREATE') continue;
  const name = tx.contractName;
  const address = tx.contractAddress;
  switch (name) {
    case 'CovenantAgentRegistry':
      addresses.agentRegistry = address;
      break;
    case 'CovenantCapabilityRegistry':
      addresses.capabilityRegistry = address;
      break;
    case 'CovenantTreasury':
      addresses.treasury = address;
      break;
    case 'CovenantTaskMarket':
      addresses.taskMarket = address;
      break;
    case 'CovenantProofVerifier':
      addresses.proofVerifier = address;
      break;
    case 'CovenantDisputeArbitration':
      addresses.disputeArbitration = address;
      break;
    case 'CovenantGovernance':
      addresses.governance = address;
      break;
    case 'CovenantFeeCollector':
      addresses.feeCollector = address;
      break;
    case 'CovenantStaking':
      addresses.staking = address;
      break;
    case 'CovenantTemplateRegistry':
      addresses.templateRegistry = address;
      break;
    case 'CovenantToken':
      addresses.token = address;
      break;
    default:
      break;
  }
}

mkdirSync(join(root, 'packages', 'config', 'deployments'), { recursive: true });
writeFileSync(
  manifestPath,
  `${JSON.stringify({ ...manifest, contracts: { ...manifest.contracts, ...addresses } }, null, 2)}\n`,
);
