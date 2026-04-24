import { NextRequest, NextResponse } from 'next/server';
import { covenantBrand } from '@covenant/config/brand';
import type { SiweMessage } from '@covenant/sdk';
import { issueNonce, signNonceToken } from '@/lib/nonce';

export async function POST(req: NextRequest) {
  let body: { address?: `0x${string}`; chainId?: number } | null = null;
  try {
    body = (await req.json()) as { address?: `0x${string}`; chainId?: number } | null;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body?.address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const claims = await issueNonce(body.address);
  const nonceToken = await signNonceToken(claims);

  const message: SiweMessage = {
    domain: new URL(origin).host,
    address: body.address,
    statement: `Sign in to ${covenantBrand.name} on Base.`,
    uri: origin,
    version: '1',
    chainId: body.chainId ?? Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID ?? '84532'),
    nonce: claims.nonce,
    issuedAt: claims.issuedAt,
    expirationTime: claims.expirationTime,
    resources: [covenantBrand.portalUrl, covenantBrand.docsUrl],
  };

  const response = NextResponse.json({ message, nonceToken });
  response.cookies.set(covenantBrand.cookies.nonce, nonceToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 5 * 60,
  });
  return response;
}
