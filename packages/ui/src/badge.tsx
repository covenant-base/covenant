import type { HTMLAttributes } from 'react';

type Tone = 'default' | 'lime' | 'danger' | 'warning' | 'info' | 'mute';

type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children: string;
  tone?: Tone;
};

const tones: Record<Tone, string> = {
  default: 'text-[var(--ink)] bg-[var(--ink)]/5 border-[var(--ink)]/20',
  lime:    'text-[var(--lime)] bg-[var(--lime)]/10 border-[var(--lime)]/30',
  danger:  'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/30',
  warning: 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/30',
  info:    'text-[var(--info)] bg-[var(--info)]/10 border-[var(--info)]/30',
  mute:    'text-[var(--mute)] bg-[var(--mute)]/10 border-[var(--mute)]/30',
};

export function Badge({ children, tone = 'default', className, ...rest }: Props) {
  const base = 'inline-flex items-center font-[var(--font-mono)] text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border';
  const cls = [base, tones[tone], className].filter(Boolean).join(' ');
  return <span {...rest} className={cls}>{children}</span>;
}
