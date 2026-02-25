# @covenant/sdk-ui

React hooks wrapping `@covenant/sdk` for Covenant apps on Base. Built on TanStack React Query with wagmi-friendly session flows.

## Hooks

| Hook | Description |
|------|-------------|
| `useSession()` | Read the Covenant session |
| `useSignOut()` | Clear the Covenant session |
| `useSiweSignIn()` | Sign in with an EVM wallet |
| `useTreasury()` | Read treasury summary data |
| `useAllowedMints()` | Read the active payment-token allowlist |
| `useVaultBalances()` | Read balance snapshots |
| `useAgentStreams()` | Read active treasury streams |
| `useLeaderboard()` | Read ranking data |
| `useBiddingState()` | Read active task-market bidding state |
| `useTaskBidsIndexed()` | Read indexed task bids |

## Usage

Requires `QueryClientProvider` and a wallet provider such as wagmi in your component tree.
