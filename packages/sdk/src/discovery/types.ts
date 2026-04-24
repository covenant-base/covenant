export interface DiscoveryEventRecord {
  chain_id: number;
  contract_address: `0x${string}`;
  block_number: number;
  transaction_hash: `0x${string}`;
  log_index: number;
  event_name: string;
  payload: Record<string, string | number | boolean>;
}

export interface DiscoveryStats {
  agents: number;
  tasks: number;
  payment_amount: string;
  stake_amount: string;
  protocol_fees: string;
  last_24h_fees: string;
}
