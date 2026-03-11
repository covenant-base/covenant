import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SPECS_DIR = join(process.cwd(), '..', '..', 'docs', 'specs');

type SpecEntry = {
  slug: string;
  title: string;
  body: string;
};

function titleFromBody(body: string, slug: string) {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? slug;
}

export function listSpecs(): SpecEntry[] {
  return readdirSync(SPECS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const body = readFileSync(join(SPECS_DIR, file), 'utf8');
      const slug = file.replace(/\.md$/, '');
      return {
        slug,
        title: titleFromBody(body, slug),
        body,
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function readSpec(slug: string): SpecEntry | null {
  return listSpecs().find((entry) => entry.slug === slug) ?? null;
}
