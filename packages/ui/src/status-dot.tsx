type Props = {
  status: 'active' | 'paused' | 'error' | 'idle';
  label?: string;
};

const colors: Record<Props['status'], string> = {
  active: 'bg-[var(--lime)]',
  paused: 'bg-[var(--warning)]',
  error:  'bg-[var(--danger)]',
  idle:   'bg-[var(--mute)]',
};

export function StatusDot({ status, label }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${colors[status]}`} />
      {label && (
        <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.08em]">
          {label}
        </span>
      )}
    </span>
  );
}
