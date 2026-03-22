'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ArrowRight, Plus, Map as MapIcon, Flag, Info } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { GoogleMapView } from './GoogleMapView';

export const JourneyPlannerForm = () => {
  const { journey, setData } = useBookingStore();
  const [pickup, setPickup] = useState(journey?.pickupLocation || '');
  const [dropoff, setDropoff] = useState(journey?.dropoffLocation || '');
  const [showRoute, setShowRoute] = useState(!!(journey?.pickupLocation && journey?.dropoffLocation));
  const userHasEditedLocations = useRef(false);

  useEffect(() => {
    if (!journey || userHasEditedLocations.current) return;
    const p = journey.pickupLocation || '';
    const d = journey.dropoffLocation || '';
    if (p) setPickup(p);
    if (d) setDropoff(d);
    if (p && d) setShowRoute(true);
  }, [journey]);

  const handleShowRoute = () => {
    if (pickup && dropoff) {
      setData({
        journey: {
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          distanceKm: journey?.distanceKm || 0,
        }
      });
      setShowRoute(true);
    }
  };

  const handleRouteCalculated = (distanceKm: number) => {
    setData({
      journey: {
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        distanceKm: Math.round(distanceKm),
      }
    });
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-stitch-on-surface">
          Plan Your Journey
        </h1>
        <p className="font-body text-stitch-on-surface-variant text-lg">
          Define your route to curate the perfect experience.
        </p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Location Input Group */}
        <div className="relative space-y-6">
          {/* Pickup */}
          <div className="group">
            <label className="block text-[10px] uppercase tracking-[0.1em] text-stitch-outline mb-2 ml-1">
              Pickup Location
            </label>
            <div className="relative flex items-center border-b-2 border-stitch-outline/30 focus-within:border-stitch-primary transition-all pb-2">
              <MapPin className="text-stitch-primary mr-4" size={20} />
              <input
                type="text"
                value={pickup}
                onChange={(e) => {
                  userHasEditedLocations.current = true;
                  setPickup(e.target.value);
                  setShowRoute(false);
                }}
                placeholder="Enter starting point"
                className="bg-transparent border-none focus:ring-0 w-full text-stitch-on-surface placeholder:text-stitch-surface-highest/60 font-medium"
              />
            </div>
          </div>

          {/* Stop 1 (Static UI for now to match Stitch) */}
          <div className="group opacity-40">
            <label className="block text-[10px] uppercase tracking-[0.1em] text-stitch-outline mb-2 ml-1">
              Stop 1
            </label>
            <div className="relative flex items-center border-b-2 border-stitch-outline/30 pb-2">
              <Navigation className="text-stitch-primary mr-4 rotate-45" size={20} />
              <input
                type="text"
                disabled
                placeholder="Add a waypoint (Coming soon)"
                className="bg-transparent border-none focus:ring-0 w-full text-stitch-on-surface placeholder:text-stitch-surface-highest/60 font-medium"
              />
            </div>
          </div>

          {/* Add Stop Action */}
          <button className="flex items-center gap-2 text-stitch-primary font-bold text-sm hover:opacity-80 transition-opacity pl-1">
            <Plus size={16} />
            <span>Add stop along the way</span>
          </button>

          {/* Destination */}
          <div className="group pt-4">
            <label className="block text-[10px] uppercase tracking-[0.1em] text-stitch-outline mb-2 ml-1">
              Final Destination
            </label>
            <div className="relative flex items-center border-b-2 border-stitch-outline/30 focus-within:border-stitch-primary transition-all pb-2">
              <Flag className="text-stitch-primary mr-4" size={20} />
              <input
                type="text"
                value={dropoff}
                onChange={(e) => {
                  userHasEditedLocations.current = true;
                  setDropoff(e.target.value);
                  setShowRoute(false);
                }}
                placeholder="Where is your journey ending?"
                className="bg-transparent border-none focus:ring-0 w-full text-stitch-on-surface placeholder:text-stitch-surface-highest/60 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-4">
          <button
            onClick={handleShowRoute}
            disabled={!pickup || !dropoff}
            className="px-8 py-4 gradient-cta text-stitch-on-primary font-headline font-bold rounded-xl flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-stitch-primary/10 disabled:opacity-50 disabled:grayscale"
          >
            Show Route
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Visual Context Map Area */}
      <div className="w-full aspect-video rounded-3xl bg-stitch-surface overflow-hidden relative group border border-stitch-outline/10 shadow-inner">
        {showRoute && pickup && dropoff ? (
          <div className="w-full h-full animate-in fade-in duration-500">
            <GoogleMapView 
              pickup={pickup} 
              dropoff={dropoff} 
              onRouteCalculated={handleRouteCalculated}
            />
          </div>
        ) : (
          <>
            <img 
              className="w-full h-full object-cover opacity-20 grayscale scale-110 group-hover:scale-100 transition-transform duration-1000" 
              alt="Map Background" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8alCA3RhusCZc3rwD8gPbDIgcypFCBYy6wuDeTYOL-2VoeIwqMPZG7u5ZOI9t_PUoMCzSdnWraLMhZJRKcAm0hU28FEjm0f-GRQEuy2xFIQaDVJ9F4rq28RFSjPEbvrYNZSX_uQRwUaszq3DD6FtHBn9Ve-WnJ2mEot_08dsaYYer2PJ13xt_2fw7w451Fi3czJqUYPQnrubx5_mfQPqa5KmOlNAoWwibp-sRpL0wjB-j3B8EDEbBDXJAbWyDZVHZVGJznKnngfs"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stitch-background via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-stitch-primary/10 flex items-center justify-center border border-stitch-primary/20 backdrop-blur-md">
                <MapIcon className="text-stitch-primary" size={32} />
              </div>
              <div className="space-y-1">
                <p className="font-headline font-bold text-2xl text-stitch-on-background">Interactive Route Preview</p>
                <p className="font-body text-sm text-stitch-on-surface-variant flex items-center gap-2">
                  <Info size={14} />
                  Your path will appear here after calculation.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
