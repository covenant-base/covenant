import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ session: null });
  return NextResponse.json({
    session: {
      address: session.address,
      expiresAt: new Date(session.expiresAt * 1000).toISOString(),
    },
  });
}
