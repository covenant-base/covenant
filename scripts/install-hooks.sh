#!/usr/bin/env bash
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  exit 0
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

if [[ ! -d scripts/git-hooks ]]; then
  exit 0
fi

chmod +x scripts/git-hooks/*
git config --local core.hooksPath scripts/git-hooks >/dev/null 2>&1 || true
