import { covenantBrand } from '@covenant/config/brand';
import { bytes32FromText } from '../base/transactions.js';
import { defaultCovenantContracts } from '../base/network.js';
import type { TaskStatus } from '../domain/task.js';

export interface ReputationDims {
  execution: number;
  proofs: number;
  treasury: number;
  governance: number;
}

export interface AgentSummary {
  agentId: `0x${string}`;
  operatorAddress: `0x${string}`;
  metadataUri: string;
  capabilityBitmap: string;
  stakeAmount: string;
  reputationScore: number;
  active: boolean;
  tags: string[];
}

export interface AgentDetail extends AgentSummary {
  taskCount: number;
  treasuryValue: string;
  reputationDims: ReputationDims;
}

export interface TaskSummary {
  taskId: `0x${string}`;
  agentId: `0x${string}`;
  clientAddress: `0x${string}`;
  paymentToken: `0x${string}`;
  paymentAmount: string;
  paymentSymbol: string;
  status: TaskStatus;
  txHash: `0x${string}`;
  contractAddress: `0x${string}`;
  deadline: string;
}

export interface TaskDetail extends TaskSummary {
  description: string;
  criteriaRoot: `0x${string}`;
  proofHash: `0x${string}`;
  resultHash: `0x${string}`;
}

export interface TreasurySummary {
  agentId: `0x${string}`;
  contractAddress: `0x${string}`;
  token: `0x${string}`;
  balance: string;
  dailyLimit: string;
  perTxLimit: string;
  weeklyLimit: string;
  spentToday: string;
  spentThisWeek: string;
}

export interface StreamSummary {
  streamId: string;
  agentId: `0x${string}`;
  token: `0x${string}`;
  ratePerSecond: string;
  recipient: `0x${string}`;
  active: boolean;
}

export interface LeaderboardRow {
  agentId: `0x${string}`;
  operatorAddress: `0x${string}`;
  score: number;
  completedTasks: number;
  stakeAmount: string;
}

export interface TaskBidSummary {
  bidder: `0x${string}`;
  agentId: `0x${string}`;
  amount: string;
  revealed: boolean;
  txHash: `0x${string}`;
}

export interface BiddingState {
  open: boolean;
  commitEndsAt: string;
  revealEndsAt: string;
  bondAmount: string;
  winner: `0x${string}`;
}

export interface TemplateSummary {
  templateId: `0x${string}`;
  author: `0x${string}`;
  metadataUri: string;
  royaltyBps: number;
  active: boolean;
}

export interface YieldStrategy {
  id: string;
  name: string;
  description: string;
  protocol: string;
  risk: 'low' | 'medium' | 'high';
}

export interface CrossChainTrack {
  name: string;
  summary: string;
  source: string;
  destination: string;
}

export interface MarketplaceBounty {
  taskHash: `0x${string}`;
  title: string;
  bounty: string;
}

const contracts = defaultCovenantContracts();

export const MOCK_AGENTS: AgentSummary[] = [
  {
    agentId: bytes32FromText('covenant.alpha'),
    operatorAddress: '0x1111111111111111111111111111111111111111',
    metadataUri: 'https://covenantbase.com/agents/alpha.json',
    capabilityBitmap: '7',
    stakeAmount: '2500000000000000000000',
    reputationScore: 962,
    active: true,
    tags: ['execution', 'proofs', 'treasury'],
  },
  {
    agentId: bytes32FromText('covenant.delta'),
    operatorAddress: '0x2222222222222222222222222222222222222222',
    metadataUri: 'https://covenantbase.com/agents/delta.json',
    capabilityBitmap: '19',
    stakeAmount: '1800000000000000000000',
    reputationScore: 914,
    active: true,
    tags: ['routing', 'governance'],
  },
];

export const MOCK_AGENT_DETAILS: AgentDetail[] = MOCK_AGENTS.map((agent, index) => ({
  ...agent,
  taskCount: 12 - index * 3,
  treasuryValue: `${90000 - index * 12000}`,
  reputationDims: {
    execution: 92 - index * 3,
    proofs: 95 - index * 2,
    treasury: 88 - index,
    governance: 84 + index,
  },
}));

export const MOCK_TASKS: TaskDetail[] = [
  {
    taskId: bytes32FromText('task.base.bootstrap'),
    agentId: MOCK_AGENTS[0]!.agentId,
    clientAddress: '0x3333333333333333333333333333333333333333',
    paymentToken: contracts.token,
    paymentAmount: '125000000000000000000',
    paymentSymbol: covenantBrand.token.symbol,
    status: 'verified',
    txHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    contractAddress: contracts.taskMarket,
    deadline: new Date(Date.now() + 48 * 3600_000).toISOString(),
    description: 'Ship the Base Sepolia deployment healthcheck pack.',
    criteriaRoot: bytes32FromText('criteria.bootstrap'),
    proofHash: bytes32FromText('proof.bootstrap'),
    resultHash: bytes32FromText('result.bootstrap'),
  },
  {
    taskId: bytes32FromText('task.base.analytics'),
    agentId: MOCK_AGENTS[1]!.agentId,
    clientAddress: '0x4444444444444444444444444444444444444444',
    paymentToken: contracts.token,
    paymentAmount: '84000000000000000000',
    paymentSymbol: covenantBrand.token.symbol,
    status: 'funded',
    txHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    contractAddress: contracts.taskMarket,
    deadline: new Date(Date.now() + 72 * 3600_000).toISOString(),
    description: 'Publish Covenant/Base treasury performance digest.',
    criteriaRoot: bytes32FromText('criteria.analytics'),
    proofHash: bytes32FromText('proof.analytics'),
    resultHash: bytes32FromText('result.analytics'),
  },
];

export const MOCK_TREASURY: TreasurySummary[] = [
  {
    agentId: MOCK_AGENTS[0]!.agentId,
    contractAddress: contracts.treasury,
    token: contracts.token,
    balance: '540000000000000000000',
    dailyLimit: '180000000000000000000',
    perTxLimit: '60000000000000000000',
    weeklyLimit: '420000000000000000000',
    spentToday: '24000000000000000000',
    spentThisWeek: '96000000000000000000',
  },
];

export const MOCK_STREAMS: StreamSummary[] = [
  {
    streamId: 'stream-alpha-1',
    agentId: MOCK_AGENTS[0]!.agentId,
    token: contracts.token,
    ratePerSecond: '1500000000000000',
    recipient: '0x5555555555555555555555555555555555555555',
    active: true,
  },
];

export const MOCK_LEADERBOARD: LeaderboardRow[] = MOCK_AGENT_DETAILS.map((agent, index) => ({
  agentId: agent.agentId,
  operatorAddress: agent.operatorAddress,
  score: agent.reputationScore,
  completedTasks: 14 - index * 2,
  stakeAmount: agent.stakeAmount,
}));

export const MOCK_BIDDING_STATE: BiddingState = {
  open: true,
  commitEndsAt: new Date(Date.now() + 6 * 3600_000).toISOString(),
  revealEndsAt: new Date(Date.now() + 12 * 3600_000).toISOString(),
  bondAmount: '15000000000000000000',
  winner: '0x6666666666666666666666666666666666666666',
};

export const MOCK_BIDS: TaskBidSummary[] = [
  {
    bidder: '0x6666666666666666666666666666666666666666',
    agentId: MOCK_AGENTS[0]!.agentId,
    amount: '72000000000000000000',
    revealed: true,
    txHash: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  },
];

export const MOCK_TEMPLATES: TemplateSummary[] = [
  {
    templateId: bytes32FromText('template.base.audit'),
    author: MOCK_AGENTS[0]!.operatorAddress,
    metadataUri: 'https://covenantbase.com/templates/base-audit.json',
    royaltyBps: 400,
    active: true,
  },
];

export const DEFAULT_YIELD_STRATEGIES: YieldStrategy[] = [
  {
    id: 'base-usdc-reserve',
    name: 'Base Reserve Ladder',
    description: 'Keep treasury liquidity parked in low-volatility Base-native yield venues.',
    protocol: 'Base Reserve',
    risk: 'low',
  },
  {
    id: 'base-amm-cover',
    name: 'AMM Cover Vault',
    description: 'Deploy idle balances into fee-producing LP cover with daily unwind thresholds.',
    protocol: 'Covenant Treasury',
    risk: 'medium',
  },
];

export const RESEARCH_CROSS_CHAIN_TRACKS: CrossChainTrack[] = [
  {
    name: 'XRPL Intent Relay',
    summary: 'Normalize XRPL payment intents into Base task creation and release workflows.',
    source: 'XRPL',
    destination: 'Base',
  },
  {
    name: 'Offchain Proof Intake',
    summary: 'Accept external proofs, settle on Base, and preserve a Base-native audit trail.',
    source: 'External worker',
    destination: 'Base',
  },
];

export const MARKETPLACE_BOUNTIES: MarketplaceBounty[] = MOCK_TASKS.map((task) => ({
  taskHash: bytes32FromText(task.description),
  title: task.description,
  bounty: task.paymentAmount,
}));

export async function fetchTreasury(agentId: `0x${string}`): Promise<TreasurySummary | null> {
  return MOCK_TREASURY.find((item) => item.agentId === agentId) ?? null;
}

export function findMarketplaceBountyByTaskHash(taskHash: `0x${string}`) {
  return MARKETPLACE_BOUNTIES.find((item) => item.taskHash === taskHash) ?? null;
}
