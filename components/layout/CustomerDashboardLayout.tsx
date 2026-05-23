'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Menu, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/journeys', label: 'Journeys', icon: Map },
  { href: '/account/settings', label: 'Settings', icon: Settings },
];

function navLinkActive(pathname: string, href: string): boolean {
  if (href === '/account') return pathname === '/account';
  if (href === '/journeys') return pathname === '/journeys' || pathname.startsWith('/booking/');
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname() ?? '';

  return (
    <nav className={cn('flex flex-col gap-1 p-2', className)} aria-label="Dashboard">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = navLinkActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm font-semibold transition-colors',
              active
                ? 'bg-stitch-primary/15 text-stitch-primary-container'
                : 'text-stitch-on-surface-variant hover:bg-white/5 hover:text-stitch-on-background'
            )}
          >
            <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Isolated so `key={pathname}` on the parent resets drawer open state after navigation without an effect. */
function CustomerDashboardMobileChrome() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="sticky top-[73px] z-30 flex items-center gap-3 border-b border-border/10 bg-stitch-background/95 px-4 py-3 backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-stitch-on-background transition-colors hover:bg-white/5"
          aria-expanded={mobileOpen}
          aria-label="Open dashboard menu"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-headline text-sm font-bold uppercase tracking-widest text-stitch-on-surface-variant">
          Dashboard
        </span>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[120] md:hidden" role="dialog" aria-modal="true" aria-label="Dashboard menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(18rem,88vw)] flex-col border-r border-white/10 bg-stitch-surface-dim shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <span className="font-headline text-xs font-bold uppercase tracking-widest text-stitch-primary-container">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-stitch-on-surface-variant hover:bg-white/5 hover:text-stitch-on-background"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} className="flex-1 p-3" />
          </div>
        </div>
      ) : null}
    </>
  );
}

export function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <CustomerDashboardMobileChrome key={pathname ?? ''} />

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border/10 bg-stitch-surface/30 md:block">
        <div className="sticky top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto py-6">
          <p className="px-5 pb-3 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-on-surface-variant">
            Your space
          </p>
          <NavLinks className="px-2" />
        </div>
      </aside>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-screen-2xl px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
