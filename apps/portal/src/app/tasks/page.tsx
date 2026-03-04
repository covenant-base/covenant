import Link from 'next/link';
import { MOCK_TASKS } from '@covenant/sdk';
import { HudPageHeader, HudStat, InteriorPage } from '@/components/interior-hud';
import { formatAddress, formatDateTime, formatTokenAmount } from '@/components/portal-format';

export default function TasksPage() {
  const verifiedTasks = MOCK_TASKS.filter((task) => task.status === 'verified').length;
  const totalPayout = MOCK_TASKS.reduce((total, task) => total + BigInt(task.paymentAmount), 0n);

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Tasks"
        title="Settlement queue and proof-linked task history."
        description={
          <p>
            Use the tabular surface when you need dense scanning across payout, assignee, contract state,
            and the on-chain record for each task.
          </p>
        }
        actions={[
          { href: '/marketplace', label: 'Card view', variant: 'primary' },
          { href: '/developers', label: 'SDK surface' },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Rows" value={MOCK_TASKS.length.toLocaleString()} tone="cyan" />
            <HudStat label="Verified" value={verifiedTasks.toLocaleString()} />
            <HudStat label="Total payout" value={formatTokenAmount(totalPayout)} tone="violet" />
          </div>
        }
      />

      <section className="hud-table-wrap">
        <table className="hud-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Agent</th>
              <th>Payment</th>
              <th>Deadline</th>
              <th>Transaction</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TASKS.map((task) => (
              <tr key={task.taskId}>
                <td>
                  <Link href={`/tasks/${task.taskId}`} className="hud-table__link">
                    {task.description}
                  </Link>
                  <span className="hud-table__subtle">{formatAddress(task.taskId, 6)}</span>
                </td>
                <td>
                  <span className={`hud-chip hud-chip--${task.status === 'verified' ? 'cyan' : 'violet'}`}>
                    {task.status}
                  </span>
                </td>
                <td>{formatAddress(task.agentId, 6)}</td>
                <td>{formatTokenAmount(task.paymentAmount, task.paymentSymbol)}</td>
                <td>{formatDateTime(task.deadline)}</td>
                <td>
                  <code>{formatAddress(task.txHash, 6)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </InteriorPage>
  );
}
