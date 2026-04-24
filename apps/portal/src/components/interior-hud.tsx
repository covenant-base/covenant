import type { ReactNode } from 'react';
import Link from 'next/link';

type HudAction = {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
  external?: boolean;
};

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function HudActionLink({ href, label, variant = 'secondary', external = false }: HudAction) {
  const className = cx('hud-button', variant === 'primary' ? 'hud-button--primary' : 'hud-button--secondary');

  if (external) {
    return (
      <a href={href} className={className} rel="noreferrer" target="_blank">
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function InteriorPage({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cx('site-main interior-page interior-page--hud', className)}>{children}</main>;
}

export function HudPageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  actions?: HudAction[];
  meta?: ReactNode;
}) {
  return (
    <section className="hud-page-header">
      <div className="hud-page-header__copy">
        <p className="hud-kicker">{eyebrow}</p>
        <h1 className="hud-page-header__title">{title}</h1>
        {description ? <div className="hud-page-header__lede">{description}</div> : null}
      </div>

      {actions?.length ? (
        <div className="hud-action-row">
          {actions.map((action) => (
            <HudActionLink key={`${action.href}-${action.label}`} {...action} />
          ))}
        </div>
      ) : null}

      {meta ? <div className="hud-page-header__meta">{meta}</div> : null}
    </section>
  );
}

export function HudSectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <div className="hud-section-heading">
      <p className="hud-kicker">{eyebrow}</p>
      <h2 className="hud-section-heading__title">{title}</h2>
      {description ? <div className="hud-section-heading__copy">{description}</div> : null}
    </div>
  );
}

export function HudPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx('hud-panel', className)}>{children}</div>;
}

export function HudStat({
  label,
  value,
  tone = 'default',
  detail,
}: {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'cyan' | 'violet';
  detail?: ReactNode;
}) {
  return (
    <div className="hud-stat">
      <span className="hud-stat__label">{label}</span>
      <span className={cx('hud-stat__value', tone !== 'default' && `hud-stat__value--${tone}`)}>{value}</span>
      {detail ? <span className="hud-stat__detail">{detail}</span> : null}
    </div>
  );
}

export function HudDefinitionList({
  items,
  compact = false,
}: {
  items: Array<{ label: string; value: ReactNode; tone?: 'default' | 'cyan' | 'violet' }>;
  compact?: boolean;
}) {
  return (
    <dl className={cx('hud-facts', compact && 'hud-facts--compact')}>
      {items.map((item) => (
        <div className="hud-facts__row" key={item.label}>
          <dt>{item.label}</dt>
          <dd className={cx(item.tone && `hud-facts__value--${item.tone}`)}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HudCodePanel({
  eyebrow,
  title,
  description,
  payload,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  payload: unknown;
}) {
  return (
    <section className="hud-code-panel">
      <HudSectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="hud-code-panel__body">
        <pre className="hud-code-block">{JSON.stringify(payload, null, 2)}</pre>
      </div>
    </section>
  );
}
