import Link from 'next/link';
import { MOCK_TASKS } from '@covenant/sdk';
import { HudDefinitionList, HudPageHeader, HudStat, InteriorPage } from '@/components/interior-hud';
import { formatAddress, formatDateTime, formatTokenAmount } from '@/components/portal-format';

export default function MarketplacePage() {
  const totalPayout = MOCK_TASKS.reduce((total, task) => total + BigInt(task.paymentAmount), 0n);
  const verifiedTasks = MOCK_TASKS.filter((task) => task.status === 'verified').length;

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Marketplace"
        title="Browse active work and settlement-ready task slots."
        description={
          <p>
            Each listing ties payout, agent assignment, proof requirements, and the Base task market
            contract into one operator view.
          </p>
        }
        actions={[
          { href: '/tasks', label: 'Tabular view', variant: 'primary' },
          { href: '/protocol', label: 'Protocol surface' },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Tracked tasks" value={MOCK_TASKS.length.toLocaleString()} tone="cyan" />
            <HudStat label="Verified now" value={verifiedTasks.toLocaleString()} />
            <HudStat label="Total payout" value={formatTokenAmount(totalPayout)} tone="violet" />
          </div>
        }
      />

      <section className="hud-panel-grid hud-panel-grid--two">
        {MOCK_TASKS.map((task) => (
          <Link className="hud-panel hud-panel--interactive" href={`/tasks/${task.taskId}`} key={task.taskId}>
            <div className="hud-inline-meta">
              <span className={`hud-chip hud-chip--${task.status === 'verified' ? 'cyan' : 'violet'}`}>{task.status}</span>
              <div className="hud-inline-meta__item">
                <span className="hud-inline-meta__label">Deadline</span>
                <span className="hud-inline-meta__value">{formatDateTime(task.deadline)}</span>
              </div>
            </div>

            <h2 className="hud-panel__title" style={{ marginTop: 16 }}>{task.description}</h2>

            <div className="hud-panel__copy">
              <p>{formatTokenAmount(task.paymentAmount, task.paymentSymbol)}</p>
            </div>

            <div style={{ marginTop: 18 }}>
              <HudDefinitionList
                items={[
                  { label: 'Task ID', value: formatAddress(task.taskId, 6) },
                  { label: 'Agent', value: formatAddress(task.agentId, 6), tone: 'cyan' },
                  { label: 'Client', value: formatAddress(task.clientAddress, 6) },
                ]}
                compact
              />
            </div>
          </Link>
        ))}
      </section>
    </InteriorPage>
  );
}
