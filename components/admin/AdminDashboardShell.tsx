'use client';

import { ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { adminNavItemActive, getAdminNavTitle, getNavForRole, type AdminNavItem } from '@/config/adminNav';
import { AdminReferencePrefetch } from '@/components/admin/AdminReferencePrefetch';
import { MotohomLogo } from '@/components/brand/MotohomLogo';

function NavItemRow({
  item,
  pathname,
  onNavigate,
}: {
  item: AdminNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = adminNavItemActive(pathname, item);
  const Icon = item.icon;
  const content = (
    <>
      <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge === 'soon' ? (
        <span className="rounded-md bg-sidebar-accent/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-accent-foreground/90">
          Soon
        </span>
      ) : null}
    </>
  );

  const className = cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
    item.disabled
      ? 'cursor-not-allowed text-muted-foreground opacity-70'
      : active
        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
        : 'text-sidebar-foreground/90 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
  );

  if (item.disabled) {
    return (
      <div key={item.id} className={className} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link key={item.id} href={item.href} onClick={onNavigate} className={className}>
      {content}
    </Link>
  );
}

function AdminSidebarNav({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const pathname = usePathname() ?? '';
  const user = useAuthStore((s) => s.user);
  const items = useMemo(() => getNavForRole(user?.role), [user?.role]);

  return (
    <nav className={cn('flex flex-col gap-0.5 p-2', className)} aria-label="Staff navigation">
      {items.map((item) => (
        <NavItemRow key={item.id} item={item} pathname={pathname} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const headerTitle = getAdminNavTitle(pathname, getNavForRole(user?.role));

  const handleLogout = async () => {
    setLogoutPending(true);
    try {
      await logout();
    } finally {
      setLogoutPending(false);
    }
  };

  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      <AdminReferencePrefetch />
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <Link href="/admin" className="flex min-w-0 flex-1 items-center gap-2">
            <MotohomLogo className="h-6 w-auto max-w-[9rem] shrink-0" blendOnDark />
            <span className="rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-sidebar-accent-foreground">
              Staff
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Menu</p>
          <AdminSidebarNav className="px-1" />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/"
            className="block rounded-md px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          >
            View customer site
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true" aria-label="Staff menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(18rem,92vw)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
              <Link href="/admin" className="flex min-w-0 items-center gap-2">
                <MotohomLogo className="h-5 w-auto max-w-[7rem] shrink-0" blendOnDark />
                <span className="rounded bg-sidebar-accent/60 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sidebar-accent-foreground">
                  Staff
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <AdminSidebarNav onNavigate={() => setMobileOpen(false)} className="flex-1 py-2" />
            <div className="border-t border-sidebar-border p-3">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              >
                View customer site
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-3 backdrop-blur-md sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 text-foreground md:hidden"
              aria-expanded={mobileOpen}
              aria-label="Open staff menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-bold tracking-tight sm:text-base">{headerTitle}</p>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">Internal console</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="max-w-[12rem] truncate text-sm font-medium leading-tight">{user?.name || 'Staff'}</p>
              <p className="truncate text-[11px] capitalize text-muted-foreground">
                {user?.role?.replace(/_/g, ' ') || '—'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={logoutPending}
              onClick={() => void handleLogout()}
            >
              <LogOut className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
