'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/bookingStore';
import { GoogleMapView } from '@/components/booking/GoogleMapView';
import { ArrowLeft, ChevronRight, Map as MapIcon, Info } from 'lucide-react';
import { BookingSummary } from '@/components/booking/BookingSummary';

export default function JourneyMapPage() {
  const router = useRouter();
  const bookingState = useBookingStore();
  const { journey, setData } = bookingState;

  if (!journey || !journey.pickupLocation || !journey.dropoffLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-stitch-surface p-6 rounded-3xl border border-dashed border-stitch-outline/30 max-w-md">
          <MapIcon size={48} className="text-stitch-on-surface-variant/30 mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase text-stitch-on-background mb-2">Journey Data Missing</h2>
          <p className="text-stitch-on-surface-variant mb-6">
            We couldn't find your journey details. Please plan your pickup and drop-off locations first.
          </p>
          <button 
            onClick={() => router.push('/journey')}
            className="w-full px-6 py-3 bg-stitch-primary text-stitch-on-primary font-black uppercase rounded-xl transition-all hover:scale-[1.02]"
          >
            Go to Journey Planner
          </button>
        </div>
      </div>
    );
  }

  const handleRouteCalculated = (distanceKm: number) => {
    setData({
      journey: {
        ...journey,
        distanceKm: Math.round(distanceKm),
      }
    });
  };

  const handleContinue = () => {
    // Navigate to the next step in the flow.
    // Given the absence of an /addons page in the folder list, 
    // we'll try to go to /passenger or /summary if /addons is a 404 target.
    // For now, let's keep it to /passenger as per typical flow if addons are skipped.
    router.push('/passenger');
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 min-h-[70vh]">
        
        {/* Main Map View Section */}
        <div className="flex-grow space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/journey')}
                className="p-2 hover:bg-stitch-surface rounded-full transition-colors text-stitch-on-surface-variant"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-black tracking-tight font-headline uppercase text-stitch-on-background">
                  Journey Preview
                </h1>
                <p className="text-xs text-stitch-on-surface-variant font-medium flex items-center gap-1 uppercase tracking-wider">
                  {journey.pickupLocation} <ChevronRight size={10} className="text-stitch-primary" /> {journey.dropoffLocation}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[500px]">
             <GoogleMapView 
               pickup={journey.pickupLocation} 
               dropoff={journey.dropoffLocation}
               onRouteCalculated={handleRouteCalculated}
             />
          </div>

          <div className="bg-stitch-surface/30 p-4 rounded-2xl border border-stitch-outline/10 flex items-start gap-3">
             <Info className="text-stitch-primary shrink-0 mt-0.5" size={16} />
             <p className="text-xs text-stitch-on-surface-variant leading-relaxed">
               Distance and time estimates are based on current traffic conditions. 
               Your Motohom is equipped with advanced GPS to optimize your route in real-time.
             </p>
          </div>
        </div>

        {/* Journey Summary Sidebar */}
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
