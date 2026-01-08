import type { ReactNode } from 'react';

type Props = {
  message: string;
  action?: ReactNode;
};

export function EmptyState({ message, action }: Props) {
  return (
    <div className="border border-dashed border-[var(--ink)]/20 p-8 text-center">
      <p className="text-sm text-[var(--ink)]/60">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
