'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Flag } from 'lucide-react';
import { PlacesAutocompleteInput } from '@/components/booking/PlacesAutocompleteInput';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { PackagePickupDropMap } from '@/components/package/PackagePickupDropMap';
import { useBookingStore } from '@/store/bookingStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { isAuthed, requestAuthThenNavigate } from '@/lib/authNavigation';
import type { JourneyStop, JourneyStopLocation } from '@/types/booking';
import {
  newStopId,
  reassignStopOrders,
  syncPickupDropStrings,
  canCompletePackagePickupDrop,
} from '@/utils/journeyStops';
import { buildPackageCartPayload } from '@/utils/buildPackageCartPayload';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/authStore';

function createEmptyPickupDropStops(): JourneyStop[] {
  return [
    { id: newStopId(), order: 1, stop_type: 'pickup' as const, notes: '', location: null },
    { id: newStopId(), order: 2, stop_type: 'dropoff' as const, notes: '', location: null },
  ];
}

interface PackagePickupDropPlannerProps {
  packageId: string;
}

export function PackagePickupDropPlanner({ packageId }: PackagePickupDropPlannerProps) {
  const router = useRouter();
  const bookingState = useBookingStore();
  const { setData } = useBookingStore();
  const { isAuthenticated, user } = useAuth();
  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [continueLoading, setContinueLoading] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);

  const sessionOk = isAuthenticated && !!user;
  const pkg = bookingState.activePackage;
  const stops = bookingState.journey?.stops;

  useEffect(() => {
    if (!pkg || pkg.id !== packageId) return;
    if ((bookingState.bookingFlow ?? 'standard') !== 'package') return;
    if (bookingState.journey?.stops?.length === 2) return;
    const nextStops = createEmptyPickupDropStops();
    const str = syncPickupDropStrings(nextStops);
    setData({
      journey: {
        pickupLocation: str.pickupLocation,
        dropoffLocation: str.dropoffLocation,
        distanceKm: 0,
        stops: nextStops,
      },
    });
  }, [pkg, packageId, bookingState.bookingFlow, bookingState.journey?.stops?.length, setData]);

  const pickupStop = stops?.[0];
  const dropStop = stops?.[1];

  const setPickup = useCallback(
    (loc: JourneyStopLocation | null) => {
      if (!stops || stops.length < 2) return;
      const next = [...stops];
      next[0] = { ...next[0], location: loc };
      if (sameAsPickup && loc) {
        next[1] = { ...next[1], location: { ...loc } };
      }
      const ordered = reassignStopOrders(next);
      const str = syncPickupDropStrings(ordered);
      setData({
        journey: {
          pickupLocation: str.pickupLocation,
          dropoffLocation: str.dropoffLocation,
          distanceKm: bookingState.journey?.distanceKm ?? 0,
          stops: ordered,
        },
      });
    },
    [stops, sameAsPickup, setData, bookingState.journey?.distanceKm]
  );

  const setDropoff = useCallback(
    (loc: JourneyStopLocation | null) => {
      if (!stops || stops.length < 2 || sameAsPickup) return;
      const next = [...stops];
      next[1] = { ...next[1], location: loc };
      const ordered = reassignStopOrders(next);
      const str = syncPickupDropStrings(ordered);
      setData({
        journey: {
          pickupLocation: str.pickupLocation,
          dropoffLocation: str.dropoffLocation,
          distanceKm: bookingState.journey?.distanceKm ?? 0,
          stops: ordered,
        },
      });
    },
    [stops, sameAsPickup, setData, bookingState.journey?.distanceKm]
  );

  const routeOk = useMemo(
    () => (stops ? canCompletePackagePickupDrop(stops) : false),
    [stops]
  );

  const continueUnlocked = sessionOk && routeOk;

  const continueLockedHint = useMemo(() => {
    if (!sessionOk) return 'Log in to continue to booking.';
    if (!routeOk) return 'Choose pickup and drop-off locations.';
    return undefined;
  }, [sessionOk, routeOk]);

  const handleContinue = async () => {
    if (!isAuthed()) {
      requestAuthThenNavigate(`/package/${packageId}/stops`);
      return;
    }
    if (!pkg || !stops || stops.length !== 2) return;
    const pickup = stops[0].location;
    const drop = stops[1].location;
    if (!pickup || !drop) return;

    const u = useAuthStore.getState().user;
    const name = u?.name?.trim() || 'Guest';
    const phone = u?.phone?.trim() || '';

    setContinueError(null);
    setContinueLoading(true);
    try {
      const payload = buildPackageCartPayload({
        pkg,
        booking: bookingState,
        pickup,
        dropoff: drop,
        customerName: name,
        customerPhone: phone,
      });
      const cart = await cartService.createCart(payload);
      useCartStore.getState().setCart(cart);
      router.push('/booking/summary');
    } catch {
      setContinueError('Failed to start booking. Please try again.');
    } finally {
      setContinueLoading(false);
    }
  };

  const pickupLoc = pickupStop?.location;
  const dropLoc = sameAsPickup ? pickupLoc : dropStop?.location;

  const mapPickup =
    pickupLoc && Number.isFinite(pickupLoc.lat) && Number.isFinite(pickupLoc.lng)
      ? { lat: pickupLoc.lat, lng: pickupLoc.lng, title: pickupLoc.name }
      : null;
  const mapDrop =
    dropLoc && Number.isFinite(dropLoc.lat) && Number.isFinite(dropLoc.lng)
      ? { lat: dropLoc.lat, lng: dropLoc.lng, title: dropLoc.name }
      : null;

  if (!pkg || pkg.id !== packageId) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-stitch-on-surface-variant">
        Package data missing. Go back to the package page and choose <strong>Proceed</strong> again.
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-10 w-full grid grid-cols-1 md:grid-cols-[1fr_380px] gap-12 text-stitch-on-background">
      <section className="space-y-8">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-stitch-on-surface mb-2">
            Pickup &amp; drop-off
          </h1>
          <p className="text-stitch-on-surface-variant font-body text-lg max-w-2xl">
            Search places in India. No extra stops—only where we pick you up and where you finish.
          </p>
        </div>

        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-stitch-outline mb-2 ml-1">
              Pickup
            </label>
            {pickupStop && (
              <PlacesAutocompleteInput
                stopId={pickupStop.id}
                location={pickupStop.location}
                onResolved={setPickup}
                placeholder="Search pickup in India"
                icon={<MapPin size={20} />}
              />
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-medium text-stitch-on-surface">
            <input
              type="checkbox"
              checked={sameAsPickup}
              onChange={(e) => {
                const checked = e.target.checked;
                setSameAsPickup(checked);
                if (!stops || stops.length < 2) return;
                if (checked && stops[0].location) {
                  const cp = { ...stops[0].location };
                  const next: JourneyStop[] = [stops[0], { ...stops[1], location: cp }];
                  const ordered = reassignStopOrders(next);
                  const str = syncPickupDropStrings(ordered);
                  setData({
                    journey: {
                      pickupLocation: str.pickupLocation,
                      dropoffLocation: str.dropoffLocation,
                      distanceKm: bookingState.journey?.distanceKm ?? 0,
                      stops: ordered,
                    },
                  });
                }
              }}
              className="size-4 rounded border-stitch-outline accent-stitch-primary"
            />
            Drop-off same as pickup
          </label>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-stitch-outline mb-2 ml-1">
              Drop-off
            </label>
            {dropStop && (
              <PlacesAutocompleteInput
                stopId={dropStop.id}
                location={sameAsPickup ? pickupStop?.location ?? null : dropStop.location}
                onResolved={setDropoff}
                placeholder="Search drop-off in India"
                icon={<Flag size={20} />}
                disabled={sameAsPickup}
              />
            )}
          </div>
        </div>

        <PackagePickupDropMap pickup={mapPickup} dropoff={mapDrop} />
      </section>

      <aside className="relative">
        <BookingSummary
          booking={bookingState}
          onContinue={handleContinue}
          isLoading={continueLoading}
          continueLoadingLabel="Creating your booking…"
          continueError={continueError}
          showCaravanPricing={false}
          continueUnlocked={continueUnlocked}
          continueLockedHint={continueLockedHint}
        />
      </aside>
    </div>
  );
}
