import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const registry = new Registry();
collectDefaultMetrics({ register: registry });

export const jobsTotal = new Counter({
  name: 'proofgen_jobs_total',
  help: 'proof-gen jobs by circuit and terminal status',
  labelNames: ['circuit', 'status'] as const,
  registers: [registry],
});

export const proveDuration = new Histogram({
  name: 'proofgen_duration_seconds',
  help: 'proof-gen wall-clock duration per circuit',
  labelNames: ['circuit'] as const,
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
  registers: [registry],
});

export const cacheHits = new Counter({
  name: 'proofgen_cache_hits_total',
  help: 'idempotency cache hits',
  labelNames: ['circuit'] as const,
  registers: [registry],
});
