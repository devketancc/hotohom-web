'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { BookingDetailFullView } from '@/components/booking/BookingDetailFullView';
import {
  crewBookingBackHref,
  crewBookingBackLabel,
  parseCrewBookingFrom,
} from '@/lib/crewBookingAccess';
import { crewQueryKeys, getCrewBookingById } from '@/services/crew.service';

export default function CrewBookingDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const from = parseCrewBookingFrom(searchParams.get('from'));

  useEffect(() => {
    if (!from) {
      router.replace('/crew/roster');
    }
  }, [from, router]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: crewQueryKeys.bookingDetail(id),
    queryFn: () => getCrewBookingById(id),
    enabled: Boolean(id && from),
  });

  if (!from) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Invalid booking link.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        <span className="text-sm font-semibold text-muted-foreground">Loading booking…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'Something went wrong.'}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted/30"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">This booking could not be loaded.</p>
      </div>
    );
  }

  return (
    <BookingDetailFullView
      booking={data}
      showPricing={false}
      backHref={crewBookingBackHref(from)}
      backLabel={crewBookingBackLabel(from)}
    />
  );
}
