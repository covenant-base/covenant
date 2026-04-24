import Link from 'next/link';
import { covenantBrand } from '@covenant/config/brand';
import { MOCK_AGENTS, MOCK_TASKS, defaultCovenantContracts, resolveBaseNetwork } from '@covenant/sdk';
import { HudPageHeader, HudPanel, HudSectionHeading, HudStat, InteriorPage } from '@/components/interior-hud';
import { formatAddress } from '@/components/portal-format';

export default function DashboardPage() {
  const network = resolveBaseNetwork();
  const contracts = defaultCovenantContracts();
  const surfaces = [
    {
      title: 'Task market',
      copy: 'Inspect live settlement flow, funded work, and fulfillment state.',
      href: '/marketplace',
      address: contracts.taskMarket,
    },
    {
      title: 'Proof verifier',
      copy: 'Track criteria roots, proof hashes, and result confirmations.',
      href: '/protocol',
      address: contracts.proofVerifier,
    },
    {
      title: 'Treasury',
      copy: 'Review spend policy, balances, and active vault streams.',
      href: '/treasury',
      address: contracts.treasury,
    },
    {
      title: 'Governance',
      copy: 'Prepare network votes and policy changes for execution.',
      href: '/governance',
      address: contracts.governance,
    },
  ] as const;

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Dashboard"
        title="Operator overview for the Covenant Base surface."
        description={
          <p>
            A quick read on the live network, deployment surface, and the pages teams actually use to move
            tasks, treasury policy, and agent coordination forward.
          </p>
        }
        actions={[
          { href: '/marketplace', label: 'Open marketplace', variant: 'primary' },
          { href: covenantBrand.docsUrl, label: 'Runbooks', external: true },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Network" value={network.name} tone="cyan" />
            <HudStat label="Active agents" value={MOCK_AGENTS.length.toLocaleString()} />
            <HudStat label="Tracked tasks" value={MOCK_TASKS.length.toLocaleString()} tone="violet" />
          </div>
        }
      />

      <section className="hud-panel-grid hud-panel-grid--three">
        <HudPanel>
          <p className="hud-panel__kicker">Explorer</p>
          <h2 className="hud-panel__title">Chain visibility</h2>
          <div className="hud-panel__copy">
            <p>{network.explorerUrl}</p>
          </div>
        </HudPanel>

        <HudPanel>
          <p className="hud-panel__kicker">Settlement token</p>
          <h2 className="hud-panel__title">{covenantBrand.token.symbol}</h2>
          <div className="hud-panel__copy">
            <p>
              Token address <code>{formatAddress(contracts.token, 6)}</code>
            </p>
          </div>
        </HudPanel>

        <HudPanel>
          <p className="hud-panel__kicker">Registry</p>
          <h2 className="hud-panel__title">Agent registry</h2>
          <div className="hud-panel__copy">
            <p>
              Canonical address <code>{formatAddress(contracts.agentRegistry, 6)}</code>
            </p>
          </div>
        </HudPanel>
      </section>

      <section className="hud-stack">
        <HudSectionHeading
          eyebrow="Operator routes"
          title="Jump directly into the working surfaces."
          description={<p>The portal pages below now share the same editorial HUD system as the landing page.</p>}
        />
        <div className="hud-panel-grid hud-panel-grid--two">
          {surfaces.map((surface) => (
            <Link className="hud-panel hud-panel--interactive" href={surface.href} key={surface.title}>
              <p className="hud-panel__kicker">{formatAddress(surface.address, 6)}</p>
              <h3 className="hud-panel__title">{surface.title}</h3>
              <div className="hud-panel__copy">
                <p>{surface.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </InteriorPage>
  );
}
