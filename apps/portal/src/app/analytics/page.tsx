import { covenantBrand } from '@covenant/config/brand';
import { HudPageHeader, InteriorPage } from '@/components/interior-hud';

export default function PortalAnalyticsPage() {
  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Analytics"
        title="Live charts live in the dedicated analytics app."
        description={
          <p>
            The portal keeps this surface intentionally lightweight. Use the treasury, marketplace, and
            protocol routes here for operational review, then jump to the analytics app for deeper time
            series and fee telemetry.
          </p>
        }
        actions={[
          { href: '/treasury', label: 'Treasury view', variant: 'primary' },
          { href: covenantBrand.docsUrl, label: 'Analytics docs', external: true },
        ]}
      />

      <section className="hud-empty-state">
        <p className="hud-panel__kicker">Current guidance</p>
        <h2 className="hud-empty-state__title">Use the dedicated analytics deployment for live dashboards.</h2>
        <div className="hud-empty-state__copy">
          <p>
            This portal route now behaves like a styled handoff surface rather than a placeholder. It keeps
            the same design language as the rest of the site while directing teams to the right runtime for
            chart-heavy work.
          </p>
        </div>
        <div className="hud-action-row">
          <a href={covenantBrand.docsUrl} className="hud-button hud-button--secondary">
            Open docs
          </a>
        </div>
      </section>
    </InteriorPage>
  );
}
