'use client';

import { useAgentStreams, useAllowedMints, useTreasury, useVaultBalances } from '@covenant/sdk-ui';
import { HudDefinitionList, HudPageHeader, HudPanel, HudSectionHeading, HudStat, InteriorPage } from '@/components/interior-hud';
import { formatAddress, formatInteger, formatTokenAmount } from '@/components/portal-format';

export default function TreasuryPage() {
  const treasury = useTreasury();
  const mints = useAllowedMints();
  const balances = useVaultBalances();
  const streams = useAgentStreams();
  const treasuryRows = treasury.data ?? [];
  const mintRows = mints.data ?? [];
  const balanceRows = balances.data ?? [];
  const streamRows = streams.data ?? [];
  const totalBalance = treasuryRows.reduce((total, entry) => total + BigInt(entry.balance), 0n);

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Treasury"
        title="Spend policy, vault balances, and stream oversight."
        description={
          <p>
            Review the active treasury envelope for each agent, including limits, spend velocity, and the
            vault balances that back current operations.
          </p>
        }
        actions={[
          { href: '/staking', label: 'Stake flow', variant: 'primary' },
          { href: '/governance', label: 'Governance' },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Allowed mints" value={formatInteger(mintRows.length)} tone="cyan" />
            <HudStat label="Vault balances" value={formatInteger(balanceRows.length)} />
            <HudStat label="Treasury total" value={formatTokenAmount(totalBalance)} tone="violet" />
          </div>
        }
      />

      <section className="hud-panel-grid hud-panel-grid--three">
        <HudPanel>
          <p className="hud-panel__kicker">Allowed payment tokens</p>
          <HudDefinitionList
            items={mintRows.map((entry) => ({
              label: formatAddress(entry, 6),
              value: entry,
              tone: 'cyan' as const,
            }))}
            compact
          />
        </HudPanel>

        <HudPanel>
          <p className="hud-panel__kicker">Vault balances</p>
          <div className="hud-list">
            {balanceRows.map((entry) => (
              <div className="hud-list__item" key={`${entry.contractAddress}-${entry.token}`}>
                <div>
                  <span className="hud-list__index">{formatAddress(entry.token, 6)}</span>
                  <strong>{formatTokenAmount(entry.balance)}</strong>
                </div>
                <code>{formatAddress(entry.contractAddress, 6)}</code>
              </div>
            ))}
          </div>
        </HudPanel>

        <HudPanel>
          <p className="hud-panel__kicker">Active streams</p>
          <div className="hud-list">
            {streamRows.map((stream) => (
              <div className="hud-list__item" key={stream.streamId}>
                <div>
                  <span className="hud-list__index">{stream.streamId}</span>
                  <strong>{formatTokenAmount(stream.ratePerSecond)}</strong>
                </div>
                <code>{formatAddress(stream.recipient, 6)}</code>
              </div>
            ))}
          </div>
        </HudPanel>
      </section>

      <section className="hud-stack">
        <HudSectionHeading
          eyebrow="Policy"
          title="Treasury envelopes by agent."
          description={<p>Daily, per-transaction, and weekly thresholds stay visible alongside current spend.</p>}
        />
        <div className="hud-table-wrap">
          <table className="hud-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Balance</th>
                <th>Daily limit</th>
                <th>Per tx</th>
                <th>Weekly limit</th>
                <th>Spent this week</th>
              </tr>
            </thead>
            <tbody>
              {treasuryRows.map((entry) => (
                <tr key={entry.agentId}>
                  <td>{formatAddress(entry.agentId, 6)}</td>
                  <td>{formatTokenAmount(entry.balance)}</td>
                  <td>{formatTokenAmount(entry.dailyLimit)}</td>
                  <td>{formatTokenAmount(entry.perTxLimit)}</td>
                  <td>{formatTokenAmount(entry.weeklyLimit)}</td>
                  <td>{formatTokenAmount(entry.spentThisWeek)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </InteriorPage>
  );
}
