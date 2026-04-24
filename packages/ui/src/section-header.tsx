import type { ReactNode } from 'react';

type Props = {
  tag: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeader({ tag, title, description, action }: Props) {
  return (
    <header className="border-b border-[var(--ink)]/10 pb-6">
      <div className="flex items-center justify-between">
        <div className="font-[var(--font-mono)] text-[10px] text-[var(--mute)] tracking-[0.15em] uppercase mb-1">
          {tag}
        </div>
        {action}
      </div>
      <h1 className="font-[var(--font-display)] text-2xl tracking-[-0.01em]">{title}</h1>
      {description && (
        <p className="text-sm text-[var(--mute)] mt-1">{description}</p>
      )}
    </header>
  );
}
