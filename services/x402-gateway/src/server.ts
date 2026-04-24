import Fastify from 'fastify';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';
import { z } from 'zod';
import {
  BYTES32_REGEX,
  EVM_ADDRESS_REGEX,
  bytes32FromText,
  defaultCovenantContracts,
  prepareCreateTaskCalls,
  resolveBaseNetwork,
} from '@covenant/sdk';

const app = Fastify({ logger: true });
const registry = new Registry();
collectDefaultMetrics({ register: registry });
const requestsTotal = new Counter({
  name: 'covenant_x402_requests_total',
  help: 'Requests handled by the Covenant x402 gateway',
  registers: [registry],
  labelNames: ['route', 'result'] as const,
});

const PORT = Number(process.env.X402_PORT ?? 8789);
const network = resolveBaseNetwork();
const contracts = defaultCovenantContracts();

type Hex = `0x${string}`;

const addressSchema = z
  .string()
  .regex(EVM_ADDRESS_REGEX)
  .transform((value): Hex => value as Hex);

const bytes32Schema = z
  .string()
  .regex(BYTES32_REGEX)
  .transform((value): Hex => value as Hex);

const demoToken = addressSchema.parse(process.env.X402_DEMO_PAYMENT_TOKEN ?? contracts.token);
const demoAmount = process.env.X402_DEMO_PAYMENT_AMOUNT ?? '1000000000000000000';
const demoAgentId = bytes32Schema.parse(
  process.env.X402_DEMO_RECIPIENT_AGENT_ID ?? bytes32FromText('x402.demo'),
);

const settlementSchema = z.object({
  agentId: bytes32Schema,
  description: z.string().min(3),
  amount: z.string().min(1),
  deadline: z.coerce.number().int().positive().optional(),
});

function buildChallenge(input: z.infer<typeof settlementSchema>) {
  const deadline = BigInt(input.deadline ?? Math.floor(Date.now() / 1000) + 3600);
  const bundle = prepareCreateTaskCalls({
    agentId: input.agentId,
    description: input.description,
    amount: input.amount,
    deadline,
  });

  return {
    scheme: 'x402',
    chainId: bundle.chainId,
    paymentToken: demoToken,
    paymentAmount: input.amount,
    contractAddress: contracts.taskMarket,
    summary: `Create and fund Covenant task escrow for ${input.description}`,
    transaction: {
      to: bundle.calls.at(-1)?.to ?? contracts.taskMarket,
      calls: bundle.calls,
    },
  };
}

app.get('/healthz', async () => ({
  ok: true,
  chain_id: network.id,
  task_market: contracts.taskMarket,
}));

app.get('/metrics', async (_request, reply) => {
  reply.header('content-type', registry.contentType);
  return registry.metrics();
});

app.get('/quote', async () => ({
  chain_id: network.id,
  payment_token: demoToken,
  payment_amount: demoAmount,
  contract_address: contracts.taskMarket,
  agent_id: demoAgentId,
}));

app.post('/settle', async (request, reply) => {
  const parsed = settlementSchema.safeParse(request.body);
  if (!parsed.success) {
    requestsTotal.inc({ route: 'settle', result: 'invalid' });
    return reply.code(400).send({ error: 'invalid_body', issues: parsed.error.issues });
  }

  requestsTotal.inc({ route: 'settle', result: 'prepared' });
  return buildChallenge(parsed.data);
});

app.get('/demo/paid', async (request, reply) => {
  const challenge = buildChallenge({
    agentId: demoAgentId,
    description: 'Access the Covenant x402 demo endpoint',
    amount: demoAmount,
  });

  const receipt = request.headers['x-payment'];
  if (typeof receipt !== 'string' || receipt.length === 0) {
    requestsTotal.inc({ route: 'demo_paid', result: 'payment_required' });
    reply.code(402);
    return {
      error: 'payment_required',
      payment: challenge,
    };
  }

  requestsTotal.inc({ route: 'demo_paid', result: 'paid' });
  return {
    ok: true,
    receipt,
    content: 'Covenant/Base payment accepted.',
  };
});

const isEntry = import.meta.url === `file://${process.argv[1]}`;
if (isEntry) {
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
