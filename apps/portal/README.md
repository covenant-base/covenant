# Covenant Portal

Next.js 15 portal for Covenant Protocol on Base.

## Run

```bash
pnpm --filter @covenant/portal dev    # http://localhost:3000
```

## Pages

| Route | Status | Description |
|-------|--------|-------------|
| `/` | Live | Landing + protocol stats |
| `/agents` | Live | Agent registry browser |
| `/agents/[did]` | Live | Agent detail + reputation |
| `/marketplace` | Live | Task marketplace + bidding |
| `/tasks/[id]` | Live | Task detail + state machine |
| `/treasury` | Live | Operator treasury management |
| `/governance` | Live | Proposal list + voting |
| `/governance/[id]` | Live | Proposal detail |

## Stack

- Next.js 15 App Router with Server Components
- wagmi + viem for wallet and chain interactions
- SIWE for auth
- TanStack Query for data fetching
- Tailwind CSS 4 + shadcn/ui components
- Base deployment manifests from `@covenant/config`
