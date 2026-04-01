import { randomUUID } from 'node:crypto';
import Fastify from 'fastify';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';
import { z } from 'zod';
import type { Hex } from 'viem';
import {
  BYTES32_REGEX,
  RESEARCH_CROSS_CHAIN_TRACKS,
  bytes32FromText,
  prepareCreateTaskCalls,
  resolveBaseNetwork,
} from '@covenant/sdk';

const app = Fastify({ logger: true });
const registry = new Registry();
collectDefaultMetrics({ register: registry });
const intentsTotal = new Counter({
  name: 'covenant_xrpl_bridge_intents_total',
  help: 'XRPL intents accepted by the Covenant bridge',
  registers: [registry],
});

const PORT = Number(process.env.XRPL_BRIDGE_PORT ?? 8792);
const network = resolveBaseNetwork();

const bytes32Schema = z.string().regex(BYTES32_REGEX).transform((value) => value as Hex);

const intentSchema = z.object({
  xrplAccount: z.string().min(3),
  agentId: bytes32Schema.optional(),
  description: z.string().min(3),
  amount: z.string().min(1),
  destinationAddress: z.string().optional(),
  memo: z.string().max(256).optional(),
});

type IntentRecord = {
  id: string;
  chain_id: number;
  source_chain: 'XRPL';
  destination_chain: 'Base';
  xrpl_account: string;
  agent_id: Hex;
  payment_amount: string;
  created_at: string;
  transaction: ReturnType<typeof prepareCreateTaskCalls>;
};

const intents: IntentRecord[] = [];

app.get('/healthz', async () => ({
  ok: true,
  chain_id: network.id,
  intents: intents.length,
}));

app.get('/metrics', async (_request, reply) => {
  reply.header('content-type', registry.contentType);
  return registry.metrics();
});

app.get('/tracks', async () => ({
  chain_id: network.id,
  items: RESEARCH_CROSS_CHAIN_TRACKS,
}));

app.get('/intents', async () => ({
  chain_id: network.id,
  items: intents,
}));

app.post('/intents', async (request, reply) => {
  const parsed = intentSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'invalid_body', issues: parsed.error.issues });
  }

  const input = parsed.data;
  const agentId = input.agentId ?? bytes32FromText(`xrpl:${input.xrplAccount}`);
  const bundle = prepareCreateTaskCalls({
    agentId,
    description: input.description,
    amount: input.amount,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 7200),
  });

  const record: IntentRecord = {
    id: randomUUID(),
    chain_id: network.id,
    source_chain: 'XRPL',
    destination_chain: 'Base',
    xrpl_account: input.xrplAccount,
    agent_id: agentId,
    payment_amount: input.amount,
    created_at: new Date().toISOString(),
    transaction: bundle,
  };

  intents.push(record);
  intentsTotal.inc();

  return {
    accepted: true,
    intent: record,
  };
});

const isEntry = import.meta.url === `file://${process.argv[1]}`;
if (isEntry) {
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
