import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NIYAVO | Sculptural Acoustic Instruments & Pure Minimalist Design',
  description:
    'Experience NIYAVO: A minimalist aesthetic synthesis of aerospace titanium, planar magnetic transducers, and architectural form.',
  keywords: [
    'NIYAVO',
    'minimalist audio',
    '3D ecommerce',
    'planar magnetic',
    'architectural sound',
    'titanium speaker',
    'luxury acoustic',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#090A0C] text-[#EDEDED] flex flex-col font-sans selection:bg-amber-400 selection:text-zinc-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
