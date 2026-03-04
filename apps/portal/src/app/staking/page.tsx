import { prepareStakeCall } from '@covenant/sdk';
import { HudPageHeader, HudStat, InteriorPage } from '@/components/interior-hud';
import { TransactionBundleDocument } from '@/components/transaction-bundle-document';

export default function StakingPage() {
  const bundle = prepareStakeCall('100', 30n * 24n * 3600n);

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Staking"
        title="Prepare a bonded staking sequence."
        description={
          <p>
            Covenant staking on Base uses an ERC-20 approval followed by the staking contract write for the
            selected lock duration.
          </p>
        }
        actions={[
          { href: '/treasury', label: 'Treasury', variant: 'primary' },
          { href: '/protocol', label: 'Protocol surface' },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Network" value={bundle.network} tone="cyan" />
            <HudStat label="Calls" value={bundle.calls.length.toLocaleString()} />
            <HudStat label="Lock" value="30 days" tone="violet" />
          </div>
        }
      />

      <TransactionBundleDocument
        eyebrow="Payload"
        title="Staking payload"
        description="The bundle below shows the approval plus staking call sequence for a 100 COV position with a 30 day lock."
        bundle={bundle}
      />
    </InteriorPage>
  );
}
