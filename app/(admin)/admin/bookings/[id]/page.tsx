'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { BookingDetailFullView } from '@/components/booking/BookingDetailFullView';
import { adminQueryKeys, getAdminBookingById } from '@/services/admin.service';

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: adminQueryKeys.bookingDetail(id),
    queryFn: () => getAdminBookingById(id),
    enabled: Boolean(id),
  });

  if (!id) {
    return (
      <div className="glass-card rounded-xl p-10 text-center">
        <p className="font-body text-sm text-stitch-on-surface-variant">Invalid booking link.</p>
        <Link
          href="/admin/roster"
          className="mt-4 inline-block font-body text-sm font-semibold text-stitch-primary-container hover:underline"
        >
          Back to roster
        </Link>
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
          href="/admin/roster"
          className="mt-4 block font-body text-sm text-stitch-primary-container hover:underline"
        >
          Back to roster
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card space-y-4 rounded-xl p-10 text-center">
        <p className="font-body text-sm text-stitch-on-surface-variant">This booking could not be loaded.</p>
        <Link
          href="/admin/roster"
          className="inline-block font-body text-sm font-semibold text-stitch-primary-container hover:underline"
        >
          Back to roster
        </Link>
      </div>
    );
  }

  return <BookingDetailFullView booking={data} backHref="/admin/roster" backLabel="← Back to roster" />;
}
