import type { MetadataRoute } from 'next';
import { resolveSiteUrl } from '@covenant/config/brand';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
