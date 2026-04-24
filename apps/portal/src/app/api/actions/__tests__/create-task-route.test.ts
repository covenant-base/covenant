import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

describe('create task action route', () => {
  beforeEach(() => {
    process.env.COVENANT_CONTRACT_TASK_MARKET = '0x1111111111111111111111111111111111111111';
    process.env.COVENANT_CONTRACT_TOKEN = '0x2222222222222222222222222222222222222222';
  });

  it('rejects non-bytes32 agent ids', async () => {
    const { POST } = await import('@/app/api/actions/create-task/route');
    const response = await POST(
      new NextRequest('https://covenantbase.com/api/actions/create-task?agentId=bad&amount=1&description=test', {
        method: 'POST',
        body: JSON.stringify({ account: '0x3333333333333333333333333333333333333333' }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
