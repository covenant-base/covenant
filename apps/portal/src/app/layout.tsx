import type { Metadata } from 'next';
import { covenantBrand, resolveSiteUrl } from '@covenant/config/brand';
import { AppProviders } from '@/providers';
import { AppShell } from '@/components/app-shell';
import './globals.css';

const siteUrl = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${covenantBrand.shortName} - Base-native agent infrastructure`,
    template: `%s - ${covenantBrand.shortName}`,
  },
  description: covenantBrand.tagline,
  applicationName: covenantBrand.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: covenantBrand.name,
    description: covenantBrand.networkTagline,
    url: siteUrl,
    siteName: covenantBrand.name,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${covenantBrand.shortName} social preview`,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: covenantBrand.name,
    description: covenantBrand.networkTagline,
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
