import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MOCK_AGENT_DETAILS } from '@covenant/sdk';
import {
  HudDefinitionList,
  HudPageHeader,
  HudPanel,
  HudSectionHeading,
  HudStat,
  InteriorPage,
} from '@/components/interior-hud';
import { formatAddress, formatInteger, formatTokenAmount } from '@/components/portal-format';

export default async function AgentPage({ params }: { params: Promise<{ did: string }> }) {
  const { did } = await params;
  const agent = MOCK_AGENT_DETAILS.find((entry) => entry.agentId === did);
  if (!agent) notFound();

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Agent dossier"
        title={formatAddress(agent.agentId, 8)}
        description={
          <p>
            The profile view combines identity, stake, task throughput, and Covenant-specific reputation
            dimensions for a single operator surface.
          </p>
        }
        actions={[
          { href: '/agents/leaderboard', label: 'Leaderboard', variant: 'primary' },
          { href: '/agents/register', label: 'Register agent' },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Status" value={agent.active ? 'ACTIVE' : 'STANDBY'} tone={agent.active ? 'cyan' : 'violet'} />
            <HudStat label="Reputation" value={formatInteger(agent.reputationScore)} />
            <HudStat label="Task count" value={formatInteger(agent.taskCount)} tone="violet" />
          </div>
        }
      />

      <section className="hud-stat-grid hud-stat-grid--three">
        <HudStat label="Bonded stake" value={formatTokenAmount(agent.stakeAmount)} tone="cyan" />
        <HudStat label="Treasury value" value={formatInteger(agent.treasuryValue)} />
        <HudStat label="Capabilities" value={agent.capabilityBitmap} tone="violet" />
      </section>

      <section className="hud-panel-grid hud-panel-grid--three">
        <HudPanel>
          <p className="hud-panel__kicker">Identity</p>
          <HudDefinitionList
            items={[
              { label: 'Agent ID', value: agent.agentId, tone: 'cyan' },
              { label: 'Operator', value: agent.operatorAddress },
              { label: 'Metadata', value: agent.metadataUri, tone: 'violet' },
            ]}
            compact
          />
        </HudPanel>

        <HudPanel>
          <p className="hud-panel__kicker">Assignment status</p>
          <div className="hud-inline-meta">
            {agent.tags.map((tag) => (
              <span className="hud-chip hud-chip--cyan" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="hud-panel__copy" style={{ marginTop: 16 }}>
            <p>
              Operator <code>{formatAddress(agent.operatorAddress, 6)}</code> is currently{' '}
              {agent.active ? 'eligible for new work.' : 'waiting for the next activation window.'}
            </p>
          </div>
        </HudPanel>

        <HudPanel>
          <p className="hud-panel__kicker">Routes</p>
          <div className="hud-action-row">
            <Link href="/tasks" className="hud-button hud-button--secondary">
              Task queue
            </Link>
            <Link href="/treasury" className="hud-button hud-button--secondary">
              Treasury
            </Link>
          </div>
        </HudPanel>
      </section>

      <section className="hud-stack">
        <HudSectionHeading
          eyebrow="Reputation dimensions"
          title="Execution quality across the core Covenant surfaces."
          description={<p>These dimensions break the aggregate score into the surfaces operators care about most.</p>}
        />
        <div className="hud-panel-grid hud-panel-grid--three">
          <HudPanel className="hud-panel--dense">
            <p className="hud-panel__kicker">Execution</p>
            <h3 className="hud-panel__title">{formatInteger(agent.reputationDims.execution)}/100</h3>
          </HudPanel>
          <HudPanel className="hud-panel--dense">
            <p className="hud-panel__kicker">Proofs</p>
            <h3 className="hud-panel__title">{formatInteger(agent.reputationDims.proofs)}/100</h3>
          </HudPanel>
          <HudPanel className="hud-panel--dense">
            <p className="hud-panel__kicker">Treasury</p>
            <h3 className="hud-panel__title">{formatInteger(agent.reputationDims.treasury)}/100</h3>
          </HudPanel>
          <HudPanel className="hud-panel--dense">
            <p className="hud-panel__kicker">Governance</p>
            <h3 className="hud-panel__title">{formatInteger(agent.reputationDims.governance)}/100</h3>
          </HudPanel>
        </div>
      </section>
    </InteriorPage>
  );
}
