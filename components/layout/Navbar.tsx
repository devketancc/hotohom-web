'use client';

import Link from 'next/link';
import { NavbarAuthCluster } from '@/components/layout/NavbarAuthCluster';

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl transition-all duration-300 ease-in-out">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-8 py-6">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-stitch-primary-container">
          Motohom
        </Link>
        <div className="hidden items-center space-x-10 md:flex">
          <Link
            href="/destinations"
            className="font-headline border-b-2 border-stitch-primary-container pb-1 text-sm font-medium uppercase tracking-tight text-stitch-primary-container"
          >
            Destinations
          </Link>
          <Link
            href="/fleet"
            className="font-headline text-sm font-medium uppercase tracking-tight text-slate-200 transition-colors hover:text-stitch-primary-container"
          >
            Fleet
          </Link>
          <Link
            href="/packages"
            className="font-headline text-sm font-medium uppercase tracking-tight text-slate-200 transition-colors hover:text-stitch-primary-container"
          >
            Packages
          </Link>
          <Link
            href="/about"
            className="font-headline text-sm font-medium uppercase tracking-tight text-slate-200 transition-colors hover:text-stitch-primary-container"
          >
            About
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <NavbarAuthCluster />
        </div>
      </div>
    </nav>
  );
}
