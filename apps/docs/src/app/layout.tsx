import type { Metadata } from 'next';
import { covenantBrand } from '@covenant/config/brand';
import './globals.css';

export const metadata: Metadata = {
  title: `${covenantBrand.shortName} Docs`,
  description: 'Covenant/Base deployment, runtime, and service documentation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
