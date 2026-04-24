#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

readonly SEARCH_GLOBS=(
  "--glob=!node_modules/**"
  "--glob=!contracts/out/**"
  "--glob=!contracts/cache/**"
  "--glob=!apps/docs/out/**"
  "--glob=!.next/**"
  "--glob=!dist/**"
  "--glob=!coverage/**"
  "--glob=!pnpm-lock.yaml"
  "--glob=!**/*.tsbuildinfo"
)

readonly CONTENT_TOKENS=(
  $'\x53\x41\x45\x50'
  $'\x53\x61\x65\x70'
  $'\x73\x61\x65\x70'
  'buildon'$'\x73\x61\x65\x70'
  '@'$'\x73\x61\x65\x70'
  'NEXT_PUBLIC_'$'\x53\x4f\x4c\x41\x4e\x41'
  $'\x53\x4f\x4c\x41\x4e\x41''_'
  '@sol'$'\x61\x6e\x61\x2f'
  $'\x53\x6f\x6c\x61\x6e\x61'
  $'\x73\x6f\x6c\x61\x6e\x61'
  'wallet-'$'\x61\x64\x61\x70\x74\x65\x72'
  $'\x53\x49\x57\x53'
  'Yellow'$'\x73\x74\x6f\x6e\x65'
  'explorer\.sol'$'\x61\x6e\x61''\.com'
  'lam'$'\x70\x6f\x72\x74\x73'
  'covenant'$'\x70\x72\x6f\x74\x6f\x63\x6f\x6c'
  'buildon'$'\x63\x6f\x76\x65\x6e\x61\x6e\x74'
  'covenantbase'$'\x2e\x6e\x65\x74'
)
readonly PATH_TOKENS=(
  $'\x73\x61\x65\x70'
  $'\x73\x6f\x6c\x61\x6e\x61'
)
readonly ALLOWED_COMMIT_IDENTITIES=(
  'Adrian Vale <adrian@covenantbase.com>'
  'Mika Peltonen <mika@covenantbase.com>'
  'Nicola Mariano <nicola@covenantbase.com>'
)

CONTENT_PATTERN=''
for token in "${CONTENT_TOKENS[@]}"; do
  if [[ -n "$CONTENT_PATTERN" ]]; then
    CONTENT_PATTERN+="|"
  fi
  CONTENT_PATTERN+="$token"
done
readonly CONTENT_PATTERN

PATH_PATTERN=''
for token in "${PATH_TOKENS[@]}"; do
  if [[ -n "$PATH_PATTERN" ]]; then
    PATH_PATTERN+="|"
  fi
  PATH_PATTERN+="$token"
done
readonly PATH_PATTERN

usage() {
  cat >&2 <<'EOF'
Usage:
  scripts/check-forbidden-public-identifiers.sh --repo
  scripts/check-forbidden-public-identifiers.sh --branch-name [NAME]
  scripts/check-forbidden-public-identifiers.sh --commit-message-file PATH
  scripts/check-forbidden-public-identifiers.sh --rev-spec SPEC
EOF
  exit 2
}

report_hits() {
  local scope="$1"
  local hits="$2"
  if [[ -z "$hits" ]]; then
    return 0
  fi
  cat >&2 <<EOF
[public-id-guard] BLOCKED: forbidden public identifiers detected in $scope.

$hits
EOF
  return 1
}

identity_allowed() {
  local identity="$1"
  local allowed
  for allowed in "${ALLOWED_COMMIT_IDENTITIES[@]}"; do
    if [[ "$identity" == "$allowed" ]]; then
      return 0
    fi
  done
  return 1
}

list_commits_for_spec() {
  local spec="$1"
  if [[ "$spec" == "--all" ]]; then
    git rev-list --all
  elif [[ "$spec" == *..* ]]; then
    git rev-list "$spec"
  else
    git rev-list --max-count=1 "$spec"
  fi
}

list_paths_for_spec() {
  local spec="$1"
  if [[ "$spec" == "--all" ]]; then
    git log --format='' --name-only --all | sed '/^$/d' | sort -u
  elif [[ "$spec" == *..* ]]; then
    git diff --name-only "$spec"
  else
    git show --pretty='' --name-only "$spec"
  fi
}

scan_repo() {
  local content_hits path_hits
  content_hits="$(rg -n -S "${SEARCH_GLOBS[@]}" "$CONTENT_PATTERN" . || true)"
  path_hits="$(find . \
    -path './node_modules' -prune -o \
    -path './contracts/out' -prune -o \
    -path './contracts/cache' -prune -o \
    -path './apps/docs/out' -prune -o \
    -path './.next' -prune -o \
    -path './dist' -prune -o \
    -path './coverage' -prune -o \
    -name 'pnpm-lock.yaml' -prune -o \
    -name '*.tsbuildinfo' -prune -o \
    -type f -print | LC_ALL=C grep -E -i "$PATH_PATTERN" || true)"
  report_hits "repo contents" "$content_hits" || return 1
  report_hits "repo paths" "$path_hits" || return 1
}

scan_branch_name() {
  local branch="${1:-}"
  if [[ -z "$branch" ]] && command -v git >/dev/null 2>&1; then
    branch="$(git branch --show-current 2>/dev/null || true)"
  fi
  [[ -z "$branch" ]] && return 0
  if printf '%s\n' "$branch" | LC_ALL=C grep -E -i "$PATH_PATTERN" >/dev/null; then
    report_hits "branch name" "$branch"
    return 1
  fi
}

scan_commit_message_file() {
  local path="${1:-}"
  [[ -n "$path" ]] || usage
  local hits
  hits="$(LC_ALL=C grep -n -E -i "$CONTENT_PATTERN" "$path" || true)"
  report_hits "commit message" "$hits"
}

scan_rev_spec() {
  local spec="${1:-}"
  [[ -n "$spec" ]] || usage
  if ! command -v git >/dev/null 2>&1; then
    return 0
  fi
  local hits identity_hits commit author_identity committer_identity
  hits="$(
    list_paths_for_spec "$spec" 2>/dev/null | LC_ALL=C grep -E -i "$PATH_PATTERN" || true
  )"
  identity_hits="$(
    while IFS= read -r commit; do
      [[ -n "$commit" ]] || continue
      author_identity="$(git show -s --format='%an <%ae>' "$commit")"
      committer_identity="$(git show -s --format='%cn <%ce>' "$commit")"
      if ! identity_allowed "$author_identity"; then
        printf '%s\tauthor\t%s\n' "$commit" "$author_identity"
      fi
      if ! identity_allowed "$committer_identity"; then
        printf '%s\tcommitter\t%s\n' "$commit" "$committer_identity"
      fi
    done < <(list_commits_for_spec "$spec" 2>/dev/null)
  )"
  report_hits "git revision paths ($spec)" "$hits" || return 1
  report_hits "git commit identities ($spec)" "$identity_hits" || return 1
}

main() {
  [[ "$#" -gt 0 ]] || usage
  local failed=0

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      --repo)
        scan_repo || failed=1
        shift
        ;;
      --branch-name)
        if [[ "$#" -gt 1 ]] && [[ "${2:-}" != --* ]]; then
          scan_branch_name "$2" || failed=1
          shift 2
        else
          scan_branch_name || failed=1
          shift
        fi
        ;;
      --commit-message-file)
        [[ "$#" -gt 1 ]] || usage
        scan_commit_message_file "$2" || failed=1
        shift 2
        ;;
      --rev-spec)
        [[ "$#" -gt 1 ]] || usage
        scan_rev_spec "$2" || failed=1
        shift 2
        ;;
      *)
        usage
        ;;
    esac
  done

  if [[ "$failed" -ne 0 ]]; then
    cat >&2 <<'EOF'
[public-id-guard] Remove the blocked identifiers before shipping the repo.
EOF
    exit 1
  fi
}

main "$@"
