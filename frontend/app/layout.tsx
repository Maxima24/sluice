import type { Metadata } from 'next';
import { IBM_Plex_Mono, Manrope, Oxanium } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from '@/components/layout/AppShell';
import { MagneticFillProvider } from '@/components/ui/MagneticFillProvider';

const oxanium = Oxanium({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-oxanium',
});
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
  title: 'Sluice - CKB Fiber Network Node Operability Dashboard',
  description: 'Operability dashboard for a CKB Fiber Network node',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${oxanium.variable} ${manrope.variable} ${ibmPlexMono.variable}`}>
      <body>
        <Providers>
          <MagneticFillProvider />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
