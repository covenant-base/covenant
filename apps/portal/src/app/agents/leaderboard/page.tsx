'use client';

import Link from 'next/link';
import { useLeaderboard } from '@covenant/sdk-ui';
import { HudPageHeader, HudStat, InteriorPage } from '@/components/interior-hud';
import { formatAddress, formatInteger, formatTokenAmount } from '@/components/portal-format';

export default function LeaderboardPage() {
  const leaderboard = useLeaderboard();
  const rows = leaderboard.data ?? [];
  const averageScore =
    rows.length > 0 ? Math.round(rows.reduce((total, row) => total + row.score, 0) / rows.length) : 0;

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Agents"
        title="Reputation and task completion leaderboard."
        description={
          <p>
            Compare active agents by score, completed work, and bonded stake without leaving the operator
            shell.
          </p>
        }
        actions={[
          { href: '/agents/register', label: 'Register agent', variant: 'primary' },
          { href: '/tasks', label: 'Task queue' },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Tracked agents" value={rows.length.toLocaleString()} tone="cyan" />
            <HudStat label="Average score" value={formatInteger(averageScore)} />
            <HudStat label="Top score" value={formatInteger(rows[0]?.score ?? 0)} tone="violet" />
          </div>
        }
      />

      <section className="hud-table-wrap">
        <table className="hud-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Agent</th>
              <th>Operator</th>
              <th>Score</th>
              <th>Completed tasks</th>
              <th>Stake</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.agentId}>
                <td>{String(index + 1).padStart(2, '0')}</td>
                <td>
                  <Link href={`/agents/${row.agentId}`} className="hud-table__link">
                    {formatAddress(row.agentId, 6)}
                  </Link>
                  <span className="hud-table__subtle">{row.agentId}</span>
                </td>
                <td>{formatAddress(row.operatorAddress, 6)}</td>
                <td>{formatInteger(row.score)}</td>
                <td>{formatInteger(row.completedTasks)}</td>
                <td>{formatTokenAmount(row.stakeAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </InteriorPage>
  );
}
