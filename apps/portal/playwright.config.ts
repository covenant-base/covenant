import { defineConfig, devices } from '@playwright/test';

const baseNetwork = process.env.NEXT_PUBLIC_BASE_NETWORK ?? 'baseSepolia';
const baseRpcUrl =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  (baseNetwork === 'base'
    ? 'https://mainnet.base.org'
    : baseNetwork === 'localBase'
      ? 'http://127.0.0.1:8545'
      : 'https://sepolia.base.org');

export default defineConfig({
  testDir: './e2e',
  outputDir: './.next/playwright/test-results',
  timeout: 45_000,
  expect: {
    timeout: 20_000,
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3401',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm build && pnpm exec next start -p 3401',
    port: 3401,
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_BASE_NETWORK: baseNetwork,
      NEXT_PUBLIC_BASE_CHAIN_ID: process.env.NEXT_PUBLIC_BASE_CHAIN_ID ?? '84532',
      NEXT_PUBLIC_BASE_RPC_URL: baseRpcUrl,
      SESSION_SECRET: process.env.SESSION_SECRET ?? 'playwright-local-session-secret',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
