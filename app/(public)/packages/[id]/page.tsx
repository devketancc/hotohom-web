'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { addDays } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { PackageBookingPanel } from '@/components/package/PackageBookingPanel';
import { PackageDetailHero } from '@/components/package/PackageDetailHero';
import { PackageHighlights } from '@/components/package/PackageHighlights';
import { PackageItinerary } from '@/components/package/PackageItinerary';
import { PackageMobileBookBar } from '@/components/package/PackageMobileBookBar';
import { PackageQuickFacts } from '@/components/package/PackageQuickFacts';
import { Reveal } from '@/components/shared/Reveal';
import { usePackageById } from '@/hooks/usePackageById';
import { locationService } from '@/services/location.service';
import { useBookingStore } from '@/store/bookingStore';
import { minimalCaravanClassFromPackage } from '@/utils/packageBooking';
import { newStopId, reassignStopOrders, syncPickupDropStrings } from '@/utils/journeyStops';

const BOOKING_PANEL_ID = 'package-booking-panel';

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

  const scrollToBooking = () => {
    const el =
      document.getElementById(`${BOOKING_PANEL_ID}-mobile`) ??
      document.getElementById(BOOKING_PANEL_ID);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
      <div className="pt-28 max-w-screen-2xl mx-auto px-6 md:px-8 pb-32 lg:pb-24">
        <Link
          href="/#packages"
          className="inline-flex items-center gap-2 text-sm font-bold text-stitch-on-surface-variant hover:text-stitch-primary mb-8 md:mb-10"
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
          <>
            <PackageDetailHero pkg={pkg} className="mb-10 md:mb-14" />

            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-12 md:space-y-16 min-w-0">
                <PackageQuickFacts pkg={pkg} />

                <PackageHighlights highlights={pkg.highlights} />

                {pkg.description?.trim() ? (
                  <Reveal as="section">
                    <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-stitch-primary font-headline">
                      Overview
                    </h2>
                    <p className="text-lg leading-relaxed text-stitch-on-surface-variant font-body whitespace-pre-line">
                      {pkg.description}
                    </p>
                  </Reveal>
                ) : null}

                <PackageItinerary days={pkg.days} />
              </div>

              <PackageBookingPanel
                id={BOOKING_PANEL_ID}
                pkg={pkg}
                startDate={startDate}
                onSelectDate={setStartDate}
                onProceed={handleProceed}
                canProceed={canProceed}
                hubAvailable={Boolean(hubRow)}
                className="hidden lg:block"
              />
            </div>

            <div className="mt-10 lg:hidden">
              <PackageBookingPanel
                id={`${BOOKING_PANEL_ID}-mobile`}
                pkg={pkg}
                startDate={startDate}
                onSelectDate={setStartDate}
                onProceed={handleProceed}
                canProceed={canProceed}
                hubAvailable={Boolean(hubRow)}
              />
            </div>

            <PackageMobileBookBar pkg={pkg} onChooseDates={scrollToBooking} />
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
