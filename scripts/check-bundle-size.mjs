#!/usr/bin/env node
// Parses `next build` stdout and asserts First Load JS per route is under
// a configured limit. Config lives at scripts/bundle-size.config.json.
//
// Usage: node scripts/check-bundle-size.mjs <app-dir> [--build]
//   <app-dir>  path to a Next.js app (e.g. apps/portal)
//   --build    run `next build` first; otherwise read .next/build.log
//
// Exit: 0 on all-pass, 1 on any route exceeding its limit or missing a limit
// for a new client-rendered route.

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const CONFIG = JSON.parse(
  readFileSync(join(ROOT, 'scripts/bundle-size.config.json'), 'utf8'),
);

const args = process.argv.slice(2);
const appDir = args[0];
const runBuild = args.includes('--build');

if (!appDir) {
  console.error('usage: check-bundle-size.mjs <app-dir> [--build]');
  process.exit(2);
}

const appPath = resolve(ROOT, appDir);
const appKey = appDir.replace(/^apps\//, '').replace(/\/$/, '');
const appConfig = CONFIG[appKey];
if (!appConfig) {
  console.error(`no size config for app "${appKey}"`);
  process.exit(2);
}

let output = '';
if (runBuild) {
  const r = spawnSync('pnpm', ['build'], {
    cwd: appPath,
    encoding: 'utf8',
    env: { ...process.env, CI: '1', NO_COLOR: '1' },
  });
  output = (r.stdout ?? '') + (r.stderr ?? '');
  if (r.status !== 0) {
    console.error(output);
    console.error(`[size] build failed for ${appKey}`);
    process.exit(r.status ?? 1);
  }
} else {
  const log = join(appPath, '.next/build.log');
  if (!existsSync(log)) {
    console.error(
      `[size] no build.log at ${log} — run with --build or pipe build output first`,
    );
    process.exit(2);
  }
  output = readFileSync(log, 'utf8');
}

const routes = parseNextBuild(output);
if (routes.length === 0) {
  console.error('[size] could not parse any routes from build output');
  console.error('--- build output tail ---');
  console.error(output.slice(-2000));
  process.exit(2);
}

let breaches = 0;
let unknown = 0;
let maxLabel = 0;
for (const r of routes) maxLabel = Math.max(maxLabel, r.path.length);

console.log(`\n[size] ${appKey} — First Load JS per route\n`);
for (const r of routes) {
  const limit = appConfig.routes[r.path] ?? appConfig.default;
  const name = r.path.padEnd(maxLabel);
  const size = `${r.firstLoadKb.toFixed(1)} kB`.padStart(10);
  if (limit === undefined) {
    console.log(`  ?  ${name}  ${size}  (no limit)`);
    if (r.kind === 'client') unknown++;
  } else if (r.firstLoadKb > limit) {
    console.log(`  ✗  ${name}  ${size}  > ${limit} kB`);
    breaches++;
  } else {
    console.log(`  ✓  ${name}  ${size}  ≤ ${limit} kB`);
  }
}

if (breaches || unknown) {
  console.log(
    `\n[size] ${breaches} route(s) over limit, ${unknown} client route(s) with no limit`,
  );
  process.exit(1);
}
console.log(`\n[size] all routes within limits`);

function parseNextBuild(txt) {
  const routes = [];
  const lines = txt.split('\n');
  let inTable = false;
  for (const line of lines) {
    if (/Route \(app\)\s+Size\s+First Load JS/.test(line)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (/First Load JS shared by all/.test(line)) break;
    const m = line.match(
      /^[┌├└│\s]*([○ƒλ●])\s+(\/\S*)\s+[\d.]+\s*[kMG]?B\s+([\d.]+)\s*([kMG]?B)/,
    );
    if (!m) continue;
    const [, marker, path, n, unit] = m;
    const kb = unit === 'MB' ? parseFloat(n) * 1024 : parseFloat(n);
    routes.push({
      path,
      firstLoadKb: kb,
      kind: marker === 'ƒ' || marker === 'λ' ? 'client' : 'static',
    });
  }
  return routes;
}
