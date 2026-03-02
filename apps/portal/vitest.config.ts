import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    alias: {
      '@/': path.resolve(__dirname, 'src') + '/',
      '@covenant/sdk': path.resolve(__dirname, '../../packages/sdk/src/index.ts'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],

      include: ['src/app/api/auth/**/*.ts'],
      exclude: ['src/**/__tests__/**', 'src/**/*.test.ts'],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 90,
        lines: 95,
      },
    },
  },
});
