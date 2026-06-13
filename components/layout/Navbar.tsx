'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { MotohomLogo } from '@/components/brand/MotohomLogo';
import { NavbarAuthCluster } from '@/components/layout/NavbarAuthCluster';
import { useAuth } from '@/hooks/useAuth';

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const NAV_ITEMS = [
  { label: 'Journeys', href: '/packages' },
  { label: 'Fleet', href: '/fleet' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Journal', href: '/journal' },
  { label: 'About', href: '/about' },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when the mobile drawer is open.
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-6">
      <div
        className={[
          'mx-auto flex max-w-screen-2xl items-center justify-between rounded-full pl-6 pr-3 transition-[background-color,border-color,box-shadow,padding] duration-500 ease-out md:pl-8 md:pr-4',
          scrolled
            ? 'border border-white/[0.1] bg-surface-1/95 py-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl'
            : 'border border-white/[0.06] bg-white/[0.04] py-4 backdrop-blur-xl',
        ].join(' ')}
      >
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 transition-opacity duration-300 hover:opacity-80"
        >
          <MotohomLogo className="h-6 w-auto md:h-7" priority />
        </Link>

        {/* Center nav (desktop) */}
        <div className="hidden items-center gap-9 md:flex lg:gap-11">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'group relative font-mono text-[11px] font-medium uppercase tracking-[0.26em] transition-colors duration-500 ease-out',
                  active
                    ? 'text-ink'
                    : 'text-ink-muted/70 hover:text-ink',
                ].join(' ')}
              >
                {item.label}
                <span
                  aria-hidden
                  className={[
                    'pointer-events-none absolute -bottom-2 left-0 h-px w-full origin-left bg-stitch-primary-container/80 transition-transform duration-500 ease-out',
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  ].join(' ')}
                />
              </Link>
            );
          })}
        </div>

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-3 md:gap-5">
          <div className="hidden lg:block">
            <NavbarAuthCluster
              loginButtonClassName="font-headline shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted transition-colors duration-300 hover:text-stitch-primary-container"
            />
          </div>

          {/* Primary CTA (desktop) */}
          <Link
            href="/select-caravan"
            className="gradient-cta group hidden items-center gap-2 rounded-full py-2.5 pl-5 pr-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] md:inline-flex"
          >
            Plan a Journey
            <span className="flex size-6 items-center justify-center rounded-full bg-gold-ink/20">
              <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>

          {/* Hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ink transition-colors hover:bg-white/5 active:scale-95 md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className="relative block h-3 w-4">
              <motion.span
                className="absolute left-0 top-1/2 block h-px w-4 bg-current"
                animate={
                  reduced
                    ? undefined
                    : menuOpen
                      ? { rotate: 45, y: 0 }
                      : { rotate: 0, y: -3 }
                }
                transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              />
              <motion.span
                className="absolute left-0 top-1/2 block h-px w-4 bg-current"
                animate={
                  reduced
                    ? undefined
                    : menuOpen
                      ? { rotate: -45, y: 0 }
                      : { rotate: 0, y: 3 }
                }
                transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer - screen-filling overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: LUXURY_EASE }}
            className="fixed inset-0 z-40 flex flex-col bg-surface-0/90 px-6 pb-10 pt-28 backdrop-blur-3xl md:hidden"
          >
            <div className="flex flex-1 flex-col gap-2">
              {NAV_ITEMS.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: LUXURY_EASE,
                    delay: reduced ? 0 : index * 0.06,
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      'block border-b border-white/[0.06] py-4 font-headline text-2xl font-light tracking-tight transition-colors',
                      isActive(pathname, item.href)
                        ? 'text-stitch-primary-container'
                        : 'text-ink hover:text-stitch-primary-container',
                    ].join(' ')}
                    style={{ fontFamily: 'var(--font-headline)' }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {isAuthenticated && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: LUXURY_EASE,
                    delay: reduced ? 0 : NAV_ITEMS.length * 0.06,
                  }}
                >
                  <Link
                    href="/journeys"
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-white/[0.06] py-4 font-headline text-sm font-semibold uppercase tracking-[0.2em] text-ink-muted hover:text-stitch-primary-container"
                  >
                    My Journeys
                  </Link>
                </motion.div>
              )}
            </div>

            <Link
              href="/select-caravan"
              onClick={() => setMenuOpen(false)}
              className="gradient-cta group inline-flex items-center justify-center gap-2 rounded-full py-4 font-headline text-sm font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container"
            >
              Plan a Journey
              <span className="flex size-6 items-center justify-center rounded-full bg-gold-ink/20">
                <ArrowUpRight className="size-3.5" />
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
