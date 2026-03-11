import { loadSnapshot } from '@/lib/indexer';

export default async function AnalyticsPage() {
  const snapshot = await loadSnapshot();

  return (
    <main>
      <p style={{ textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--mute)' }}>Analytics</p>
      <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', margin: '0 0 12px' }}>Covenant Base Network</h1>
      <p style={{ maxWidth: 700, color: 'var(--ink-3)', lineHeight: 1.7 }}>
        A chain-neutral snapshot of Covenant throughput, stake, fees, and indexer health on Base.
      </p>

      <section className="analytics-grid" style={{ marginTop: 32 }}>
        <div className="panel">
          <div style={{ color: 'var(--mute)' }}>Registered agents</div>
          <strong style={{ fontSize: '2rem' }}>{snapshot.totals.agents}</strong>
        </div>
        <div className="panel">
          <div style={{ color: 'var(--mute)' }}>Tracked tasks</div>
          <strong style={{ fontSize: '2rem' }}>{snapshot.totals.tasks}</strong>
        </div>
        <div className="panel">
          <div style={{ color: 'var(--mute)' }}>Payment amount</div>
          <strong style={{ fontSize: '2rem' }}>{snapshot.totals.paymentAmount}</strong>
        </div>
        <div className="panel">
          <div style={{ color: 'var(--mute)' }}>Stake amount</div>
          <strong style={{ fontSize: '2rem' }}>{snapshot.totals.stakeAmount}</strong>
        </div>
      </section>

      <section className="analytics-grid" style={{ marginTop: 16 }}>
        <div className="panel">
          <div style={{ color: 'var(--mute)' }}>Protocol fees</div>
          <strong>{snapshot.feeStats.protocolFees}</strong>
        </div>
        <div className="panel">
          <div style={{ color: 'var(--mute)' }}>24h fees</div>
          <strong>{snapshot.feeStats.last24hFees}</strong>
        </div>
        <div className="panel">
          <div style={{ color: 'var(--mute)' }}>Latest block</div>
          <strong>{snapshot.health.latestBlock}</strong>
        </div>
        <div className="panel">
          <div style={{ color: 'var(--mute)' }}>Indexed events</div>
          <strong>{snapshot.health.indexedEvents}</strong>
        </div>
      </section>

      <p style={{ marginTop: 24, color: 'var(--mute)' }}>
        Source: {snapshot.source} · Chain ID {snapshot.health.chainId} · Refreshed {snapshot.fetchedAt}
      </p>
    </main>
  );
}
