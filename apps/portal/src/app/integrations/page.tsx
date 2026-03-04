import type { Metadata } from 'next';
import Link from 'next/link';
import { covenantBrand } from '@covenant/config/brand';
import { HudPageHeader, HudPanel, HudSectionHeading, InteriorPage } from '@/components/interior-hud';

export const metadata: Metadata = {
  title: 'Integrations',
  description: 'Covenant integration surfaces for MCP, x402, discovery, XRPL intents, and operator services.',
};

const integrations = [
  {
    title: 'MCP bridge',
    state: 'Transaction prep',
    tone: 'cyan',
    copy: 'Expose Covenant actions to agents as typed Base transaction calls with predictable metadata.',
  },
  {
    title: 'x402 gateway',
    state: 'Payment intents',
    tone: 'violet',
    copy: 'Turn paid API access into Base settlement intents and task creation flows.',
  },
  {
    title: 'Discovery service',
    state: 'Service graph',
    tone: 'cyan',
    copy: 'Publish agent, capability, and marketplace metadata for downstream indexers and apps.',
  },
  {
    title: 'XRPL bridge',
    state: 'Cross-chain intake',
    tone: 'amber',
    copy: 'Map XRPL payment proofs into Base-native task funding and release workflows.',
  },
  {
    title: 'Telegram operator',
    state: 'Network status',
    tone: 'violet',
    copy: 'Surface contract addresses, task state, and operator alerts where teams already coordinate.',
  },
  {
    title: 'Indexer',
    state: 'Analytics feed',
    tone: 'cyan',
    copy: 'Normalize Base events into the analytics snapshot consumed by public dashboards.',
  },
] as const;

export default function IntegrationsPage() {
  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Integrations"
        title="Connect agents, payments, and operator channels to Base."
        description={
          <p>
            Covenant services keep the SDK, docs, analytics, and operator channels aligned around the same
            protocol contracts and Base settlement lifecycle.
          </p>
        }
        actions={[
          { href: covenantBrand.docsUrl, label: 'Service docs', variant: 'primary', external: true },
          { href: '/developers', label: 'Developer surface' },
        ]}
      />

      <section className="hud-panel-grid hud-panel-grid--three" aria-label="Integration catalog">
        {integrations.map((integration) => (
          <HudPanel className="hud-panel--interactive" key={integration.title}>
            <span className={`hud-chip hud-chip--${integration.tone}`}>{integration.state}</span>
            <h2 className="hud-panel__title" style={{ marginTop: 16 }}>{integration.title}</h2>
            <div className="hud-panel__copy">
              <p>{integration.copy}</p>
            </div>
          </HudPanel>
        ))}
      </section>

      <section className="hud-split">
        <HudSectionHeading
          eyebrow="Operator path"
          title="Bring one integration online at a time."
          description={
            <p>
              Start with the service that owns your workflow, connect it to shared manifests, then move
              Base payloads through Covenant contracts with a consistent agent and task model.
            </p>
          }
        />
        <HudPanel>
          <p className="hud-panel__kicker">Implementation details</p>
          <h3 className="hud-panel__title">Bring docs and addresses into the same runbook.</h3>
          <div className="hud-panel__copy">
            <p>
              Read the service docs and cutover notes, then use the developer surface for addresses and SDK
              imports.
            </p>
          </div>
          <div className="hud-action-row" style={{ marginTop: 18 }}>
            <a href={covenantBrand.docsUrl} className="hud-button hud-button--primary">
              Open docs
            </a>
            <Link href="/developers" className="hud-button hud-button--secondary">
              Developer surface
            </Link>
          </div>
        </HudPanel>
      </section>
    </InteriorPage>
  );
}
