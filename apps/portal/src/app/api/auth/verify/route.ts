import { NextRequest, NextResponse } from 'next/server';
import { covenantBrand } from '@covenant/config/brand';
import { formatSiweMessage, type SiweMessage } from '@covenant/sdk';
import { isAddress, verifyMessage } from 'viem';
import { verifyNonceToken } from '@/lib/nonce';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  let body: { message?: SiweMessage; signature?: `0x${string}` } | null = null;
  try {
    body = (await req.json()) as { message?: SiweMessage; signature?: `0x${string}` } | null;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body?.message || !body.signature) {
    return NextResponse.json({ error: 'message and signature required' }, { status: 400 });
  }

  const nonceToken = req.cookies.get(covenantBrand.cookies.nonce)?.value;
  if (!nonceToken) {
    return NextResponse.json({ error: 'nonce expired' }, { status: 401 });
  }

  let claims;
  try {
    claims = await verifyNonceToken(nonceToken);
  } catch {
    return NextResponse.json({ error: 'invalid nonce' }, { status: 401 });
  }

  if (claims.nonce !== body.message.nonce || claims.address.toLowerCase() !== body.message.address.toLowerCase()) {
    return NextResponse.json({ error: 'nonce mismatch' }, { status: 401 });
  }

  if (!isAddress(body.message.address)) {
    return NextResponse.json({ error: 'invalid address' }, { status: 400 });
  }

  const ok = await verifyMessage({
    address: body.message.address,
    message: formatSiweMessage(body.message),
    signature: body.signature,
  });

  if (!ok) {
    return NextResponse.json({ error: 'bad signature' }, { status: 401 });
  }

  const session = await createSession(body.message.address);
  const response = NextResponse.json({ session });
  response.cookies.delete(covenantBrand.cookies.nonce);
  return response;
}
