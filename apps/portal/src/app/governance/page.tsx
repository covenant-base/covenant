import { prepareGovernanceVoteCall } from '@covenant/sdk';
import { HudPageHeader, HudStat, InteriorPage } from '@/components/interior-hud';
import { TransactionBundleDocument } from '@/components/transaction-bundle-document';

export default function GovernancePage() {
  const bundle = prepareGovernanceVoteCall(1n, true);

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Governance"
        title="Prepare a Base governance vote."
        description={
          <p>
            Governance actions are prepared as Base transaction payloads for the active network manifest so
            operators can review the exact call sequence before execution.
          </p>
        }
        actions={[
          { href: '/protocol', label: 'Protocol surface', variant: 'primary' },
          { href: '/dashboard', label: 'Dashboard' },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Network" value={bundle.network} tone="cyan" />
            <HudStat label="Calls" value={bundle.calls.length.toLocaleString()} />
            <HudStat label="Proposal" value="1" tone="violet" />
          </div>
        }
      />

      <TransactionBundleDocument
        eyebrow="Payload"
        title="Governance vote payload"
        description="The prepared call below represents an affirmative vote on proposal 1 for the currently resolved network."
        bundle={bundle}
      />
    </InteriorPage>
  );
}
