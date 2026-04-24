import { describe, expect, it } from 'vitest';
import { registry, jobsTotal, proveDuration, cacheHits } from '../metrics.js';

describe('metrics registry', () => {
  it('serializes prometheus text format', async () => {
    jobsTotal.inc({ circuit: 'task_completion.v1', status: 'completed' });
    const stop = proveDuration.startTimer({ circuit: 'task_completion.v1' });
    stop();
    cacheHits.inc({ circuit: 'task_completion.v1' });

    const out = await registry.metrics();
    expect(out).toContain('proofgen_jobs_total');
    expect(out).toContain('proofgen_duration_seconds');
    expect(out).toContain('proofgen_cache_hits_total');
    expect(out).toContain('circuit="task_completion.v1"');
  });
});
