import Link from 'next/link';
import { covenantBrand } from '@covenant/config/brand';
import { listSpecs } from '@/lib/specs';

export default function DocsHomePage() {
  const specs = listSpecs();

  return (
    <main>
      <p style={{ textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--mute)' }}>Documentation</p>
      <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', margin: '0 0 12px' }}>
        {covenantBrand.shortName} on Base
      </h1>
      <p style={{ maxWidth: 680, color: 'var(--ink-3)', lineHeight: 1.7 }}>
        Operational docs for the Covenant Base runtime, service model, and launch cutover.
      </p>
      <section className="docs-grid" style={{ marginTop: 32 }}>
        {specs.map((spec) => (
          <Link className="docs-card" href={`/specs/${spec.slug}`} key={spec.slug}>
            <strong>{spec.title}</strong>
            <p style={{ color: 'var(--mute)', lineHeight: 1.6 }}>
              {spec.body.split('\n').find((line) => line.trim() && !line.startsWith('#'))?.trim() ?? 'Open spec'}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
