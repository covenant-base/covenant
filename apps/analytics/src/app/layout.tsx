import type { Metadata } from 'next';
import { covenantBrand } from '@covenant/config/brand';
import './globals.css';

export const metadata: Metadata = {
  title: `${covenantBrand.shortName} Analytics`,
  description: 'Base-native network analytics for Covenant.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
