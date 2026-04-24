import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { formatSiweMessage } from '@covenant/sdk';

vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem');
  return {
    ...actual,
    verifyMessage: vi.fn(async () => true),
  };
});

describe('auth routes', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = '12345678901234567890123456789012';
    process.env.NEXT_PUBLIC_BASE_CHAIN_ID = '84532';
  });

  it('issues a SIWE nonce payload', async () => {
    const { POST } = await import('@/app/api/auth/nonce/route');
    const response = await POST(new NextRequest('https://covenantbase.com/api/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ address: '0x1111111111111111111111111111111111111111' }),
    }));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.message.chainId).toBe(84532);
    expect(formatSiweMessage(payload.message)).toContain('Covenant Protocol');
  });
});
