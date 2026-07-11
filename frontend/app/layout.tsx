import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Fiber Liquidity Layer',
  description: 'Operability dashboard for a CKB Fiber Network node',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#02050b] font-sans text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
