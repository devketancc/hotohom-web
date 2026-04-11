'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { Calendar, Loader2, Map, MapPin, PawPrint, Users } from 'lucide-react';
import { requestAuthThenNavigate } from '@/lib/authNavigation';
import { useAuth } from '@/hooks/useAuth';
import { bookingService } from '@/services/booking.service';
import type { CustomerBookingListItem } from '@/types/customerBooking';
import { routeSummary, statusPillClass } from '@/lib/customerBookingUi';
import { formatInr, formatIsoDateRange } from '@/utils/format';
import { cn } from '@/lib/utils';

function partitionBookings(results: CustomerBookingListItem[], now: Date) {
  const upcoming: CustomerBookingListItem[] = [];
  const past: CustomerBookingListItem[] = [];
  for (const b of results) {
    const end = parseISO(b.end_datetime);
    if (end >= now) upcoming.push(b);
    else past.push(b);
  }
  upcoming.sort(
    (a, b) => parseISO(a.start_datetime).getTime() - parseISO(b.start_datetime).getTime()
  );
  past.sort(
    (a, b) => parseISO(b.start_datetime).getTime() - parseISO(a.start_datetime).getTime()
  );
  return { upcoming, past };
}

function JourneyBookingCard({ booking }: { booking: CustomerBookingListItem }) {
  const { pickup, dropoff, waypointCount } = routeSummary(booking.stops);
  const tripStatus = booking.trip?.status ?? '';

  return (
    <article className="glass-card flex flex-col gap-4 rounded-xl p-6 transition-shadow hover:shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 gap-y-2">
            <h3 className="font-headline text-lg font-bold tracking-tight text-stitch-on-background">
              {booking.caravan_name}
            </h3>
            {booking.caravan_class ? (
              <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-wider text-stitch-on-surface-variant">
                Class {booking.caravan_class}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 font-body text-xs font-semibold capitalize',
                statusPillClass(booking.status)
              )}
            >
              {booking.status.replace(/_/g, ' ')}
            </span>
            {tripStatus ? (
              <span className="inline-flex rounded-full bg-white/5 px-2.5 py-0.5 font-body text-xs font-medium capitalize text-stitch-on-surface-variant ring-1 ring-white/10">
                Trip: {tripStatus.replace(/_/g, ' ')}
              </span>
            ) : null}
          </div>
        </div>
        <p className="shrink-0 text-right font-headline text-lg font-black tabular-nums text-stitch-on-background">
          ₹{formatInr(booking.grand_total)}
        </p>
      </div>

      <div className="flex items-start gap-2 font-body text-sm text-stitch-on-surface-variant">
        <Calendar className="mt-0.5 size-4 shrink-0 text-stitch-primary-container" aria-hidden />
        <span className="leading-relaxed">
          {formatIsoDateRange(booking.start_datetime, booking.end_datetime, booking.total_days)}
        </span>
      </div>

      <div className="flex items-start gap-2 font-body text-sm text-stitch-on-surface-variant">
        <MapPin className="mt-0.5 size-4 shrink-0 text-stitch-primary-container" aria-hidden />
        <div className="min-w-0 leading-relaxed">
          <p className="line-clamp-2">
            <span className="font-semibold text-stitch-on-background">From </span>
            {pickup}
          </p>
          <p className="mt-1 line-clamp-2">
            <span className="font-semibold text-stitch-on-background">To </span>
            {dropoff}
          </p>
          {waypointCount > 0 ? (
            <p className="mt-1 text-xs text-stitch-on-surface-variant/90">
              +{waypointCount} stop{waypointCount === 1 ? '' : 's'} on route
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 font-body text-xs font-semibold text-stitch-on-surface-variant">
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-3.5 text-stitch-primary-container" aria-hidden />
          {booking.num_humans} guest{booking.num_humans === 1 ? '' : 's'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <PawPrint className="size-3.5 text-stitch-primary-container" aria-hidden />
          {booking.num_pets} pet{booking.num_pets === 1 ? '' : 's'}
        </span>
      </div>

      <Link
        href={`/booking/${booking.id}`}
        className="font-body text-sm font-semibold text-stitch-primary-container transition-colors hover:underline"
      >
        View details →
      </Link>
    </article>
  );
}

function BookingSection({
  title,
  description,
  bookings,
}: {
  title: string;
  description: string;
  bookings: CustomerBookingListItem[];
}) {
  if (bookings.length === 0) return null;
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-stitch-on-surface-variant">
          {title}
        </h2>
        <p className="mt-1 font-body text-sm text-stitch-on-surface-variant">{description}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {bookings.map((b) => (
          <JourneyBookingCard key={b.id} booking={b} />
        ))}
      </div>
    </section>
  );
}

export default function DashboardJourneysPage() {
  const { isAuthenticated } = useAuth();
  const authPrompted = useRef(false);

  useEffect(() => {
    if (isAuthenticated || authPrompted.current) return;
    authPrompted.current = true;
    requestAuthThenNavigate('/journeys');
  }, [isAuthenticated]);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bookings', 'list'],
    queryFn: () => bookingService.listBookings(),
    enabled: isAuthenticated,
  });

  const { upcoming, past } = useMemo(() => {
    const results = data?.success && data.data?.results ? data.data.results : [];
    return partitionBookings(results, new Date());
  }, [data]);

  const totalCount = data?.success && data.data ? data.data.count : 0;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <div className="glass-panel-login rounded-xl p-10 text-center shadow-2xl">
          <Map className="mx-auto size-12 text-stitch-primary-container" aria-hidden />
          <h1 className="mt-6 font-headline text-xl font-bold text-stitch-on-background">Sign in to continue</h1>
          <p className="mt-3 font-body text-sm text-stitch-on-surface-variant">
            Sign in to view your journeys and bookings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-primary-container">
            Journeys
          </p>
          <h1 className="font-headline text-3xl font-black uppercase tracking-tight text-stitch-on-background">
            Your trips
          </h1>
          <p className="mt-2 font-body text-sm text-stitch-on-surface-variant">
            {isPending
              ? 'Loading your bookings…'
              : totalCount > 0
                ? `${totalCount} booking${totalCount === 1 ? '' : 's'} on your account.`
                : 'Upcoming and past Motohom journeys.'}
          </p>
        </div>
        <Link
          href="/select-caravan"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-md px-5 font-headline text-sm font-bold uppercase tracking-wide gradient-cta text-stitch-on-primary shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          New booking
        </Link>
      </header>

      {isPending ? (
        <div className="glass-card flex items-center justify-center gap-3 rounded-xl py-20 text-stitch-on-surface-variant">
          <Loader2 className="size-6 animate-spin text-stitch-primary-container" aria-hidden />
          <span className="font-body text-sm font-semibold">Loading bookings…</span>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-8 text-center">
          <p className="font-body text-sm text-red-200">
            {error instanceof Error ? error.message : 'Something went wrong.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-white/20 px-4 font-body text-sm font-semibold text-stitch-on-background transition-colors hover:bg-white/10"
          >
            Try again
          </button>
        </div>
      ) : !data?.success || !data.data ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <p className="font-body text-sm text-stitch-on-surface-variant">Could not load bookings.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-white/20 px-4 font-body text-sm font-semibold text-stitch-on-background transition-colors hover:bg-white/10"
          >
            Retry
          </button>
        </div>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-6 rounded-xl p-10 text-center md:p-14">
          <MapPin className="size-12 text-stitch-primary-container/80" aria-hidden />
          <div className="max-w-md space-y-2">
            <h2 className="font-headline text-lg font-bold text-stitch-on-background">No journeys yet</h2>
            <p className="font-body text-sm leading-relaxed text-stitch-on-surface-variant">
              When you complete a booking, it will show up here. Start by choosing dates and a caravan.
            </p>
          </div>
          <Link
            href="/select-caravan"
            className="inline-flex h-11 items-center justify-center rounded-md px-6 font-headline text-sm font-bold uppercase tracking-wide gradient-cta text-stitch-on-primary shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            New booking
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          <BookingSection
            title="Upcoming"
            description="Trips that haven’t ended yet."
            bookings={upcoming}
          />
          <BookingSection
            title="Past"
            description="Completed or earlier trips."
            bookings={past}
          />
        </div>
      )}
    </div>
  );
}
