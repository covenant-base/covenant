import { NextResponse } from 'next/server';
import { readSession, signSession } from '@/lib/session';

export async function POST() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { token, expiresAt } = await signSession(session.address, 300);
  return NextResponse.json({
    token,
    address: session.address,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
  });
}
