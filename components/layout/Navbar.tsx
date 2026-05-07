'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NavbarAuthCluster } from '@/components/layout/NavbarAuthCluster';

const NAV_ITEMS = [
  { label: 'Journeys', href: '/journeys' },
  { label: 'Fleet', href: '/fleet' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full px-4 pt-4 md:px-6 md:pt-6">
      <div
        className={[
          'mx-auto flex max-w-screen-2xl items-center justify-between rounded-2xl px-6 md:px-10 transition-all duration-500 ease-out',
          scrolled
            ? 'border border-white/[0.09] bg-stitch-background/55 py-4 backdrop-blur-2xl shadow-[0_18px_55px_-30px_rgba(0,0,0,0.8)]'
            : 'border border-transparent bg-black/[0.18] py-6 backdrop-blur-md',
        ].join(' ')}
      >
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity duration-300 hover:opacity-80"
        >
          <span
            aria-hidden
            className="block size-1.5 rounded-[1px] bg-stitch-primary-container shadow-[0_0_12px_rgba(229,185,92,0.5)]"
          />
          <span className="font-headline text-[22px] font-semibold tracking-[-0.02em] text-stitch-on-background">
            Motohom
          </span>
        </Link>

        {/* Centered nav */}
        <div className="hidden items-center gap-10 lg:gap-12 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative font-headline text-[11px] font-medium uppercase tracking-[0.22em] text-slate-300/90 transition-all duration-500 ease-out hover:text-stitch-on-background"
            >
              {item.label}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-stitch-primary-container/80 transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-5 md:gap-7">
          <Link
            href="/staff-login"
            className="font-headline hidden text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 transition-colors duration-300 hover:text-stitch-primary-container lg:inline-block"
          >
            Staff
          </Link>
          <NavbarAuthCluster
            loginButtonClassName="font-headline shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition-colors duration-300 hover:text-stitch-primary-container"
          />
          <Link
            href="/booking"
            className="group inline-flex items-center rounded-full border border-stitch-primary-container/30 bg-stitch-primary-container/95 px-5 py-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container transition-all duration-500 ease-out hover:-translate-y-px hover:border-stitch-primary-container/65 hover:brightness-105 hover:shadow-[0_14px_34px_-16px_rgba(229,185,92,0.75)]"
          >
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
