import { MOCK_TEMPLATES } from '@covenant/sdk';
import { HudDefinitionList, HudPageHeader, HudPanel, HudStat, InteriorPage } from '@/components/interior-hud';
import { formatAddress, formatInteger } from '@/components/portal-format';

export default function TemplatesPage() {
  const activeTemplates = MOCK_TEMPLATES.filter((template) => template.active).length;

  return (
    <InteriorPage>
      <HudPageHeader
        eyebrow="Templates"
        title="Reusable task and workflow templates."
        description={
          <p>
            Templates make common Covenant job types easier to publish with consistent metadata, royalty
            rules, and author attribution.
          </p>
        }
        actions={[
          { href: '/marketplace', label: 'Marketplace', variant: 'primary' },
          { href: '/developers', label: 'Developer surface' },
        ]}
        meta={
          <div className="hud-stat-grid hud-stat-grid--three">
            <HudStat label="Templates" value={formatInteger(MOCK_TEMPLATES.length)} tone="cyan" />
            <HudStat label="Active" value={formatInteger(activeTemplates)} />
            <HudStat label="Average royalty" value="400 BPS" tone="violet" />
          </div>
        }
      />

      <section className="hud-panel-grid hud-panel-grid--three">
        {MOCK_TEMPLATES.map((template) => (
          <HudPanel className="hud-panel--interactive" key={template.templateId}>
            <span className={`hud-chip hud-chip--${template.active ? 'cyan' : 'amber'}`}>
              {template.active ? 'Active' : 'Inactive'}
            </span>
            <h2 className="hud-panel__title" style={{ marginTop: 16 }}>
              {formatAddress(template.templateId, 6)}
            </h2>
            <div className="hud-panel__copy">
              <p>{template.metadataUri}</p>
            </div>
            <div style={{ marginTop: 18 }}>
              <HudDefinitionList
                items={[
                  { label: 'Author', value: formatAddress(template.author, 6), tone: 'cyan' },
                  { label: 'Royalty', value: `${template.royaltyBps} BPS` },
                ]}
                compact
              />
            </div>
          </HudPanel>
        ))}
      </section>
    </InteriorPage>
  );
}
