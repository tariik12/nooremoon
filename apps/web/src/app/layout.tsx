import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { template: '%s | NOOREMOON', default: 'NOOREMOON — Premium South Asian Fashion' },
  description: 'Premium South Asian fashion — panjabi, kurta, formal shirts and more.',
  openGraph: { siteName: 'NOOREMOON', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white text-[#111]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
