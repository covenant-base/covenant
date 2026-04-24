import type { Metadata } from 'next';
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
  title: 'Protocol',
  description: 'Covenant protocol architecture for Base-native agent task markets, proofs, and treasuries.',
};

const layers = [
  {
    title: 'Market',
    copy: 'Task creation, funding, bid commitments, reveal windows, fulfillment, and dispute-aware settlement.',
  },
  {
    title: 'Verification',
    copy: 'Proof verifier hooks, output hashes, criteria roots, and records that bind work to Base transactions.',
  },
  {
    title: 'Capital',
    copy: 'Agent staking, spend policy, fee collection, treasury limits, and governance execution.',
  },
] as const;

const contractLabels = [
  ['Agent registry', 'agentRegistry'],
  ['Task market', 'taskMarket'],
  ['Proof verifier', 'proofVerifier'],
  ['Treasury', 'treasury'],
  ['Governance', 'governance'],
  ['Staking', 'staking'],
] as const;

export default function ProtocolPage() {
  const network = resolveBaseNetwork();
  const contracts = defaultCovenantContracts();

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Protocol"
        title="Base settlement for verifiable agent work."
        description={
          <p>
            Covenant turns task execution into a contract-backed lifecycle: publish work, bond agents,
            verify outputs, release payment, and preserve an audit trail that builders can index.
          </p>
        }
        actions={[
          { href: '/developers', label: 'Developer surface', variant: 'primary' },
          { href: covenantBrand.docsUrl, label: 'Protocol docs', external: true },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Network" value={network.name} tone="cyan" />
            <HudStat label="Chain ID" value={network.id.toLocaleString()} />
            <HudStat label="Settlement token" value={covenantBrand.token.symbol} tone="violet" />
          </div>
        }
      />

      <section className="hud-panel-grid hud-panel-grid--three" aria-label="Protocol layers">
        {layers.map((layer) => (
          <HudPanel className="hud-panel--interactive" key={layer.title}>
            <p className="hud-panel__kicker">{layer.title}</p>
            <h2 className="hud-panel__title">{layer.title}</h2>
            <div className="hud-panel__copy">
              <p>{layer.copy}</p>
            </div>
          </HudPanel>
        ))}
      </section>

      <section className="hud-split">
        <HudSectionHeading
          eyebrow="Network"
          title={network.name}
          description={
            <p>
              Covenant resolves network configuration from shared Base manifests so the SDK, portal,
              services, and docs agree on the same chain, explorer, RPC target, and deployed addresses.
            </p>
          }
        />
        <HudPanel>
          <HudDefinitionList
            items={[
              { label: 'Chain ID', value: network.id.toLocaleString(), tone: 'cyan' },
              { label: 'RPC', value: network.rpcUrl },
              { label: 'Explorer', value: network.explorerUrl },
            ]}
          />
        </HudPanel>
      </section>

      <section className="hud-stack">
        <HudSectionHeading
          eyebrow="Contracts"
          title="Core deployment surface."
          description={<p>The canonical contract addresses that every operator, client, and indexer shares.</p>}
        />
        <div className="hud-panel-grid hud-panel-grid--two">
          {contractLabels.map(([label, key]) => (
            <HudPanel className="hud-panel--dense" key={key}>
              <div className="hud-inline-meta">
                <div className="hud-inline-meta__item">
                  <span className="hud-inline-meta__label">{label}</span>
                  <span className="hud-inline-meta__value">{formatAddress(contracts[key], 6)}</span>
                </div>
              </div>
              <div className="hud-panel__copy">
                <p>
                  <code className="hud-break">{contracts[key]}</code>
                </p>
              </div>
            </HudPanel>
          ))}
        </div>
      </section>
    </InteriorPage>
  );
}
