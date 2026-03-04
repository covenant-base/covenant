'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { covenantBrand } from '@covenant/config/brand';
import { appNavItems, hasAppSubnav, isNavItemActive, primaryNavItems } from '@/components/portal-nav-data';

export function SiteNav() {
  const pathname = usePathname() ?? '/';
  const showAppSubnav = hasAppSubnav(pathname);

  return (
    <header className="site-nav">
      <div className="site-nav__primary">
        <Link href="/" className="site-brand" aria-label={`${covenantBrand.shortName} home`}>
          <Image src="/logomark.png" alt="" className="site-brand-mark" width={36} height={36} priority unoptimized />
          <div className="site-brand__copy">
            <Image
              src="/logo-text.png"
              alt={covenantBrand.shortName}
              className="site-brand-wordmark"
              width={150}
              height={21}
              priority
              unoptimized
            />
            <span className="site-brand__meta">Agentic consensus protocol</span>
          </div>
        </Link>

        <nav className="site-nav-links" aria-label="Primary navigation">
          {primaryNavItems.map((item) =>
            item.external ? (
              <a href={item.href} key={item.href} className="site-nav-link" rel="noreferrer" target="_blank">
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                key={item.href}
                className={isNavItemActive(pathname, item.href) ? 'site-nav-link site-nav-link--active' : 'site-nav-link'}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <a href={covenantBrand.repoUrl} className="site-nav-action hud-button hud-button--secondary" rel="noreferrer" target="_blank">
          GitHub
        </a>
      </div>

      {showAppSubnav ? (
        <div className="site-subnav">
          <span className="site-subnav__label">Operator surface</span>
          <nav className="site-subnav__links" aria-label="Application navigation">
            {appNavItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={
                  isNavItemActive(pathname, item.href, item.activePrefixes)
                    ? 'site-subnav__link site-subnav__link--active'
                    : 'site-subnav__link'
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
