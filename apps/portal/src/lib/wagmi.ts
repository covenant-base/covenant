import { base, baseSepolia } from 'wagmi/chains';
import { defineChain, http } from 'viem';
import { createConfig } from 'wagmi';

const localBase = defineChain({
  id: 31337,
  name: 'Local Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
  blockExplorers: { default: { name: 'Anvil', url: 'http://127.0.0.1:8545' } },
});

export const covenantWagmiConfig = createConfig({
  chains: [base, baseSepolia, localBase],
  ssr: true,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL ?? 'https://mainnet.base.org'),
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ??
        process.env.NEXT_PUBLIC_BASE_RPC_URL ??
        'https://sepolia.base.org',
    ),
    [localBase.id]: http('http://127.0.0.1:8545'),
  },
});
