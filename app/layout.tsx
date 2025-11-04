import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';

// Dynamically load the client-only Toaster without SSR so server build won't
// try to bundle client-only deps into server chunks.
const Toaster = dynamic(() => import('@/components/ui/toaster'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GroupBuy - Better Prices Through Group Buying',
  description: 'Join group buys to unlock incredible discounts on amazing products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
