'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { BookingDetailFullView } from '@/components/booking/BookingDetailFullView';
import { CrewJobPacketHeader } from '@/components/crew/CrewJobPacketHeader';
import { CrewTripActionBar } from '@/components/crew/trip/CrewTripActionBar';
import { CrewTripSummary } from '@/components/crew/trip/CrewTripSummary';
import {
  crewBookingBackHref,
  crewBookingBackLabel,
  parseCrewBookingFrom,
} from '@/lib/crewBookingAccess';
import { useCrewBookingDetail } from '@/hooks/useCrewBookingDetail';

export default function CrewBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const from = parseCrewBookingFrom(searchParams.get('from'));

  const { data, isPending, isError, error, refetch } = useCrewBookingDetail(id, Boolean(id) && from !== null);

  if (!id) {
    return (
      <div className="glass-card rounded-xl p-10 text-center">
        <p className="font-body text-sm text-stitch-on-surface-variant">Invalid booking link.</p>
        <Link
          href="/crew/roster"
          className="mt-4 inline-block font-body text-sm font-semibold text-stitch-primary-container hover:underline"
        >
          Back to roster
        </Link>
      </div>
    );
  }

  if (!from) {
    return (
      <div className="glass-card space-y-4 rounded-xl p-10 text-center">
        <p className="font-body text-sm text-stitch-on-surface-variant">
          Open this booking from your roster or calendar to view details.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/crew/roster"
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/20 px-4 font-body text-sm font-semibold text-stitch-on-background transition-colors hover:bg-white/10"
          >
            Go to roster
          </Link>
          <Link
            href="/crew/calendar"
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/20 px-4 font-body text-sm font-semibold text-stitch-on-background transition-colors hover:bg-white/10"
          >
            Go to calendar
          </Link>
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
        <p className="font-body text-sm text-red-200">{error instanceof Error ? error.message : 'Something went wrong.'}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-white/20 px-4 font-body text-sm font-semibold text-stitch-on-background transition-colors hover:bg-white/10"
        >
          Try again
        </button>
        <Link
          href={crewBookingBackHref(from)}
          className="mt-4 block font-body text-sm text-stitch-primary-container hover:underline"
        >
          {crewBookingBackLabel(from)}
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card space-y-4 rounded-xl p-10 text-center">
        <p className="font-body text-sm text-stitch-on-surface-variant">This booking could not be loaded.</p>
        <Link
          href={crewBookingBackHref(from)}
          className="inline-block font-body text-sm font-semibold text-stitch-primary-container hover:underline"
        >
          {crewBookingBackLabel(from)}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CrewJobPacketHeader booking={data} />
      <CrewTripActionBar booking={data} />
      <CrewTripSummary trip={data.trip} />
      <BookingDetailFullView
        booking={data}
        backHref={crewBookingBackHref(from)}
        backLabel={`← ${crewBookingBackLabel(from)}`}
        variant="admin"
        showPricing={false}
        showTripCharges={false}
        hideTripSection
        showAddonItems
      />
    </div>
  );
}
