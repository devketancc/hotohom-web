'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MotohomLogo } from '@/components/brand/MotohomLogo';
import { NavbarAuthCluster } from '@/components/layout/NavbarAuthCluster';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Fleet', href: '/fleet' },
  { label: 'Experiences', href: '/packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Community', href: '/community' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          className="absolute left-6 top-1/2 z-20 -translate-y-1/2 mix-blend-lighten transition-opacity duration-300 hover:opacity-80 md:left-10"
        >
          <MotohomLogo className="h-6 w-auto md:h-8" priority />
        </Link>

        <div
          className={[
            'flex w-full items-center justify-between rounded-2xl pl-24 pr-4 transition-all duration-500 ease-out md:pl-44 md:pr-10',
            scrolled
              ? 'border border-white/[0.09] bg-stitch-background py-4 shadow-[0_18px_55px_-30px_rgba(0,0,0,0.8)]'
              : 'border border-transparent bg-black/[0.18] py-5 backdrop-blur-md',
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
          <div className="flex shrink-0 items-center gap-4 md:gap-7">
            <Link
              href="/staff-login"
              className="font-headline hidden text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 transition-colors duration-300 hover:text-stitch-primary-container lg:inline-block"
            >
              Staff
            </Link>
            <NavbarAuthCluster
              loginButtonClassName="font-headline shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition-colors duration-300 hover:text-stitch-primary-container"
            />
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition-all hover:bg-white/5 active:scale-95 md:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div className="absolute top-[calc(100%+0.5rem)] left-0 z-35 w-full rounded-2xl border border-white/[0.09] bg-stitch-background p-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 md:hidden backdrop-blur-xl">
            <div className="flex flex-col gap-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-headline text-sm font-semibold uppercase tracking-wider text-slate-200 hover:text-stitch-primary transition-colors py-2 border-b border-white/[0.03]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/staff-login"
                onClick={() => setMenuOpen(false)}
                className="font-headline text-sm font-semibold uppercase tracking-wider text-slate-400 hover:text-stitch-primary transition-colors py-2"
              >
                Staff Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
