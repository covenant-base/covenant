import type { ReactNode } from 'react';

type Column<T> = {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
};

export function DataTable<T>({ columns, data, keyExtractor, onRowClick, emptyMessage = 'No data.' }: Props<T>) {
  if (data.length === 0) {
    return (
      <div className="border border-dashed border-[var(--ink)]/20 p-8 text-center text-sm text-[var(--ink)]/60">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border border-[var(--ink)]/10 overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-[var(--ink)]/5">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'text-left px-3 py-2 font-[var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-[var(--mute)] font-normal',
                  col.className,
                ].filter(Boolean).join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={keyExtractor(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={[
                'border-t border-[var(--ink)]/5',
                onRowClick ? 'cursor-pointer hover:bg-[var(--ink)]/[0.03]' : '',
              ].filter(Boolean).join(' ')}
            >
              {columns.map((col) => (
                <td key={col.key} className={['px-3 py-2', col.className].filter(Boolean).join(' ')}>
                  {col.render(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
