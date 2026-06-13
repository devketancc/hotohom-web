import type { Metadata } from 'next';
import {
  Geist,
  Geist_Mono,
  Manrope,
  Inter,
  Cormorant_Garamond,
} from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/Providers';
import { LoginModalHost } from '@/components/auth/LoginModalHost';
import { CONSTANTS } from '@/config/constants';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const fleetSerif = Cormorant_Garamond({
  variable: '--font-fleet-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: CONSTANTS.APP_NAME,
  description: 'Premium Booking Platform',
};

import { SmoothScroll } from '@/components/shared/SmoothScroll';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${inter.variable} ${fleetSerif.variable}`}
    >
      <body className="antialiased w-full min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
        <SmoothScroll>
          <Providers>
            {children}
          </Providers>
        </SmoothScroll>
        <LoginModalHost />
      </body>
    </html>
  );
}
