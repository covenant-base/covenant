export const TASK_STATUS_VALUES = [
  'funded',
  'proof_submitted',
  'verified',
  'released',
  'disputed',
] as const;

export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

