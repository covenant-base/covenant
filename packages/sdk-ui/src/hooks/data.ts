'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  MOCK_BIDDING_STATE,
  MOCK_BIDS,
  MOCK_LEADERBOARD,
  MOCK_STREAMS,
  MOCK_TREASURY,
  defaultCovenantContracts,
  type BiddingState,
  type LeaderboardRow,
  type StreamSummary,
  type TaskBidSummary,
  type TreasurySummary,
} from '@covenant/sdk';

function resolveTreasury(agentId?: `0x${string}`) {
  if (!agentId) return MOCK_TREASURY;
  return MOCK_TREASURY.filter((entry) => entry.agentId === agentId);
}

export function useTreasury(agentId?: `0x${string}`) {
  return useQuery<TreasurySummary[]>({
    queryKey: ['covenant', 'treasury', agentId ?? 'all'],
    queryFn: async () => resolveTreasury(agentId),
    initialData: resolveTreasury(agentId),
  });
}

export function useSetLimits() {
  return useMutation({
    mutationFn: async (input: {
      agentId: `0x${string}`;
      dailyLimit: string;
      perTxLimit: string;
      weeklyLimit: string;
    }) => input,
  });
}

export function useAllowedMints() {
  const contracts = defaultCovenantContracts();
  return useQuery({
    queryKey: ['covenant', 'allowed-mints'],
    queryFn: async () => [contracts.token],
    initialData: [contracts.token],
  });
}

export function useVaultBalances(agentId?: `0x${string}`) {
  return useQuery({
    queryKey: ['covenant', 'vault-balances', agentId ?? 'all'],
    queryFn: async () => resolveTreasury(agentId).map((entry) => ({
      token: entry.token,
      balance: entry.balance,
      contractAddress: entry.contractAddress,
    })),
    initialData: resolveTreasury(agentId).map((entry) => ({
      token: entry.token,
      balance: entry.balance,
      contractAddress: entry.contractAddress,
    })),
  });
}

export function useAgentStreams(agentId?: `0x${string}`) {
  return useQuery<StreamSummary[]>({
    queryKey: ['covenant', 'streams', agentId ?? 'all'],
    queryFn: async () =>
      agentId ? MOCK_STREAMS.filter((stream) => stream.agentId === agentId) : MOCK_STREAMS,
    initialData: agentId ? MOCK_STREAMS.filter((stream) => stream.agentId === agentId) : MOCK_STREAMS,
  });
}

export function useLeaderboard() {
  return useQuery<LeaderboardRow[]>({
    queryKey: ['covenant', 'leaderboard'],
    queryFn: async () => MOCK_LEADERBOARD,
    initialData: MOCK_LEADERBOARD,
  });
}

export function useBiddingState(_taskId?: `0x${string}`) {
  return useQuery<BiddingState>({
    queryKey: ['covenant', 'bidding-state', _taskId ?? 'default'],
    queryFn: async () => MOCK_BIDDING_STATE,
    initialData: MOCK_BIDDING_STATE,
  });
}

export function useTaskBidsIndexed(_taskId?: `0x${string}`) {
  return useQuery<TaskBidSummary[]>({
    queryKey: ['covenant', 'task-bids', _taskId ?? 'default'],
    queryFn: async () => MOCK_BIDS,
    initialData: MOCK_BIDS,
  });
}
