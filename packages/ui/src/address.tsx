type Props = {
  value: string;
  chars?: number;
  className?: string;
};

export function Address({ value, chars = 4, className }: Props) {
  const short = value.length > chars * 2 + 2
    ? `${value.slice(0, chars)}...${value.slice(-chars)}`
    : value;

  return (
    <span
      title={value}
      className={['font-[var(--font-mono)] text-[11px]', className].filter(Boolean).join(' ')}
    >
      {short}
    </span>
  );
}
