import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { Address, Hex } from 'viem';
import {
  BYTES32_REGEX,
  EVM_ADDRESS_REGEX,
  MOCK_AGENT_DETAILS,
  MOCK_TASKS,
  TASK_STATUS_VALUES,
  bytes32FromText,
  defaultCovenantContracts,
  prepareCreateTaskCalls,
  prepareRegisterAgentCall,
  prepareStakeCall,
  resolveBaseNetwork,
} from '@covenant/sdk';

const network = resolveBaseNetwork();
const contracts = defaultCovenantContracts();

const server = new Server(
  {
    name: 'covenant',
    version: '0.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const addressSchema: z.ZodType<Address, z.ZodTypeDef, string> = z
  .string()
  .regex(EVM_ADDRESS_REGEX)
  .transform((value) => value as Address);

const bytes32Schema: z.ZodType<Hex, z.ZodTypeDef, string> = z
  .string()
  .regex(BYTES32_REGEX)
  .transform((value) => value as Hex);

const listAgentsSchema = z.object({
  capability: z.string().optional(),
  operatorAddress: addressSchema.optional(),
});

const listTasksSchema = z.object({
  status: z.enum(TASK_STATUS_VALUES).optional(),
  agentId: bytes32Schema.optional(),
});

const registerAgentSchema = z.object({
  name: z.string().min(3),
  metadataUri: z.string().url(),
  capabilityBitmap: z.union([z.string(), z.number(), z.bigint()]).transform((value) => BigInt(value)),
});

const createTaskSchema = z.object({
  agentId: bytes32Schema,
  description: z.string().min(3),
  amount: z.string().min(1),
  deadline: z
    .union([z.string(), z.number(), z.bigint()])
    .optional()
    .transform((value) => (value === undefined ? undefined : BigInt(value))),
});

const stakeSchema = z.object({
  amount: z.string().min(1),
  lockDurationSeconds: z.union([z.string(), z.number(), z.bigint()]).transform((value) => BigInt(value)),
});

const deriveIdSchema = z.object({
  value: z.string().min(1),
});

type TextContent = {
  type: 'text';
  text: string;
};

type ToolResult = {
  content: TextContent[];
  isError?: boolean;
};

type ToolInputSchema = Tool['inputSchema'];

function asText(value: unknown): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function asError(message: string): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
    isError: true,
  };
}

function describeTool(name: string, description: string, inputSchema: ToolInputSchema): Tool {
  return {
    name,
    description,
    inputSchema,
  };
}

const tools = [
  describeTool('get_network', 'Return the active Covenant/Base network metadata.', {
    type: 'object',
  }),
  describeTool('get_contracts', 'Return the active Covenant/Base contract address map.', {
    type: 'object',
  }),
  describeTool('list_agents', 'List active Covenant agents on Base.', {
    type: 'object',
    properties: {
      capability: { type: 'string' },
      operatorAddress: { type: 'string', pattern: EVM_ADDRESS_REGEX.source },
    },
  }),
  describeTool('list_tasks', 'List Covenant task-market tasks using Base-native identifiers.', {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: [...TASK_STATUS_VALUES],
      },
      agentId: { type: 'string', pattern: BYTES32_REGEX.source },
    },
  }),
  describeTool('prepare_register_agent', 'Prepare a Base transaction bundle to register a Covenant agent.', {
    type: 'object',
    properties: {
      name: { type: 'string' },
      metadataUri: { type: 'string', format: 'uri' },
      capabilityBitmap: { anyOf: [{ type: 'string' }, { type: 'number' }] },
    },
    required: ['name', 'metadataUri', 'capabilityBitmap'],
  }),
  describeTool(
    'prepare_create_task',
    'Prepare the ERC-20 approval and task-market create call for Base.',
    {
      type: 'object',
      properties: {
        agentId: { type: 'string', pattern: BYTES32_REGEX.source },
        description: { type: 'string' },
        amount: { type: 'string' },
        deadline: { anyOf: [{ type: 'string' }, { type: 'number' }] },
      },
      required: ['agentId', 'description', 'amount'],
    },
  ),
  describeTool('prepare_stake', 'Prepare a Base staking transaction bundle.', {
    type: 'object',
    properties: {
      amount: { type: 'string' },
      lockDurationSeconds: { anyOf: [{ type: 'string' }, { type: 'number' }] },
    },
    required: ['amount', 'lockDurationSeconds'],
  }),
  describeTool('derive_bytes32_id', 'Derive a bytes32 identifier from human-readable input.', {
    type: 'object',
    properties: {
      value: { type: 'string' },
    },
    required: ['value'],
  }),
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments ?? {};

  try {
    switch (request.params.name) {
      case 'get_network':
        return asText({
          chain_id: network.id,
          network: network.key,
          rpc_url: network.rpcUrl,
          explorer_url: network.explorerUrl,
        });
      case 'get_contracts':
        return asText({
          chain_id: network.id,
          contract_addresses: contracts,
        });
      case 'list_agents': {
        const { capability, operatorAddress } = listAgentsSchema.parse(args);
        return asText({
          items: MOCK_AGENT_DETAILS.filter((agent) => {
            if (capability && !agent.tags.includes(capability)) return false;
            if (
              operatorAddress &&
              agent.operatorAddress.toLowerCase() !== operatorAddress.toLowerCase()
            ) {
              return false;
            }
            return true;
          }),
        });
      }
      case 'list_tasks': {
        const { status, agentId } = listTasksSchema.parse(args);
        return asText({
          items: MOCK_TASKS.filter((task) => {
            if (status && task.status !== status) return false;
            if (agentId && task.agentId.toLowerCase() !== agentId.toLowerCase()) return false;
            return true;
          }),
        });
      }
      case 'prepare_register_agent': {
        const { name, metadataUri, capabilityBitmap } = registerAgentSchema.parse(args);
        return asText(prepareRegisterAgentCall({ name, metadataUri, capabilityBitmap }));
      }
      case 'prepare_create_task': {
        const { agentId, description, amount, deadline } = createTaskSchema.parse(args);
        return asText(
          prepareCreateTaskCalls({
            agentId,
            description,
            amount,
            deadline: deadline ?? BigInt(Math.floor(Date.now() / 1000) + 3600),
          }),
        );
      }
      case 'prepare_stake': {
        const { amount, lockDurationSeconds } = stakeSchema.parse(args);
        return asText(prepareStakeCall(amount, lockDurationSeconds));
      }
      case 'derive_bytes32_id': {
        const { value } = deriveIdSchema.parse(args);
        return asText({
          value,
          bytes32: bytes32FromText(value),
        });
      }
      default:
        return asError(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return asError(error.issues.map((issue) => issue.message).join('; '));
    }

    if (error instanceof Error) {
      return asError(error.message);
    }

    return asError('Unknown tool execution failure');
  }
});

const isEntry = import.meta.url === `file://${process.argv[1]}`;
if (isEntry) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
