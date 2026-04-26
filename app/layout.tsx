import type { Metadata } from 'next';
import { Geist, Geist_Mono, Manrope, Inter } from 'next/font/google';
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

export const metadata: Metadata = {
  title: CONSTANTS.APP_NAME,
  description: 'Premium Booking Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${inter.variable}`}
    >
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Providers>
          {children}
        </Providers>
        <LoginModalHost />
      </body>
    </html>
  );
}
