import type { MetadataRoute } from 'next';
import { resolveSiteUrl } from '@covenant/config/brand';

const publicRoutes = ['/', '/protocol', '/developers', '/integrations'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolveSiteUrl();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route === '/' ? '' : route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }));
}
