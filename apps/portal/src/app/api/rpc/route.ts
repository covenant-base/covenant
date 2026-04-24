import { NextRequest, NextResponse } from 'next/server';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;
const hits = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  let entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    entry = { count: 0, reset: now + WINDOW_MS };
    hits.set(ip, entry);
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  const rpcUrl =
    process.env.NEXT_PUBLIC_BASE_RPC_URL ??
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ??
    process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL;

  if (!rpcUrl) {
    return NextResponse.json({ jsonrpc: '2.0', error: { code: -32603, message: 'RPC not configured' } }, { status: 503 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  if (isRateLimited(ip)) {
    return NextResponse.json({ jsonrpc: '2.0', error: { code: -32005, message: 'Rate limit exceeded' } }, { status: 429 });
  }

  const upstream = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: await req.text(),
  });

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}
