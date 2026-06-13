'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowRight,
  CalendarDays,
  Caravan,
  Flag,
  GripVertical,
  Loader2,
  Map as MapIcon,
  MapPin,
  Plus,
  Route as RouteIcon,
  X,
} from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';
import { isAuthed, requestAuthThenNavigate } from '@/lib/authNavigation';
import { GoogleMapView, type RouteDetails } from '@/components/booking/GoogleMapView';
import { PlacesAutocompleteInput } from '@/components/booking/PlacesAutocompleteInput';
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

function fmtKm(km: number): string {
  return `${Math.round(km).toLocaleString('en-IN')} km`;
}
function fmtDur(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r}m`;
  return `${h}h ${r}m`;
}

export default function JourneyDetailsPage() {
  const router = useRouter();
  const journey = useBookingStore((s) => s.journey);
  const setData = useBookingStore((s) => s.setData);
  const hubName = useBookingStore((s) => s.hubName);
  const hubLocation = useBookingStore((s) => s.hubLocation);
  const dates = useBookingStore((s) => s.dates);
  const caravanClass = useBookingStore((s) => s.caravanClass);
  const passengers = useBookingStore((s) => s.passengers);
  const { isAuthenticated, user } = useAuth();
  const openLogin = useUiStore((s) => s.openLogin);

  const sessionOk = isAuthenticated && !!user;
  const [routePreviewShown, setRoutePreviewShown] = React.useState(false);
  const [routeDetails, setRouteDetails] = React.useState<RouteDetails | null>(null);

  // Initialise / migrate journey stops.
  React.useEffect(() => {
    if (!journey) {
      setData({
        journey: { pickupLocation: '', dropoffLocation: '', distanceKm: 0, stops: createDefaultStops() },
      });
      return;
    }
    if (!journey.stops || journey.stops.length < 3) {
      const base = migrateLegacyJourneyToStops(journey);
      const stops = reassignStopOrders(ensureStopIds(base));
      setData({ journey: { ...journey, stops, ...syncPickupDropStrings(stops) } });
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

  const updateStops = React.useCallback(
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
    [journey?.distanceKm, setData],
  );

  const setPickupLocation = React.useCallback(
    (loc: JourneyStopLocation | null) => {
      if (!stops?.length) return;
      const next = [...stops];
      next[0] = { ...next[0], location: loc };
      updateStops(next);
    },
    [stops, updateStops],
  );
  const setDropoffLocation = React.useCallback(
    (loc: JourneyStopLocation | null) => {
      if (!stops?.length) return;
      const next = [...stops];
      next[next.length - 1] = { ...next[next.length - 1], location: loc };
      updateStops(next);
    },
    [stops, updateStops],
  );
  const setWaypointLocation = React.useCallback(
    (id: string, loc: JourneyStopLocation | null) => {
      if (!stops?.length) return;
      updateStops(stops.map((s) => (s.id === id ? { ...s, location: loc } : s)));
    },
    [stops, updateStops],
  );
  const handleAddStop = React.useCallback(() => {
    if (stops?.length) updateStops(addWaypointBeforeDropoff(stops));
  }, [stops, updateStops]);
  const handleRemoveWaypoint = React.useCallback(
    (id: string) => {
      if (stops?.length) updateStops(removeWaypoint(stops, id));
    },
    [stops, updateStops],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !stops?.length) return;
      updateStops(reorderWaypointsById(stops, String(active.id), String(over.id)));
    },
    [stops, updateStops],
  );

  const routeReady = stops ? canPreviewJourneyRoute(stops) : false;

  React.useEffect(() => {
    if (!routeReady) {
      setRoutePreviewShown(false);
      setRouteDetails(null);
    }
  }, [routeReady]);
  React.useEffect(() => {
    if (!sessionOk) setRoutePreviewShown(false);
  }, [sessionOk]);

  const handlePreviewRoute = React.useCallback(() => {
    if (!routeReady) return;
    if (!isAuthed()) {
      openLogin();
      return;
    }
    setRoutePreviewShown(true);
  }, [routeReady, openLogin]);

  const handleRouteCalculated = React.useCallback(
    (distanceKm: number) => {
      if (!stops?.length) return;
      const strings = syncPickupDropStrings(stops);
      setData({
        journey: {
          pickupLocation: strings.pickupLocation,
          dropoffLocation: strings.dropoffLocation,
          distanceKm: Math.round(distanceKm),
          stops,
        },
      });
    },
    [setData, stops],
  );

  const handleContinue = React.useCallback(() => {
    if (!isAuthed()) {
      requestAuthThenNavigate('/passenger');
      return;
    }
    router.push('/passenger');
  }, [router]);

  const mapHub = React.useMemo(
    () => (hubLocation ? { name: hubName ?? 'Hub', lat: hubLocation.lat, lng: hubLocation.lng } : null),
    [hubName, hubLocation],
  );
  const stopTitles = React.useMemo(() => {
    if (!stops?.length) return [];
    return stops.map((s, i) => {
      const name = s.location?.name ?? 'Location pending';
      if (i === 0) return `Pickup: ${name}`;
      if (i === stops.length - 1) return `Drop-off: ${name}`;
      return `Stop ${i}: ${name}`;
    });
  }, [stops]);

  const showMap = routeReady && routePreviewShown;

  if (!pickupStop || !dropoffStop || !stops?.length) {
    return (
      <div className="mx-auto max-w-screen-2xl animate-pulse px-4 py-10 lg:px-8">
        <div className="h-10 w-64 rounded-lg bg-stitch-surface" />
        <div className="mt-8 h-96 rounded-2xl bg-stitch-surface" />
      </div>
    );
  }

  const mapStops = stopsToMapRoute(stops);
  const waypointIds = waypoints.map((w) => w.id);
  const canRemoveWaypoint = waypoints.length > 1;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 text-ink lg:px-8 lg:py-12">
      <header className="mb-8">
            <span className="label-mono text-gold">Step 02 / The Route</span>
            <h1
              style={{ fontFamily: 'var(--font-headline)' }}
              className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-[-0.01em]"
            >
              Shape the <span className="italic text-gold">journey.</span>
            </h1>
            <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-ink-muted">
              Add stops, preview the route, and see estimated driving time and distance. We&apos;ll
              take care of the rest.
            </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_1fr_340px] lg:gap-8 lg:items-start">
            {/* Form */}
            <div className="space-y-6">
              <Field label="Pickup Location">
                <PlacesAutocompleteInput
                  variant="boxed"
                  stopId={pickupStop.id}
                  location={pickupStop.location}
                  onResolved={setPickupLocation}
                  placeholder="Search pickup location in India"
                  icon={<MapPin size={18} />}
                />
              </Field>

              <div>
                <p className="mb-3 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                  Destination Stops <span className="text-ink-faint/60">(optional)</span>
                </p>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={waypointIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2.5">
                      {waypoints.map((stop, i) => (
                        <WaypointRow
                          key={stop.id}
                          stop={stop}
                          index={i + 2}
                          onChange={(loc) => setWaypointLocation(stop.id, loc)}
                          onRemove={() => handleRemoveWaypoint(stop.id)}
                          canRemove={canRemoveWaypoint}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/12 py-3 font-headline text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted transition-colors hover:border-stitch-primary/40 hover:text-stitch-primary"
                >
                  <Plus size={14} /> Add stop
                </button>
              </div>

              <Field label="Drop Location">
                <PlacesAutocompleteInput
                  variant="boxed"
                  stopId={dropoffStop.id}
                  location={dropoffStop.location}
                  onResolved={setDropoffLocation}
                  placeholder="Search drop location in India"
                  icon={<Flag size={18} />}
                />
              </Field>

              <div>
                <button
                  type="button"
                  onClick={handlePreviewRoute}
                  disabled={!routeReady}
                  className="gradient-cta group inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.16em] text-stitch-on-primary-container transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] disabled:cursor-not-allowed disabled:opacity-40 disabled:grayscale"
                >
                  Preview Route
                  <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-0.5" />
                </button>
                <p className="mt-3 font-body text-[11px] leading-relaxed text-ink-faint">
                  Add pickup, at least one destination, and drop location to preview the route.
                </p>
              </div>
            </div>

            {/* Map / preview */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-stitch-surface/30">
              {showMap ? (
                <>
                  <div className="h-[336px] lg:h-[416px]">
                    <GoogleMapView
                      stops={mapStops}
                      hub={mapHub}
                      stopTitles={stopTitles}
                      onRouteCalculated={handleRouteCalculated}
                      onRouteDetails={setRouteDetails}
                      hideSummary
                    />
                  </div>
                  {routeDetails && (
                    <div className="grid grid-cols-3 gap-4 border-t border-white/[0.08] bg-stitch-surface/50 p-5">
                      <SummaryCell label="Distance" value={fmtKm(routeDetails.distanceKm)} />
                      <SummaryCell label="Driving Time" value={fmtDur(routeDetails.durationMin)} />
                      <SummaryCell
                        label="Total Time"
                        value={fmtDur(routeDetails.durationMin + waypoints.length * 30)}
                        sub="including stops"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-[336px] flex-col items-center justify-center px-8 text-center lg:h-[416px]">
                  <span className="flex size-16 items-center justify-center rounded-full border border-stitch-primary/20 bg-stitch-primary/[0.06] text-stitch-primary">
                    <MapIcon size={28} />
                  </span>
                  <p className="mt-6 font-headline text-base font-semibold text-ink">
                    Your route preview will appear here
                  </p>
                  <p className="mt-2 max-w-xs font-body text-sm leading-relaxed text-ink-muted">
                    Add locations to see the route, distance, and estimated driving time.
                  </p>
                </div>
              )}
            </div>

        {/* Your Journey panel */}
        <aside>
          <div className="lg:sticky lg:top-24 rounded-2xl border border-white/[0.08] bg-stitch-surface/40 p-6">
            <h2 style={{ fontFamily: 'var(--font-headline)' }} className="text-lg font-semibold text-ink">
              Your Journey
            </h2>

            <dl className="mt-5 space-y-4">
              <PanelRow icon={MapPin} label="Location" value={hubName || 'Hub'} />
              <PanelRow
                icon={CalendarDays}
                label="Dates"
                value={
                  dates.start && dates.end
                    ? `${new Date(dates.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${new Date(dates.end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} (${dates.totalDays} ${dates.totalDays === 1 ? 'day' : 'days'})`
                    : 'Not set'
                }
              />
              <PanelRow
                icon={Caravan}
                label="Vehicle"
                value={caravanClass?.name || 'Not selected'}
                sub={caravanClass ? `${passengers} Passengers` : undefined}
              />
            </dl>

            <div className="mt-6 border-t border-white/[0.08] pt-6">
              <p className="mb-4 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                Route Overview
              </p>
              {showMap && routeDetails ? (
                <RouteOverview stops={stops} legs={routeDetails.legs} />
              ) : (
                <div className="flex items-start gap-3">
                  <RouteIcon className="mt-0.5 size-4 shrink-0 text-ink-faint" />
                  <div>
                    <p className="font-body text-sm font-medium text-ink">No route added yet</p>
                    <p className="mt-1 font-body text-xs leading-relaxed text-ink-muted">
                      Add stops to see distance, driving time and route preview.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!sessionOk || !showMap}
              className="gradient-cta mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.16em] text-stitch-on-primary-container transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to details
              <ArrowRight size={15} />
            </button>
            <p className="mt-3 text-center font-body text-[11px] leading-relaxed text-ink-faint">
              {!sessionOk
                ? 'Log in to continue.'
                : !showMap
                  ? 'Route is required to continue.'
                  : 'You can modify the route in the next step.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">{label}</p>
      {children}
    </div>
  );
}

function WaypointRow({
  stop,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  stop: JourneyStop;
  index: number;
  onChange: (loc: JourneyStopLocation | null) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'flex items-center gap-2 rounded-xl border bg-white/[0.03] pl-2 pr-2.5 transition-colors',
        isDragging ? 'z-10 border-stitch-primary/40 opacity-80' : 'border-white/[0.08]',
      ].join(' ')}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none p-1 text-ink-faint hover:text-stitch-primary active:cursor-grabbing"
        aria-label="Reorder stop"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-stitch-primary/30 font-headline text-[11px] font-semibold text-stitch-primary">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <PlacesAutocompleteInput
          variant="boxed"
          className="[&>div]:border-none [&>div]:bg-transparent [&>div]:px-0 [&>div]:py-2.5"
          stopId={stop.id}
          location={stop.location}
          onResolved={onChange}
          placeholder="Add a stop or waypoint"
          icon={<span className="sr-only">stop</span>}
        />
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
          aria-label="Remove stop"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

function SummaryCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="font-headline text-[9px] uppercase tracking-[0.16em] text-ink-faint">{label}</p>
      <p style={{ fontFamily: 'var(--font-headline)' }} className="mt-1 text-lg font-semibold text-ink">
        {value}
      </p>
      {sub && <p className="font-body text-[10px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function PanelRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <dt className="font-headline text-[9px] uppercase tracking-[0.18em] text-ink-faint">{label}</dt>
        <dd className="font-body text-sm font-medium text-ink">{value}</dd>
        {sub && <dd className="font-body text-xs text-ink-muted">{sub}</dd>}
      </div>
      <Icon className="mt-0.5 size-4 shrink-0 text-ink-faint" />
    </div>
  );
}

function RouteOverview({ stops, legs }: { stops: JourneyStop[]; legs: { distanceKm: number; durationMin: number }[] }) {
  // Route order: hub -> stops[] -> hub. legs[0] = hub->stops[0]; legs[i] = stops[i-1]->stops[i].
  return (
    <ol className="space-y-3.5">
      {stops.map((stop, i) => {
        const isFirst = i === 0;
        const isLast = i === stops.length - 1;
        const legFromPrev = i >= 1 ? legs[i] : null;
        return (
          <li key={stop.id} className="flex items-start gap-3">
            <span
              className={[
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border font-headline text-[10px] font-semibold',
                isFirst || isLast ? 'border-stitch-primary/50 text-stitch-primary' : 'border-white/15 text-ink-muted',
              ].join(' ')}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-body text-sm font-medium text-ink">
                  {stop.location?.name?.split(',')[0] ?? 'Location pending'}
                </p>
                {(isFirst || isLast) && (
                  <span className="shrink-0 rounded-full border border-stitch-primary/30 px-2 py-0.5 font-headline text-[8px] font-semibold uppercase tracking-[0.14em] text-stitch-primary">
                    {isFirst ? 'Start' : 'End'}
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] text-ink-faint">
                {isFirst
                  ? '0 km · 0 min'
                  : legFromPrev
                    ? `${fmtKm(legFromPrev.distanceKm)} · ${fmtDur(legFromPrev.durationMin)}`
                    : '—'}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
