import Fastify from 'fastify';
import { z } from 'zod';
import {
  BYTES32_REGEX,
  MOCK_AGENT_DETAILS,
  MOCK_LEADERBOARD,
  MOCK_TASKS,
  MOCK_TREASURY,
  TASK_STATUS_VALUES,
  resolveBaseNetwork,
} from '@covenant/sdk';

const app = Fastify({ logger: true });
const network = resolveBaseNetwork();
const PORT = Number(process.env.DISCOVERY_PORT ?? 8790);

const agentsQuerySchema = z.object({
  capability: z.string().trim().min(1).optional(),
  operatorAddress: z.string().trim().toLowerCase().optional(),
  active: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const tasksQuerySchema = z.object({
  status: z.enum(TASK_STATUS_VALUES).optional(),
  agentId: z.string().trim().regex(BYTES32_REGEX).transform((value) => value.toLowerCase()).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

function sumBigInt(values: string[]): string {
  return values.reduce((total, value) => total + BigInt(value), 0n).toString();
}

app.get('/healthz', async () => ({
  ok: true,
  network: network.key,
  chainId: network.id,
  indexedAgents: MOCK_AGENT_DETAILS.length,
  indexedTasks: MOCK_TASKS.length,
}));

app.get('/network', async () => ({
  chain_id: network.id,
  network: network.key,
  explorer_url: network.explorerUrl,
  rpc_url: network.rpcUrl,
  contract_addresses: network.contracts,
}));

app.get('/stats/summary', async () => ({
  chain_id: network.id,
  agents: MOCK_AGENT_DETAILS.length,
  tasks: MOCK_TASKS.length,
  payment_amount: sumBigInt(MOCK_TASKS.map((task) => task.paymentAmount)),
  stake_amount: sumBigInt(MOCK_AGENT_DETAILS.map((agent) => agent.stakeAmount)),
  treasury_balance: sumBigInt(MOCK_TREASURY.map((treasury) => treasury.balance)),
}));

app.get('/agents', async (request) => {
  const query = agentsQuerySchema.parse(request.query);
  const items = MOCK_AGENT_DETAILS.filter((agent) => {
    if (query.capability && !agent.tags.includes(query.capability)) return false;
    if (query.operatorAddress && agent.operatorAddress.toLowerCase() !== query.operatorAddress) return false;
    if (typeof query.active === 'boolean' && agent.active !== query.active) return false;
    return true;
  }).slice(0, query.limit);

  return {
    chain_id: network.id,
    items,
  };
});

app.get('/agents/:agentId', async (request, reply) => {
  const params = z.object({ agentId: z.string().trim().toLowerCase() }).parse(request.params);
  const agent = MOCK_AGENT_DETAILS.find((item) => item.agentId.toLowerCase() === params.agentId);
  if (!agent) {
    return reply.code(404).send({ error: 'agent_not_found' });
  }

  const treasury = MOCK_TREASURY.find((item) => item.agentId === agent.agentId) ?? null;
  const tasks = MOCK_TASKS.filter((task) => task.agentId === agent.agentId);

  return {
    chain_id: network.id,
    agent,
    treasury,
    tasks,
  };
});

app.get('/tasks', async (request) => {
  const query = tasksQuerySchema.parse(request.query);
  const items = MOCK_TASKS.filter((task) => {
    if (query.status && task.status !== query.status) return false;
    if (query.agentId && task.agentId.toLowerCase() !== query.agentId) return false;
    return true;
  }).slice(0, query.limit);

  return {
    chain_id: network.id,
    items,
  };
});

app.get('/tasks/:taskId', async (request, reply) => {
  const params = z.object({ taskId: z.string().trim().toLowerCase() }).parse(request.params);
  const task = MOCK_TASKS.find((item) => item.taskId.toLowerCase() === params.taskId);
  if (!task) {
    return reply.code(404).send({ error: 'task_not_found' });
  }

  return {
    chain_id: network.id,
    item: task,
  };
});

app.get('/leaderboard', async () => ({
  chain_id: network.id,
  items: MOCK_LEADERBOARD,
}));

const isEntry = import.meta.url === `file://${process.argv[1]}`;
if (isEntry) {
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
