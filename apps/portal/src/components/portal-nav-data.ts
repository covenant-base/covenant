import { covenantBrand } from '@covenant/config/brand';

export type PortalNavItem = {
  href: string;
  label: string;
  external?: boolean;
};

export type PortalAppNavItem = {
  href: string;
  label: string;
  activePrefixes?: string[];
};

export const primaryNavItems: PortalNavItem[] = [
  { href: '/protocol', label: 'Protocol' },
  { href: '/developers', label: 'Developers' },
  { href: '/integrations', label: 'Integrations' },
  { href: covenantBrand.docsUrl, label: 'Docs', external: true },
];

export const appNavItems: PortalAppNavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/tasks', label: 'Tasks', activePrefixes: ['/tasks'] },
  { href: '/agents/leaderboard', label: 'Agents', activePrefixes: ['/agents'] },
  { href: '/treasury', label: 'Treasury' },
  { href: '/templates', label: 'Templates' },
  { href: '/governance', label: 'Governance' },
  { href: '/staking', label: 'Staking' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/retro/check', label: 'Retro', activePrefixes: ['/retro'] },
];

function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') return pathname;
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function isNavItemActive(pathname: string, href: string, activePrefixes: string[] = []) {
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(href);

  if (!currentPath || !targetPath) return false;
  if (currentPath === targetPath) return true;

  return activePrefixes.some((prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`));
}

export function hasAppSubnav(pathname: string) {
  const currentPath = normalizePath(pathname);
  if (!currentPath || currentPath === '/') return false;
  return appNavItems.some((item) => isNavItemActive(currentPath, item.href, item.activePrefixes));
}
