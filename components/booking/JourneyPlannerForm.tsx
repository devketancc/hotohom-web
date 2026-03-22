'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MapPin, ArrowRight, Plus, Map as MapIcon, Flag, Info } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { GoogleMapView } from './GoogleMapView';
import { PlacesAutocompleteInput } from './PlacesAutocompleteInput';
import { SortableWaypointRow } from './SortableWaypointRow';
import type { JourneyStop, JourneyStopLocation } from '@/types/booking';
import {
  addWaypointBeforeDropoff,
  canPreviewJourneyRoute,
  createDefaultStops,
  ensureStopIds,
  getWaypointSlice,
  migrateLegacyJourneyToStops,
  reassignStopOrders,
  removeWaypoint,
  reorderWaypointsById,
  syncPickupDropStrings,
  stopsToMapRoute,
} from '@/utils/journeyStops';

export const JourneyPlannerForm = () => {
  const journey = useBookingStore((s) => s.journey);
  const setData = useBookingStore((s) => s.setData);

  useEffect(() => {
    if (!journey) {
      setData({
        journey: {
          pickupLocation: '',
          dropoffLocation: '',
          distanceKm: 0,
          stops: createDefaultStops(),
        },
      });
      return;
    }
    if (!journey.stops || journey.stops.length < 3) {
      const base = migrateLegacyJourneyToStops(journey);
      const stops = reassignStopOrders(ensureStopIds(base));
      setData({
        journey: {
          ...journey,
          stops,
          ...syncPickupDropStrings(stops),
        },
      });
      return;
    }
    if (journey.stops.some((s) => !s.id)) {
      const stops = reassignStopOrders(ensureStopIds(journey.stops));
      setData({ journey: { ...journey, stops } });
    }
  }, [journey, setData]);

  const stops = journey?.stops;
  const pickupStop = stops?.[0];
  const dropoffStop = stops && stops.length > 0 ? stops[stops.length - 1] : undefined;
  const waypoints = stops ? getWaypointSlice(stops) : [];

  const updateStops = useCallback(
    (next: JourneyStop[]) => {
      const ordered = reassignStopOrders(next);
      const strings = syncPickupDropStrings(ordered);
      setData({
        journey: {
          pickupLocation: strings.pickupLocation,
          dropoffLocation: strings.dropoffLocation,
          distanceKm: journey?.distanceKm ?? 0,
          stops: ordered,
        },
      });
    },
    [journey?.distanceKm, setData]
  );

  const setPickupLocation = useCallback(
    (loc: JourneyStopLocation | null) => {
      if (!stops?.length) return;
      const next = [...stops];
      next[0] = { ...next[0], location: loc };
      updateStops(next);
    },
    [stops, updateStops]
  );

  const setDropoffLocation = useCallback(
    (loc: JourneyStopLocation | null) => {
      if (!stops?.length) return;
      const next = [...stops];
      next[next.length - 1] = { ...next[next.length - 1], location: loc };
      updateStops(next);
    },
    [stops, updateStops]
  );

  const setWaypointLocation = useCallback(
    (waypointId: string, loc: JourneyStopLocation | null) => {
      if (!stops?.length) return;
      const next = stops.map((s) => (s.id === waypointId ? { ...s, location: loc } : s));
      updateStops(next);
    },
    [stops, updateStops]
  );

  const handleAddStop = useCallback(() => {
    if (!stops?.length) return;
    updateStops(addWaypointBeforeDropoff(stops));
  }, [stops, updateStops]);

  const handleRemoveWaypoint = useCallback(
    (waypointId: string) => {
      if (!stops?.length) return;
      updateStops(removeWaypoint(stops, waypointId));
    },
    [stops, updateStops]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !stops?.length) return;
      updateStops(reorderWaypointsById(stops, String(active.id), String(over.id)));
    },
    [stops, updateStops]
  );

  const routeReady = stops ? canPreviewJourneyRoute(stops) : false;
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const handleShowRoute = useCallback(() => {
    if (!routeReady) return;
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [routeReady]);

  const handleRouteCalculated = useCallback(
    (distanceKm: number) => {
      if (!stops?.length) return;
      setData({
        journey: {
          pickupLocation: syncPickupDropStrings(stops).pickupLocation,
          dropoffLocation: syncPickupDropStrings(stops).dropoffLocation,
          distanceKm: Math.round(distanceKm),
          stops,
        },
      });
    },
    [setData, stops]
  );

  if (!pickupStop || !dropoffStop || !stops?.length) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-stitch-surface rounded-lg w-2/3" />
        <div className="h-32 bg-stitch-surface rounded-xl" />
      </div>
    );
  }

  const mapStops = stopsToMapRoute(stops);
  const waypointIds = waypoints.map((w) => w.id);
  const moreThanOneWaypoint = waypoints.length > 1;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-stitch-on-surface">
          Plan Your Journey
        </h1>
        <p className="font-body text-stitch-on-surface-variant text-lg">
          Pickup, one stop, and drop-off are required. Add more stops if you like. Places search is limited to
          India.
        </p>
      </div>

      <div className="space-y-8 max-w-2xl">
        <div className="relative space-y-6">
          <div className="group">
            <label className="block text-[10px] uppercase tracking-[0.1em] text-stitch-outline mb-2 ml-1">
              Pickup location
            </label>
            <PlacesAutocompleteInput
              stopId={pickupStop.id}
              location={pickupStop.location}
              onResolved={setPickupLocation}
              placeholder="Search pickup in India"
              icon={<MapPin size={20} />}
            />
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={waypointIds} strategy={verticalListSortingStrategy}>
              {waypoints.map((stop, i) => (
                <SortableWaypointRow
                  key={stop.id}
                  stop={stop}
                  indexLabel={i + 1}
                  onLocationChange={(loc) => setWaypointLocation(stop.id, loc)}
                  onRemove={() => handleRemoveWaypoint(stop.id)}
                  canRemove={moreThanOneWaypoint}
                />
              ))}
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={handleAddStop}
            className="flex items-center gap-2 text-stitch-primary font-bold text-sm hover:opacity-80 transition-opacity pl-1"
          >
            <Plus size={16} />
            <span>Add stop along the way</span>
          </button>

          <div className="group pt-4">
            <label className="block text-[10px] uppercase tracking-[0.1em] text-stitch-outline mb-2 ml-1">
              Final destination
            </label>
            <PlacesAutocompleteInput
              stopId={dropoffStop.id}
              location={dropoffStop.location}
              onResolved={setDropoffLocation}
              placeholder="Search drop-off in India"
              icon={<Flag size={20} />}
            />
          </div>
        </div>

        <div className="pt-6 space-y-4">
          <button
            type="button"
            onClick={handleShowRoute}
            disabled={!routeReady}
            className="px-8 py-4 gradient-cta text-stitch-on-primary font-headline font-bold rounded-xl flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-stitch-primary/10 disabled:opacity-50 disabled:grayscale"
          >
            Show route
            <ArrowRight size={20} />
          </button>
          {!routeReady && (
            <p className="text-xs text-muted-foreground">
              Choose each location from the suggestions so we capture place ID and coordinates.
            </p>
          )}
        </div>
      </div>

      <div
        ref={mapSectionRef}
        className="w-full aspect-video rounded-3xl bg-stitch-surface overflow-hidden relative group border border-stitch-outline/10 shadow-inner scroll-mt-28"
      >
        {routeReady ? (
          <div className="w-full h-full animate-in fade-in duration-500">
            <GoogleMapView stops={mapStops} onRouteCalculated={handleRouteCalculated} />
          </div>
        ) : (
          <>
            <img
              className="w-full h-full object-cover opacity-20 grayscale scale-110 group-hover:scale-100 transition-transform duration-1000"
              alt="Map background"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8alCA3RhusCZc3rwD8gPbDIgcypFCBYy6wuDeTYOL-2VoeIwqMPZG7u5ZOI9t_PUoMCzSdnWraLMhZJRKcAm0hU28FEjm0f-GRQEuy2xFIQaDVJ9F4rq28RFSjPEbvrYNZSX_uQRwUaszq3DD6FtHBn9Ve-WnJ2mEot_08dsaYYer2PJ13xt_2fw7w451Fi3czJqUYPQnrubx5_mfQPqa5KmOlNAoWwibp-sRpL0wjB-j3B8EDEbBDXJAbWyDZVHZVGJznKnngfs"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stitch-background via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-stitch-primary/10 flex items-center justify-center border border-stitch-primary/20 backdrop-blur-md">
                <MapIcon className="text-stitch-primary" size={32} />
              </div>
              <div className="space-y-1">
                <p className="font-headline font-bold text-2xl text-stitch-on-background">Interactive route preview</p>
                <p className="font-body text-sm text-stitch-on-surface-variant flex items-center gap-2">
                  <Info size={14} />
                  Complete all stops to preview your route.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
