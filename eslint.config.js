import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

export default [
  ...nextCoreWebVitals,
  {
    settings: {
      react: {
        version: '19.2',
      },
    },
  },
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/out/**', '**/.next/**', '**/target/**', '**/next-env.d.ts'],
  },
];
