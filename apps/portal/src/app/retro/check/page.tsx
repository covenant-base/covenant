'use client';

import { useSession } from '@covenant/sdk-ui';
import { HudDefinitionList, HudPageHeader, HudPanel, InteriorPage } from '@/components/interior-hud';
import { formatAddress, formatDateTime } from '@/components/portal-format';

export default function RetroCheckPage() {
  const session = useSession();
  const currentSession = session.data;

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Retro"
        title="Check whether this browser session is ready."
        description={
          <p>
            Retro surfaces depend on a valid SIWE session. This page keeps the check in the same operator
            shell as the rest of the portal instead of dropping back to a plain placeholder.
          </p>
        }
        actions={[
          { href: '/dashboard', label: 'Dashboard', variant: 'primary' },
          { href: '/protocol', label: 'Protocol surface' },
        ]}
      />

      <section className="hud-panel-grid hud-panel-grid--two">
        <HudPanel>
          <p className="hud-panel__kicker">Session state</p>
          {currentSession ? (
            <HudDefinitionList
              items={[
                { label: 'Address', value: formatAddress(currentSession.address, 6), tone: 'cyan' },
                { label: 'Expires', value: formatDateTime(currentSession.expiresAt), tone: 'violet' },
              ]}
            />
          ) : (
            <div className="hud-panel__copy">
              <p>Sign in with SIWE to inspect retro surfaces and route-specific eligibility.</p>
            </div>
          )}
        </HudPanel>

        <HudPanel>
          <p className="hud-panel__kicker">What this checks</p>
          <div className="hud-panel__copy">
            <p>
              Covenant only exposes retro-specific data when the session can be resolved on the current
              Base-aware operator surface.
            </p>
          </div>
        </HudPanel>
      </section>
    </InteriorPage>
  );
}
