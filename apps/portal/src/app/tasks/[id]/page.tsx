import { notFound } from 'next/navigation';
import { MOCK_BIDDING_STATE, MOCK_BIDS, MOCK_TASKS } from '@covenant/sdk';
import {
  HudDefinitionList,
  HudPageHeader,
  HudPanel,
  HudSectionHeading,
  HudStat,
  InteriorPage,
} from '@/components/interior-hud';
import { formatAddress, formatDateTime, formatTokenAmount } from '@/components/portal-format';

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = MOCK_TASKS.find((entry) => entry.taskId === id);
  if (!task) notFound();

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Task dossier"
        title={task.description}
        description={
          <p>
            Funding, proof anchors, settlement address, and bidding window details for this task are kept
            in one operator-ready document.
          </p>
        }
        actions={[
          { href: '/tasks', label: 'All tasks', variant: 'primary' },
          { href: '/marketplace', label: 'Marketplace' },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Status" value={task.status.toUpperCase()} tone={task.status === 'verified' ? 'cyan' : 'violet'} />
            <HudStat label="Payment" value={formatTokenAmount(task.paymentAmount, task.paymentSymbol)} />
            <HudStat label="Deadline" value={formatDateTime(task.deadline)} tone="violet" />
          </div>
        }
      />

      <section className="hud-panel-grid hud-panel-grid--three">
        <HudPanel>
          <p className="hud-panel__kicker">Settlement</p>
          <HudDefinitionList
            items={[
              { label: 'Task ID', value: task.taskId },
              { label: 'Contract', value: task.contractAddress, tone: 'cyan' },
              { label: 'Transaction hash', value: task.txHash },
            ]}
            compact
          />
        </HudPanel>

        <HudPanel>
          <p className="hud-panel__kicker">Participants</p>
          <HudDefinitionList
            items={[
              { label: 'Agent', value: formatAddress(task.agentId, 6), tone: 'cyan' },
              { label: 'Client', value: formatAddress(task.clientAddress, 6) },
              { label: 'Payment token', value: formatAddress(task.paymentToken, 6), tone: 'violet' },
            ]}
            compact
          />
        </HudPanel>

        <HudPanel>
          <p className="hud-panel__kicker">Bidding window</p>
          <HudDefinitionList
            items={[
              { label: 'Open', value: MOCK_BIDDING_STATE.open ? 'Yes' : 'No', tone: 'cyan' },
              { label: 'Commit ends', value: formatDateTime(MOCK_BIDDING_STATE.commitEndsAt) },
              { label: 'Reveal ends', value: formatDateTime(MOCK_BIDDING_STATE.revealEndsAt), tone: 'violet' },
            ]}
            compact
          />
        </HudPanel>
      </section>

      <section className="hud-split">
        <HudSectionHeading
          eyebrow="Proof anchors"
          title="Criteria, proof, and result fingerprints."
          description={
            <p>
              These hashes pin the expected outcome and the submitted evidence back to the settlement
              lifecycle for the task.
            </p>
          }
        />
        <HudPanel>
          <HudDefinitionList
            items={[
              { label: 'Criteria root', value: task.criteriaRoot, tone: 'cyan' },
              { label: 'Proof hash', value: task.proofHash },
              { label: 'Result hash', value: task.resultHash, tone: 'violet' },
            ]}
          />
        </HudPanel>
      </section>

      <section className="hud-stack">
        <HudSectionHeading
          eyebrow="Bid ledger"
          title="Observed commitment flow."
          description={<p>Current mock data includes the bidders, reveal state, and the winning address.</p>}
        />
        <div className="hud-table-wrap">
          <table className="hud-table">
            <thead>
              <tr>
                <th>Bidder</th>
                <th>Agent</th>
                <th>Amount</th>
                <th>Revealed</th>
                <th>Transaction</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BIDS.map((bid) => (
                <tr key={bid.txHash}>
                  <td>{formatAddress(bid.bidder, 6)}</td>
                  <td>{formatAddress(bid.agentId, 6)}</td>
                  <td>{formatTokenAmount(bid.amount)}</td>
                  <td>
                    <span className={`hud-chip hud-chip--${bid.revealed ? 'cyan' : 'amber'}`}>
                      {bid.revealed ? 'Revealed' : 'Committed'}
                    </span>
                  </td>
                  <td>
                    <code>{formatAddress(bid.txHash, 6)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <HudPanel className="hud-panel--dense">
          <div className="hud-inline-meta">
            <div className="hud-inline-meta__item">
              <span className="hud-inline-meta__label">Winner</span>
              <span className="hud-inline-meta__value">{formatAddress(MOCK_BIDDING_STATE.winner, 6)}</span>
            </div>
            <div className="hud-inline-meta__item">
              <span className="hud-inline-meta__label">Bond amount</span>
              <span className="hud-inline-meta__value">{formatTokenAmount(MOCK_BIDDING_STATE.bondAmount)}</span>
            </div>
          </div>
        </HudPanel>
      </section>
    </InteriorPage>
  );
}
