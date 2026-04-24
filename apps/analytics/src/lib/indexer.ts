type Snapshot = {
  totals: {
    agents: number;
    tasks: number;
    paymentAmount: string;
    stakeAmount: string;
  };
  feeStats: {
    protocolFees: string;
    last24hFees: string;
  };
  health: {
    latestBlock: number;
    indexedEvents: number;
    chainId: number;
  };
  source: 'mock' | 'live';
  fetchedAt: string;
};

const mockSnapshot: Snapshot = {
  totals: {
    agents: 24,
    tasks: 61,
    paymentAmount: '1245000',
    stakeAmount: '3920000',
  },
  feeStats: {
    protocolFees: '18400',
    last24hFees: '730',
  },
  health: {
    latestBlock: 24358219,
    indexedEvents: 912,
    chainId: 84532,
  },
  source: 'mock',
  fetchedAt: new Date().toISOString(),
};

export async function loadSnapshot(): Promise<Snapshot> {
  const baseUrl = process.env.NEXT_PUBLIC_DISCOVERY_URL ?? process.env.DISCOVERY_URL;
  if (!baseUrl) return mockSnapshot;

  const response = await fetch(`${baseUrl}/stats/summary`, { next: { revalidate: 30 } });
  if (!response.ok) {
    throw new Error(`unexpected status ${response.status}`);
  }

  const payload = (await response.json()) as Omit<Snapshot, 'source' | 'fetchedAt'>;
  return {
    ...payload,
    source: 'live',
    fetchedAt: new Date().toISOString(),
  };
}
