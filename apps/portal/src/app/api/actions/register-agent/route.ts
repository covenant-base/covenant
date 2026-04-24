import { NextRequest, NextResponse } from 'next/server';
import { covenantBrand } from '@covenant/config/brand';
import { prepareRegisterAgentCall, bytes32FromText, normalizeBytes32 } from '@covenant/sdk';

export async function GET() {
  return NextResponse.json({
    icon: `${covenantBrand.portalUrl}/logomark.png`,
    title: 'Register Agent — Covenant',
    description: 'Prepare a Base transaction call to register an operator-owned agent in Covenant.',
    label: 'Prepare Agent Registration',
    links: {
      actions: [
        {
          label: 'Prepare Agent Registration',
          href: '/api/actions/register-agent?name={name}&capabilities={capabilities}&metadataUri={metadataUri}&agentId={agentId}',
          parameters: [
            { name: 'name', label: 'Agent name or seed', required: true },
            { name: 'capabilities', label: 'Capability bits (comma-separated)', required: true },
            { name: 'metadataUri', label: 'Agent manifest URI', required: false },
            { name: 'agentId', label: 'Agent ID override (32-byte hex)', required: false },
          ],
        },
      ],
    },
  });
}

function capabilityMaskFrom(raw: string): bigint {
  return raw.split(',').reduce((mask, item) => {
    const bit = Number(item.trim());
    if (!Number.isInteger(bit) || bit < 0 || bit > 255) {
      throw new Error(`invalid capability bit: ${item}`);
    }
    return mask | (1n << BigInt(bit));
  }, 0n);
}

export async function POST(req: NextRequest) {
  let body: { account?: string } | null = null;
  try {
    body = (await req.json()) as { account?: string } | null;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body?.account) {
    return NextResponse.json({ error: 'missing account' }, { status: 400 });
  }

  const name = req.nextUrl.searchParams.get('name')?.trim();
  const capabilities = req.nextUrl.searchParams.get('capabilities');
  if (!name || !capabilities) {
    return NextResponse.json(
      { error: 'missing required parameters: name, capabilities' },
      { status: 400 },
    );
  }

  let capabilityBitmap: bigint;
  try {
    capabilityBitmap = capabilityMaskFrom(capabilities);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'invalid capabilities' },
      { status: 400 },
    );
  }

  const metadataUri =
    req.nextUrl.searchParams.get('metadataUri')?.trim() ??
    `${covenantBrand.portalUrl}/agents/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
  const explicitAgentId = normalizeBytes32(req.nextUrl.searchParams.get('agentId') ?? '');
  const bundle = prepareRegisterAgentCall({
    name,
    metadataUri,
    capabilityBitmap,
    agentId: explicitAgentId ?? bytes32FromText(name.toLowerCase()),
  });

  return NextResponse.json({
    chainId: bundle.chainId,
    calls: bundle.calls,
    summary: {
      network: bundle.network,
      metadataUri,
      capabilityBitmap: capabilityBitmap.toString(),
    },
  });
}
