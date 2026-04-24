import type { HTMLAttributes, ReactNode } from 'react';

type Tone = 'danger' | 'warning' | 'info' | 'lime';

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children: ReactNode;
  tone?: Tone;
};

const tones: Record<Tone, string> = {
  danger:  'text-[var(--danger)] border-[var(--danger)]/30 bg-[var(--danger)]/5',
  warning: 'text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/5',
  info:    'text-[var(--info)] border-[var(--info)]/30 bg-[var(--info)]/5',
  lime:    'text-[var(--lime)] border-[var(--lime)]/30 bg-[var(--lime)]/5',
};

export function Alert({ children, tone = 'info', className, ...rest }: Props) {
  const base = 'font-[var(--font-mono)] text-[11px] border px-3 py-2';
  const cls = [base, tones[tone], className].filter(Boolean).join(' ');
  return <div role="alert" {...rest} className={cls}>{children}</div>;
}
