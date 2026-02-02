#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function die(message) {
  console.error(message);
  process.exit(1);
}

const guardian = process.argv[2];
if (!guardian) {
  die('usage: node scripts/hash-guardian-config.mjs <guardian-address>');
}

const checksum = spawnSync('cast', ['to-check-sum-address', guardian], {
  encoding: 'utf8',
});

if ((checksum.status ?? 1) !== 0) {
  die(checksum.stderr.trim() || `invalid guardian address: ${guardian}`);
}

const encoded = `guardian-attestation-v1:${checksum.stdout.trim()}`;
const result = spawnSync('cast', ['keccak', encoded], {
  encoding: 'utf8',
});

if ((result.status ?? 1) !== 0) {
  die(result.stderr.trim() || 'cast keccak failed');
}

process.stdout.write(`${result.stdout.trim()}\n`);
