'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteNav } from '@/components/site-nav';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (isHomePage) {
    return <div className="portal-shell portal-shell--home">{children}</div>;
  }

  return (
    <div className="portal-shell portal-shell--interior">
      <div className="portal-shell__backdrop" aria-hidden="true" />
      <div className="portal-shell__scanlines" aria-hidden="true" />

      <div className="portal-shell__frame" aria-hidden="true">
        <span className="portal-shell__frame-line portal-shell__frame-line--top" />
        <span className="portal-shell__frame-line portal-shell__frame-line--bottom" />
        <span className="portal-shell__frame-line portal-shell__frame-line--left" />
        <span className="portal-shell__frame-line portal-shell__frame-line--right" />
        <span className="portal-shell__crosshair portal-shell__crosshair--tl" />
        <span className="portal-shell__crosshair portal-shell__crosshair--tr" />
        <span className="portal-shell__crosshair portal-shell__crosshair--bl" />
        <span className="portal-shell__crosshair portal-shell__crosshair--br" />
      </div>

      <div className="portal-shell__inner">
        <SiteNav />
        {children}
      </div>
    </div>
  );
}
