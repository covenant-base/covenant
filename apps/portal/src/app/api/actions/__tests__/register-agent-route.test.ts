import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

describe('register agent action route', () => {
  it('returns an evm call bundle', async () => {
    const { POST } = await import('@/app/api/actions/register-agent/route');
    const response = await POST(
      new NextRequest('https://covenantbase.com/api/actions/register-agent?name=Alpha&capabilities=1,2,5', {
        method: 'POST',
        body: JSON.stringify({ account: '0x5555555555555555555555555555555555555555' }),
      }),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.calls).toHaveLength(1);
  });
});
