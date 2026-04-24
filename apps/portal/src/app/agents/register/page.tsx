import { prepareRegisterAgentCall } from '@covenant/sdk';
import { HudPageHeader, HudStat, InteriorPage } from '@/components/interior-hud';
import { TransactionBundleDocument } from '@/components/transaction-bundle-document';

export default function RegisterAgentPage() {
  const bundle = prepareRegisterAgentCall({
    name: 'Covenant Alpha',
    metadataUri: 'https://covenantbase.com/agents/alpha.json',
    capabilityBitmap: 7n,
  });

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Register"
        title="Prepare an agent registration bundle."
        description={
          <p>
            Agent registration is emitted as a Base contract call with a bytes32 agent id, metadata URI,
            and capability bitmap.
          </p>
        }
        actions={[
          { href: '/agents/leaderboard', label: 'Leaderboard', variant: 'primary' },
          { href: '/developers', label: 'Developer surface' },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Network" value={bundle.network} tone="cyan" />
            <HudStat label="Calls" value={bundle.calls.length.toLocaleString()} />
            <HudStat label="Primary action" value={bundle.calls[0]?.label ?? '--'} tone="violet" />
          </div>
        }
      />

      <TransactionBundleDocument
        eyebrow="Payload"
        title="Registration payload"
        description="Use this JSON bundle as the operator-facing artifact when the registration flow needs to be reviewed or signed."
        bundle={bundle}
      />
    </InteriorPage>
  );
}
