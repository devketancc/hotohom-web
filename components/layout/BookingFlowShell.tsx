import { ReactNode } from 'react';
import Link from 'next/link';
import { ContextBar } from '@/components/booking/ContextBar';
import { HubLocationBackfill } from '@/components/booking/HubLocationBackfill';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { Bell, HelpCircle } from 'lucide-react';
import { MotohomLogo } from '@/components/brand/MotohomLogo';
import { NavbarAuthCluster } from '@/components/layout/NavbarAuthCluster';

export type BookingFlowShellProps = {
  children: ReactNode;
  /** Booking hub/dates bar; hide on customer dashboard routes. @default true */
  showContextBar?: boolean;
};

export function BookingFlowShell({ children, showContextBar = true }: BookingFlowShellProps) {
  return (
    <div className="dark flex flex-col min-h-screen bg-stitch-background text-stitch-on-background">
      <HubLocationBackfill />
      <header className="bg-stitch-background border-b border-border/10 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90">
            <MotohomLogo className="h-7 w-auto max-w-[160px]" blendOnDark />
          </Link>

          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/packages" className="font-bold text-muted-foreground hover:text-primary transition-colors">
              Explore
            </Link>
            <Link href="/journeys" className="font-bold text-muted-foreground hover:text-primary transition-colors">
              Bookings
            </Link>
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            <a
              href="mailto:support@motohom.com"
              className="text-muted-foreground hover:bg-secondary rounded-lg transition-all p-2"
              aria-label="Help and support"
            >
              <HelpCircle size={20} />
            </a>
            <button
              type="button"
              className="text-muted-foreground hover:bg-secondary rounded-lg transition-all p-2"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
            <NavbarAuthCluster loginButtonClassName="font-headline shrink-0 text-sm font-semibold uppercase tracking-tight text-muted-foreground transition-colors hover:text-primary" />
          </div>
        </div>
      </header>

      {showContextBar ? <BookingProgress /> : null}
      {showContextBar ? <ContextBar /> : null}

      {children}

      <div className="h-32" />
    </div>
  );
}
