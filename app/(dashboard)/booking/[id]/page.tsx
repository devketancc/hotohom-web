'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Map } from 'lucide-react';
import { requestAuthThenNavigate } from '@/lib/authNavigation';
import { BookingDetailFullView } from '@/components/booking/BookingDetailFullView';
import { useAuth } from '@/hooks/useAuth';
import { bookingService } from '@/services/booking.service';
import type { CustomerBookingDetail } from '@/types/customerBooking';

function BookingDetailContent({ b }: { b: CustomerBookingDetail }) {
  return <BookingDetailFullView booking={b} backHref="/journeys" backLabel="← Back to journeys" />;
}

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';
  const { isAuthenticated } = useAuth();
  const authPrompted = useRef(false);

  useEffect(() => {
    authPrompted.current = false;
  }, [id]);

  useEffect(() => {
    if (!id || isAuthenticated || authPrompted.current) return;
    authPrompted.current = true;
    requestAuthThenNavigate(`/booking/${id}`);
  }, [id, isAuthenticated]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['bookings', 'detail', id],
    queryFn: () => bookingService.getBooking(id),
    enabled: isAuthenticated && Boolean(id),
  });

  if (!id) {
    return (
      <div className="glass-card rounded-xl p-10 text-center">
        <p className="font-body text-sm text-stitch-on-surface-variant">Invalid booking link.</p>
        <Link
          href="/journeys"
          className="mt-4 inline-block font-body text-sm font-semibold text-stitch-primary-container hover:underline"
        >
          Back to journeys
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <div className="glass-panel-login rounded-xl p-10 text-center shadow-2xl">
          <Map className="mx-auto size-12 text-stitch-primary-container" aria-hidden />
          <h1 className="mt-6 font-headline text-xl font-bold text-stitch-on-background">Sign in to continue</h1>
          <p className="mt-3 font-body text-sm text-stitch-on-surface-variant">
            Sign in to view this booking.
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="glass-card flex items-center justify-center gap-3 rounded-xl py-24 text-stitch-on-surface-variant">
        <Loader2 className="size-6 animate-spin text-stitch-primary-container" aria-hidden />
        <span className="font-body text-sm font-semibold">Loading booking…</span>
      </div>
    );
  }

  if (isError) {
    return (
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
        <Link
          href="/journeys"
          className="mt-4 block font-body text-sm text-stitch-primary-container hover:underline"
        >
          Back to journeys
        </Link>
      </div>
    );
  }

  if (!data?.success || !data.data) {
    return (
      <div className="glass-card space-y-4 rounded-xl p-10 text-center">
        <p className="font-body text-sm text-stitch-on-surface-variant">
          This booking could not be loaded.
        </p>
        <Link
          href="/journeys"
          className="inline-block font-body text-sm font-semibold text-stitch-primary-container hover:underline"
        >
          Back to journeys
        </Link>
      </div>
    );
  }

  return <BookingDetailContent b={data.data} />;
}
