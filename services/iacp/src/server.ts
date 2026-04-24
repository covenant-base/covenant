import { randomUUID } from 'node:crypto';
import Fastify from 'fastify';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';
import { z } from 'zod';
import {
  BYTES32_REGEX,
  EVM_ADDRESS_REGEX,
  resolveBaseNetwork,
  sessionSecret,
  verifySessionJwt,
} from '@covenant/sdk';

const app = Fastify({ logger: true });
const registry = new Registry();
collectDefaultMetrics({ register: registry });
const publishTotal = new Counter({
  name: 'covenant_iacp_publish_total',
  help: 'Published Covenant IACP envelopes',
  registers: [registry],
  labelNames: ['result'] as const,
});

const PORT = Number(process.env.IACP_PORT ?? 8080);
const SERVICE_TOKEN = process.env.IACP_SERVICE_TOKEN ?? '';
const MAX_MESSAGES = Number(process.env.IACP_MAX_MESSAGES ?? 200);
const network = resolveBaseNetwork();

const envelopeSchema = z.object({
  channel: z.enum(['agent', 'task', 'system']),
  operatorAddress: z.string().regex(EVM_ADDRESS_REGEX),
  agentId: z.string().regex(BYTES32_REGEX).optional(),
  taskId: z.string().regex(BYTES32_REGEX).optional(),
  body: z.record(z.string(), z.unknown()),
});

type Envelope = z.infer<typeof envelopeSchema> & {
  id: string;
  receivedAt: string;
  chainId: number;
};

const messages: Envelope[] = [];

function firstHeader(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return null;
}

async function resolveOperator(request: {
  headers: Record<string, string | string[] | undefined>;
}) {
  const serviceHeader = firstHeader(request.headers['x-covenant-service-token']);
  if (serviceHeader && SERVICE_TOKEN && serviceHeader === SERVICE_TOKEN) {
    return { operatorAddress: null, via: 'service' as const };
  }

  const auth = firstHeader(request.headers.authorization);
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }

  const token = auth.slice('Bearer '.length).trim();
  if (!token) return null;

  const payload = await verifySessionJwt(token, sessionSecret());
  if (!payload) return null;

  return { operatorAddress: payload.address.toLowerCase(), via: 'session' as const };
}

app.get('/healthz', async () => ({
  ok: true,
  chain_id: network.id,
  queued_messages: messages.length,
}));

app.get('/metrics', async (_request, reply) => {
  reply.header('content-type', registry.contentType);
  return registry.metrics();
});

app.get('/messages', async () => ({
  chain_id: network.id,
  items: messages.slice().reverse(),
}));

app.post('/publish', async (request, reply) => {
  const actor = await resolveOperator(request);
  if (!actor) {
    publishTotal.inc({ result: 'unauthorized' });
    return reply.code(401).send({ error: 'unauthorized' });
  }

  const parsed = envelopeSchema.safeParse(request.body);
  if (!parsed.success) {
    publishTotal.inc({ result: 'invalid' });
    return reply.code(400).send({ error: 'invalid_body', issues: parsed.error.issues });
  }

  const envelope = parsed.data;
  if (actor.operatorAddress && actor.operatorAddress !== envelope.operatorAddress.toLowerCase()) {
    publishTotal.inc({ result: 'rejected' });
    return reply.code(403).send({ error: 'operator_mismatch' });
  }

  const record: Envelope = {
    ...envelope,
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    chainId: network.id,
  };

  messages.push(record);
  if (messages.length > MAX_MESSAGES) {
    messages.splice(0, messages.length - MAX_MESSAGES);
  }

  publishTotal.inc({ result: 'accepted' });
  return {
    accepted: true,
    id: record.id,
    chain_id: network.id,
    received_at: record.receivedAt,
  };
});

const isEntry = import.meta.url === `file://${process.argv[1]}`;
if (isEntry) {
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
