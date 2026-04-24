import { z } from 'zod';

const Field = z.string().regex(/^(0x[0-9a-fA-F]+|[0-9]+)$/, 'field element: decimal or 0x-hex');
const Hash32 = z.string().regex(/^0x[0-9a-fA-F]{64}$/, '32-byte hex');

const N_TASK = 16;
const N_RESULT = 32;
const K = 8;
const LOG_K = 3;

export const PublicInputsSchema = z.object({
  task_hash: Hash32,
  result_hash: Hash32,
  deadline: z.string().regex(/^[0-9]+$/),
  submitted_at: z.string().regex(/^[0-9]+$/),
  criteria_root: Hash32,
});

export const PrivateInputsSchema = z.object({
  task_preimage: z.array(Field).length(N_TASK),
  result_preimage: z.array(Field).length(N_RESULT),
  salt: Field,
  criteria_satisfied: z.array(Field).length(K),
  criteria_path: z.array(Field).length(LOG_K),
  criteria_index: z.array(Field).length(LOG_K),
});

export const ProveRequestSchema = z.object({
  circuit_id: z.literal('task_completion.v1'),
  public_inputs: PublicInputsSchema,
  private_inputs: PrivateInputsSchema,
});

export type PublicInputs = z.infer<typeof PublicInputsSchema>;
export type PrivateInputs = z.infer<typeof PrivateInputsSchema>;

export const JobIdParamsSchema = z.object({
  id: z.string().uuid(),
});
