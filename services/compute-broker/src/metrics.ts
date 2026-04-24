import { Counter, Histogram, Registry } from 'prom-client';

export const registry = new Registry();

export const bondRequests = new Counter({
  name: 'compute_broker_bond_requests_total',
  help: 'bond attestation requests',
  labelNames: ['provider', 'status'],
  registers: [registry],
});

export const leaseReservationLatency = new Histogram({
  name: 'compute_broker_lease_reservation_latency_seconds',
  help: 'provider lease reservation call latency',
  labelNames: ['provider', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [registry],
});

export const attestationsSigned = new Counter({
  name: 'compute_broker_attestations_signed_total',
  help: 'attestations signed by broker key',
  labelNames: ['provider'],
  registers: [registry],
});

export const leaseLifecycleOps = new Counter({
  name: 'compute_broker_lease_lifecycle_ops_total',
  help: 'lease lifecycle operations executed by the broker',
  labelNames: ['provider', 'operation', 'status'],
  registers: [registry],
});
