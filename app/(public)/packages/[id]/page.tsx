'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { PackageStartDateCalendar } from '@/components/package/PackageStartDateCalendar';
import { usePackageById } from '@/hooks/usePackageById';
import { locationService } from '@/services/location.service';
import { useBookingStore } from '@/store/bookingStore';
import { formatCurrency } from '@/utils/format';
import { minimalCaravanClassFromPackage } from '@/utils/packageBooking';
import { newStopId, reassignStopOrders, syncPickupDropStrings } from '@/utils/journeyStops';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200&auto=format&fit=crop';

function emptyPickupDrop() {
  return [
    { id: newStopId(), order: 1, stop_type: 'pickup' as const, notes: '', location: null },
    { id: newStopId(), order: 2, stop_type: 'dropoff' as const, notes: '', location: null },
  ];
}

export default function PackageDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const setData = useBookingStore((s) => s.setData);

  const { data: hubs } = useQuery({
    queryKey: ['hubs'],
    queryFn: () => locationService.getHubs(),
  });

  const { data: pkg, isLoading, isError, refetch } = usePackageById(id || undefined);

  const [startDate, setStartDate] = useState<Date | null>(null);

  const hubRow = useMemo(() => hubs?.find((h) => h.id === pkg?.home_hub), [hubs, pkg?.home_hub]);

  const canProceed = Boolean(pkg && startDate);

  const handleProceed = () => {
    if (!pkg || !startDate || !hubRow) return;
    const end = addDays(startDate, Math.max(pkg.duration_days - 1, 0));
    const stops = reassignStopOrders(emptyPickupDrop());
    const str = syncPickupDropStrings(stops);
    setData({
      bookingFlow: 'package',
      activePackage: pkg,
      hub: pkg.home_hub,
      hubName: pkg.home_hub_name,
      hubLocation: { lat: hubRow.coordinates.lat, lng: hubRow.coordinates.lng },
      caravanClass: minimalCaravanClassFromPackage(pkg),
      dates: {
        start: startDate,
        end,
        totalDays: pkg.duration_days,
      },
      journey: {
        pickupLocation: str.pickupLocation,
        dropoffLocation: str.dropoffLocation,
        distanceKm: 0,
        stops,
      },
    });
    router.push(`/package/${pkg.id}/stops`);
  };

  return (
    <main className="section-ambient-warm bg-stitch-background text-stitch-on-background min-h-screen">
      <Navbar />
      <div className="pt-28 max-w-screen-lg mx-auto px-8 pb-24">
        <Link
          href="/#packages"
          className="inline-flex items-center gap-2 text-sm font-bold text-stitch-on-surface-variant hover:text-stitch-primary mb-10"
        >
          <ArrowLeft className="size-4" />
          Back to packages
        </Link>

        {isLoading && (
          <div className="flex justify-center py-24">
            <Loader2 className="size-10 animate-spin text-stitch-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
            <p className="text-stitch-on-surface-variant mb-4">Could not load this package.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-stitch-primary font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && !pkg && (
          <p className="text-center text-stitch-on-surface-variant py-16">Package not found.</p>
        )}

        {pkg && (
          <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="aspect-[4/5] max-h-[420px] overflow-hidden rounded-2xl border border-white/10 mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnails */}
                <img
                  src={pkg.thumbnail_url?.trim() ? pkg.thumbnail_url : FALLBACK_IMG}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight mb-4">{pkg.name}</h1>
              <p className="text-stitch-on-surface-variant font-body text-lg leading-relaxed mb-6">
                {pkg.description}
              </p>
              <ul className="space-y-2 text-stitch-on-surface font-body">
                <li>
                  <span className="text-stitch-on-surface-variant">Hub:</span> {pkg.home_hub_name}
                </li>
                <li>
                  <span className="text-stitch-on-surface-variant">Class:</span> {pkg.caravan_class_code}
                </li>
                <li>
                  <span className="text-stitch-on-surface-variant">Duration:</span> {pkg.duration_days}{' '}
                  {pkg.duration_days === 1 ? 'day' : 'days'}
                </li>
                <li>
                  <span className="text-stitch-on-surface-variant">Included km:</span>{' '}
                  {pkg.included_km.toLocaleString('en-IN')}
                </li>
                <li>
                  <span className="text-stitch-on-surface-variant">From:</span>{' '}
                  {Number.isFinite(Number.parseFloat(pkg.base_price))
                    ? formatCurrency(Number.parseFloat(pkg.base_price))
                    : '—'}
                </li>
              </ul>
            </div>

            <div className="lg:pt-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-stitch-primary mb-4 font-headline">
                Trip start date
              </h2>
              <p className="text-sm text-stitch-on-surface-variant mb-4 font-body">
                Choose when your package starts (tomorrow through the next 6 months). Your trip window is{' '}
                {pkg.duration_days} {pkg.duration_days === 1 ? 'day' : 'days'}.
              </p>
              <PackageStartDateCalendar selected={startDate} onSelect={setStartDate} />
              {startDate && (
                <p className="mt-4 text-sm text-stitch-on-surface-variant font-body">
                  Selected: <strong className="text-stitch-on-background">{format(startDate, 'd MMM yyyy')}</strong>
                </p>
              )}
              <button
                type="button"
                disabled={!canProceed || !hubRow}
                onClick={handleProceed}
                className="mt-8 w-full rounded-xl bg-stitch-primary py-4 font-headline font-bold text-sm uppercase tracking-widest text-stitch-on-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Proceed to pickup &amp; drop-off
              </button>
              {!hubRow && (
                <p className="mt-3 text-xs text-amber-500/90 font-body">
                  Hub location is unavailable; refresh the page or try again later.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
