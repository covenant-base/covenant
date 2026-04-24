import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { listSpecs, readSpec } from '@/lib/specs';

export const dynamicParams = false;

export async function generateStaticParams() {
  return listSpecs().map((entry) => ({
    slug: entry.slug,
  }));
}

export default async function SpecPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spec = readSpec(slug);
  if (!spec) notFound();

  return (
    <main>
      <article
        style={{ lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: marked.parse(spec.body) }}
      />
    </main>
  );
}
