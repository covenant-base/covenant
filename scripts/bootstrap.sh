#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

ok()   { printf "${GREEN}✓${NC} %s\n" "$1"; }
fail() { printf "${RED}✗${NC} %s\n" "$1"; exit 1; }

command -v rustc >/dev/null 2>&1 || fail "rustc not found — install via https://rustup.rs"
command -v forge >/dev/null 2>&1 || fail "Foundry not found — install via https://book.getfoundry.sh/getting-started/installation"
command -v node >/dev/null 2>&1 || fail "node not found — install Node 22+ via https://nodejs.org"
command -v pnpm >/dev/null 2>&1 || fail "pnpm not found — install via corepack"

NODE_MAJOR="$(node -e "console.log(process.versions.node.split('.')[0])")"
[ "$NODE_MAJOR" -ge 22 ] || fail "Node 22+ required (found v$(node --version))"

ok "rust:  $(rustc --version)"
ok "forge: $(forge --version | head -n 1)"
ok "node:  $(node --version)"
ok "pnpm:  $(pnpm --version)"

if [ ! -f .env ]; then
  cp .env.example .env
  ok ".env created from .env.example"
else
  ok ".env already exists"
fi

echo
echo ">> installing dependencies..."
pnpm install

echo
echo ">> building Base contracts and exporting artifacts..."
pnpm contracts:build

echo
echo ">> typechecking the workspace..."
pnpm typecheck

echo
printf "\n${GREEN}bootstrap complete.${NC}\n\n"
echo "next steps:"
echo "  docker compose up -d                   # start postgres + redis"
echo "  pnpm contracts:deploy:local            # deploy to local anvil"
echo "  pnpm contracts:test                    # run Foundry tests"
echo "  pnpm --filter @covenant/portal dev     # portal on :3000"
echo "  pnpm test                              # run workspace tests"
echo
