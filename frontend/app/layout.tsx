import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'sonner';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TCG Draws | Premium Pokémon TCG Competitions & Graded Slabs',
  description:
    'Win PSA & BGS Gem Mint 10 Pokémon slabs, vintage booster packs, and modern grails. Transparent, verified, and secure prize draws from £1.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className='min-h-full flex flex-col'>
        <Providers>{children}</Providers>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#161810',
              border: '1px solid #2d3c13',
              color: '#e8edd4',
            },
            className: 'font-sans text-[14px]',
          }}
        />
      </body>
    </html>
  );
}
