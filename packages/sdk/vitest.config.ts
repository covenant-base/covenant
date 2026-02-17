import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      all: false,
      exclude: ['src/**/__tests__/**', 'src/**/*.test.ts', 'src/index.ts'],
      thresholds: {
        statements: 85,
        branches: 72,
        functions: 88,
        lines: 88,
      },
    },
  },
});
