'use client';

import type { ReactNode } from 'react';

type Tab = {
  id: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  children?: ReactNode;
};

export function Tabs({ tabs, active, onChange, children }: Props) {
  return (
    <div>
      <nav className="flex gap-1 border-b border-[var(--ink)]/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={[
              'font-[var(--font-mono)] text-[11px] uppercase px-3 py-2 transition-colors border-b-2 -mb-px',
              active === t.id
                ? 'border-[var(--lime)] text-[var(--lime)]'
                : 'border-transparent text-[var(--mute)] hover:text-[var(--ink)]',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {children}
    </div>
  );
}
