import type { HTMLAttributes, ReactNode } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: 'default' | 'interactive' | 'inset';
};

const variants: Record<NonNullable<Props['variant']>, string> = {
  default: 'border border-[var(--ink)]/10 p-5',
  interactive: 'border border-[var(--ink)]/10 p-5 hover:border-[var(--lime)]/40 transition-[border-color] duration-[var(--duration-normal)]',
  inset: 'bg-[var(--ink)]/[0.02] border border-[var(--ink)]/10 p-5',
};

export function Card({ children, variant = 'default', className, ...rest }: Props) {
  const cls = className ? `${variants[variant]} ${className}` : variants[variant];
  return <div {...rest} className={cls}>{children}</div>;
}
