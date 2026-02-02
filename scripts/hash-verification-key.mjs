#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function die(message) {
  console.error(message);
  process.exit(1);
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

const args = process.argv.slice(2);
const allowDevOnly = args.includes('--allow-dev-only');
const vkArg = args.find((arg) => !arg.startsWith('--'));

if (!vkArg) {
  die('usage: node scripts/hash-verification-key.mjs <verification_key.json> [--allow-dev-only]');
}

const vkPath = resolve(vkArg);
if (!existsSync(vkPath)) {
  die(`verification key not found: ${vkPath}`);
}

const metaPath = resolve(dirname(vkPath), 'verification_key.meta.json');
if (existsSync(metaPath)) {
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  if (meta?.status === 'dev-only' && !allowDevOnly) {
    die(`refusing to hash dev-only verification key: ${vkPath}`);
  }
}

const verificationKey = JSON.parse(readFileSync(vkPath, 'utf8'));
const canonical = stableStringify(verificationKey);
const result = spawnSync('cast', ['keccak', canonical], {
  encoding: 'utf8',
});

if ((result.status ?? 1) !== 0) {
  die(result.stderr.trim() || 'cast keccak failed');
}

process.stdout.write(`${result.stdout.trim()}\n`);
