import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

const base = 'border border-[var(--ink)]/20 bg-transparent px-3 py-2 font-[var(--font-mono)] text-sm focus:border-[var(--lime)] focus:outline-none transition-[border-color] duration-[var(--duration-fast)]';
const labelCls = 'font-[var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-[var(--mute)]';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, id, ...rest }: InputProps) {
  const cls = className ? `${base} ${className}` : base;
  if (!label) return <input {...rest} id={id} className={cls} />;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelCls}>{label}</label>
      <input {...rest} id={id} className={cls} />
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className, id, ...rest }: TextareaProps) {
  const cls = className ? `${base} resize-none ${className}` : `${base} resize-none`;
  if (!label) return <textarea {...rest} id={id} className={cls} />;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelCls}>{label}</label>
      <textarea {...rest} id={id} className={cls} />
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  children: ReactNode;
};

export function Select({ label, className, id, children, ...rest }: SelectProps) {
  const cls = className ? `${base} ${className}` : base;
  if (!label) return <select {...rest} id={id} className={cls}>{children}</select>;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelCls}>{label}</label>
      <select {...rest} id={id} className={cls}>{children}</select>
    </div>
  );
}
