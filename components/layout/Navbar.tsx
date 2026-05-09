'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MotohomLogo } from '@/components/brand/MotohomLogo';
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
      <div className="relative mx-auto max-w-screen-2xl">
        {/* Logo above the glass row: backdrop-filter isolates blend; here lighten keys black to the scene behind */}
        <Link
          href="/"
          className="absolute left-6 top-1/2 z-10 -translate-y-1/2 mix-blend-lighten transition-opacity duration-300 hover:opacity-80 md:left-10"
        >
          <MotohomLogo className="h-7 w-auto md:h-8" priority />
        </Link>

        <div
          className={[
            'flex w-full items-center rounded-2xl pl-[7.25rem] pr-6 transition-all duration-500 ease-out md:pl-44 md:pr-10',
            scrolled
              ? 'border border-white/[0.09] bg-stitch-background py-4 shadow-[0_18px_55px_-30px_rgba(0,0,0,0.8)]'
              : 'border border-transparent bg-black/[0.18] py-6 backdrop-blur-md',
          ].join(' ')}
        >
          {/* Middle: reserve space for absolute logo via pl on parent */}
          <div className="flex min-w-0 flex-1 justify-center">
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
          </div>

          {/* Right cluster */}
          <div className="flex shrink-0 items-center gap-5 md:gap-7">
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
      </div>
    </nav>
  );
}
