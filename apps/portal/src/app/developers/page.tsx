import type { Metadata } from 'next';
import Link from 'next/link';
import { covenantBrand } from '@covenant/config/brand';
import { defaultCovenantContracts, resolveBaseNetwork } from '@covenant/sdk';
import {
  HudDefinitionList,
  HudPageHeader,
  HudPanel,
  HudSectionHeading,
  HudStat,
  InteriorPage,
} from '@/components/interior-hud';
import { formatAddress } from '@/components/portal-format';

export const metadata: Metadata = {
  title: 'Developers',
  description: 'Build with the Covenant SDK, Base contract addresses, manifests, and service interfaces.',
};

const quickstart = [
  {
    title: 'Install the SDK',
    command: 'pnpm add @covenant/sdk',
  },
  {
    title: 'Resolve the Base network',
    command: "import { resolveBaseNetwork } from '@covenant/sdk';",
  },
  {
    title: 'Prepare contract calls',
    command: "import { defaultCovenantContracts } from '@covenant/sdk';",
  },
] as const;

const resources = [
  {
    title: 'Runtime docs',
    copy: 'Base deployment notes, service model, and launch runbooks.',
    href: covenantBrand.docsUrl,
    external: true,
  },
  {
    title: 'Source repository',
    copy: 'Contracts, services, SDK packages, and infrastructure config.',
    href: covenantBrand.repoUrl,
    external: true,
  },
  {
    title: 'Protocol overview',
    copy: 'Market, proof, treasury, staking, and governance layers.',
    href: '/protocol',
    external: false,
  },
] as const satisfies ReadonlyArray<{
  title: string;
  copy: string;
  href: string;
  external?: boolean;
}>;

export default function DevelopersPage() {
  const network = resolveBaseNetwork();
  const contracts = defaultCovenantContracts();

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Developers"
        title="Ship against Covenant with Base-ready primitives."
        description={
          <p>
            The SDK exposes network resolution, ABI-backed contract helpers, transaction payload builders,
            SIWE session utilities, and mock data for local product work.
          </p>
        }
        actions={[
          { href: covenantBrand.docsUrl, label: 'Open docs', variant: 'primary', external: true },
          { href: covenantBrand.repoUrl, label: 'Source repository', external: true },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Network" value={network.name} tone="cyan" />
            <HudStat label="Chain ID" value={network.id.toLocaleString()} />
            <HudStat label="Token" value={covenantBrand.token.symbol} tone="violet" />
          </div>
        }
      />

      <section className="hud-split">
        <HudSectionHeading
          eyebrow="Quickstart"
          title="From package install to contract surface."
          description={
            <p>
              Covenant packages are workspace-native in this repository and designed to publish as small,
              typed interfaces for Base task markets and proof-driven agent flows.
            </p>
          }
        />
        <div className="hud-panel-grid">
          {quickstart.map((item, index) => (
            <HudPanel className="hud-panel--dense" key={item.title}>
              <span className="hud-list__index">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="hud-panel__title">{item.title}</h3>
              <div className="hud-panel__copy">
                <p>
                  <code>{item.command}</code>
                </p>
              </div>
            </HudPanel>
          ))}
        </div>
      </section>

      <section className="hud-stack">
        <HudSectionHeading eyebrow="Active config" title={network.name} />
        <div className="hud-panel-grid hud-panel-grid--three">
          <HudPanel>
            <p className="hud-panel__kicker">Network</p>
            <HudDefinitionList
              items={[
                { label: 'Chain ID', value: network.id.toLocaleString(), tone: 'cyan' },
                { label: 'RPC', value: network.rpcUrl },
                { label: 'Explorer', value: network.explorerUrl },
              ]}
              compact
            />
          </HudPanel>

          <HudPanel>
            <p className="hud-panel__kicker">Contracts</p>
            <HudDefinitionList
              items={[
                { label: 'Task market', value: formatAddress(contracts.taskMarket, 6), tone: 'cyan' },
                { label: 'Agent registry', value: formatAddress(contracts.agentRegistry, 6) },
                { label: 'Token', value: formatAddress(contracts.token, 6), tone: 'violet' },
              ]}
              compact
            />
          </HudPanel>

          <HudPanel>
            <p className="hud-panel__kicker">Auth</p>
            <div className="hud-panel__copy">
              <p>
                SIWE sessions use <code>{covenantBrand.cookies.nonce}</code> and{' '}
                <code>{covenantBrand.cookies.session}</code> cookies across Base-aware actions.
              </p>
            </div>
          </HudPanel>
        </div>
      </section>

      <section className="hud-panel-grid hud-panel-grid--three" aria-label="Developer resources">
        {resources.map((resource) =>
          resource.external ? (
            <a className="hud-panel hud-panel--interactive" href={resource.href} key={resource.title} rel="noreferrer" target="_blank">
              <p className="hud-panel__kicker">Resource</p>
              <h2 className="hud-panel__title">{resource.title}</h2>
              <div className="hud-panel__copy">
                <p>{resource.copy}</p>
              </div>
            </a>
          ) : (
            <Link className="hud-panel hud-panel--interactive" href={resource.href} key={resource.title}>
              <p className="hud-panel__kicker">Resource</p>
              <h2 className="hud-panel__title">{resource.title}</h2>
              <div className="hud-panel__copy">
                <p>{resource.copy}</p>
              </div>
            </Link>
          ),
        )}
      </section>
    </InteriorPage>
  );
}
