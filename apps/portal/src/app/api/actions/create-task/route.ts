import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { covenantBrand } from '@covenant/config/brand';
import { prepareCreateTaskCalls, normalizeBytes32 } from '@covenant/sdk';

function buildTaskId(): `0x${string}` {
  return `0x${randomBytes(32).toString('hex')}`;
}

function deadlineFrom(hoursRaw: string | null): bigint {
  const hours = Number(hoursRaw ?? '168');
  const safeHours = Number.isFinite(hours) && hours > 0 ? hours : 168;
  return BigInt(Math.floor(Date.now() / 1000) + safeHours * 3600);
}

export async function GET() {
  return NextResponse.json({
    icon: `${covenantBrand.portalUrl}/logomark.png`,
    title: 'Create Task — Covenant',
    description: 'Prepare Base transaction calls to approve payment and create a Covenant task.',
    label: 'Prepare Task',
    links: {
      actions: [
        {
          label: 'Prepare Task',
          href: '/api/actions/create-task?agentId={agentId}&amount={amount}&description={description}&deadlineHours={deadlineHours}',
          parameters: [
            { name: 'agentId', label: 'Agent ID (32-byte hex)', required: true },
            { name: 'amount', label: `Payment amount (${covenantBrand.token.symbol})`, required: true },
            { name: 'description', label: 'Task description', required: true },
            { name: 'deadlineHours', label: 'Deadline in hours (default 168)', required: false },
          ],
        },
      ],
    },
  });
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

  const agentId = normalizeBytes32(req.nextUrl.searchParams.get('agentId') ?? '');
  const amount = req.nextUrl.searchParams.get('amount');
  const description = req.nextUrl.searchParams.get('description')?.trim();

  if (!agentId) {
    return NextResponse.json({ error: 'agentId must be a 32-byte hex string' }, { status: 400 });
  }
  if (!amount || !description) {
    return NextResponse.json({ error: 'missing required parameters: agentId, amount, description' }, { status: 400 });
  }

  const bundle = prepareCreateTaskCalls({
    agentId,
    amount,
    description,
    deadline: deadlineFrom(req.nextUrl.searchParams.get('deadlineHours')),
    taskId: buildTaskId(),
  });

  return NextResponse.json({
    chainId: bundle.chainId,
    calls: bundle.calls,
    summary: {
      network: bundle.network,
      agentId,
      description,
    },
  });
}
