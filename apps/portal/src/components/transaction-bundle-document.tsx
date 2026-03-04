import type { PreparedTransactionBundle } from '@covenant/sdk';
import { HudCodePanel, HudDefinitionList, HudPanel } from '@/components/interior-hud';

export function TransactionBundleDocument({
  eyebrow,
  title,
  description,
  bundle,
}: {
  eyebrow: string;
  title: string;
  description: string;
  bundle: PreparedTransactionBundle;
}) {
  return (
    <>
      <section className="hud-panel-grid hud-panel-grid--two">
        <HudPanel>
          <p className="hud-panel__kicker">Bundle metadata</p>
          <HudDefinitionList
            items={[
              { label: 'Network', value: bundle.network, tone: 'cyan' },
              { label: 'Chain ID', value: bundle.chainId.toLocaleString() },
              { label: 'Calls', value: bundle.calls.length.toLocaleString() },
            ]}
            compact
          />
        </HudPanel>

        <HudPanel>
          <p className="hud-panel__kicker">Call sequence</p>
          <div className="hud-list">
            {bundle.calls.map((call, index) => (
              <div className="hud-list__item" key={`${call.to}-${call.label}`}>
                <div>
                  <span className="hud-list__index">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{call.label}</strong>
                </div>
                <code className="hud-break">{call.to}</code>
              </div>
            ))}
          </div>
        </HudPanel>
      </section>

      <HudCodePanel eyebrow={eyebrow} title={title} description={description} payload={bundle} />
    </>
  );
}
