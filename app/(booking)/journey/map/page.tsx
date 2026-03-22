'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/bookingStore';
import { GoogleMapView } from '@/components/booking/GoogleMapView';
import { ArrowLeft, ChevronRight, Map as MapIcon, Info } from 'lucide-react';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { canPreviewJourneyRoute, stopsToMapRoute, syncPickupDropStrings } from '@/utils/journeyStops';

export default function JourneyMapPage() {
  const router = useRouter();
  const bookingState = useBookingStore();
  const { journey, setData, hubName, hubLocation } = bookingState;

  const routeOk =
    !!journey?.stops &&
    journey.stops.length >= 3 &&
    canPreviewJourneyRoute(journey.stops);

  if (!journey || !routeOk) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-stitch-surface p-6 rounded-3xl border border-dashed border-stitch-outline/30 max-w-md">
          <MapIcon size={48} className="text-stitch-on-surface-variant/30 mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase text-stitch-on-background mb-2">Journey data missing</h2>
          <p className="text-stitch-on-surface-variant mb-6">
            Complete pickup, stops, and drop-off from the suggestions on the planner first.
          </p>
          <button
            onClick={() => router.push('/journey')}
            className="w-full px-6 py-3 bg-stitch-primary text-stitch-on-primary font-black uppercase rounded-xl transition-all hover:scale-[1.02]"
          >
            Go to journey planner
          </button>
        </div>
      </div>
    );
  }

  const { pickupLocation, dropoffLocation } = syncPickupDropStrings(journey.stops);
  const mapStops = stopsToMapRoute(journey.stops);
  const mapHub = useMemo(
    () =>
      hubLocation
        ? { name: hubName ?? 'Hub', lat: hubLocation.lat, lng: hubLocation.lng }
        : null,
    [hubName, hubLocation]
  );
  const stopTitles = useMemo(
    () =>
      journey.stops.map((s, i) => {
        const name = s.location?.name ?? 'Location pending';
        if (i === 0) return `Pickup: ${name}`;
        if (i === journey.stops.length - 1) return `Drop-off: ${name}`;
        return `Stop ${i}: ${name}`;
      }),
    [journey.stops]
  );

  const handleRouteCalculated = (distanceKm: number) => {
    setData({
      journey: {
        ...journey,
        distanceKm: Math.round(distanceKm),
      },
    });
  };

  const handleContinue = () => {
    router.push('/passenger');
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 min-h-[70vh]">
        <div className="flex-grow space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push('/journey')}
                className="p-2 hover:bg-stitch-surface rounded-full transition-colors text-stitch-on-surface-variant"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-black tracking-tight font-headline uppercase text-stitch-on-background">
                  Journey preview
                </h1>
                <p className="text-xs text-stitch-on-surface-variant font-medium flex items-center gap-1 uppercase tracking-wider line-clamp-2">
                  {pickupLocation}
                  <ChevronRight size={10} className="text-stitch-primary shrink-0" />
                  {dropoffLocation}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[500px]">
            <GoogleMapView
              stops={mapStops}
              hub={mapHub}
              stopTitles={stopTitles}
              onRouteCalculated={handleRouteCalculated}
            />
          </div>

          <div className="bg-stitch-surface/30 p-4 rounded-2xl border border-stitch-outline/10 flex items-start gap-3">
            <Info className="text-stitch-primary shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-stitch-on-surface-variant leading-relaxed">
              Distance and time estimates are based on current traffic conditions. Your Motohom is equipped with
              advanced GPS to optimize your route in real-time.
            </p>
          </div>
        </div>

        <aside className="lg:w-80 xl:w-96 shrink-0">
          <BookingSummary
            booking={bookingState}
            onContinue={handleContinue}
            isLoading={false}
            showCaravanPricing={false}
          />
        </aside>
      </div>
    </div>
  );
}
