import { arrayMove } from '@dnd-kit/sortable';
import type { Journey, JourneyStop } from '@/types/booking';

export function newStopId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `stop-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createDefaultStops(): JourneyStop[] {
  return [
    { id: newStopId(), order: 1, stop_type: 'pickup', notes: '', location: null },
    { id: newStopId(), order: 2, stop_type: 'waypoint', notes: '', location: null },
    { id: newStopId(), order: 3, stop_type: 'dropoff', notes: '', location: null },
  ];
}

export function migrateLegacyJourneyToStops(
  journey: Pick<Journey, 'pickupLocation' | 'dropoffLocation'>
): JourneyStop[] {
  return [
    {
      id: newStopId(),
      order: 1,
      stop_type: 'pickup',
      notes: '',
      location: journey.pickupLocation
        ? {
            name: journey.pickupLocation,
            lat: 0,
            lng: 0,
            place_id: '',
            meta: {},
          }
        : null,
    },
    { id: newStopId(), order: 2, stop_type: 'waypoint', notes: '', location: null },
    {
      id: newStopId(),
      order: 3,
      stop_type: 'dropoff',
      notes: '',
      location: journey.dropoffLocation
        ? {
            name: journey.dropoffLocation,
            lat: 0,
            lng: 0,
            place_id: '',
            meta: {},
          }
        : null,
    },
  ];
}

export function ensureStopIds(stops: JourneyStop[]): JourneyStop[] {
  return stops.map((s) => ({ ...s, id: s.id || newStopId() }));
}

export function reassignStopOrders(stops: JourneyStop[]): JourneyStop[] {
  return stops.map((s, i) => ({ ...s, order: i + 1 }));
}

export function syncPickupDropStrings(stops: JourneyStop[]): {
  pickupLocation: string;
  dropoffLocation: string;
} {
  return {
    pickupLocation: stops[0]?.location?.name ?? '',
    dropoffLocation: stops[stops.length - 1]?.location?.name ?? '',
  };
}

export function getWaypointSlice(stops: JourneyStop[]): JourneyStop[] {
  return stops.slice(1, -1);
}

export function reorderWaypointsById(
  stops: JourneyStop[],
  activeId: string,
  overId: string
): JourneyStop[] {
  if (stops.length < 3) return stops;
  const pickup = stops[0];
  const dropoff = stops[stops.length - 1];
  const waypoints = stops.slice(1, -1);
  const oldIndex = waypoints.findIndex((w) => w.id === activeId);
  const newIndex = waypoints.findIndex((w) => w.id === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return stops;
  const reordered = arrayMove(waypoints, oldIndex, newIndex);
  return reassignStopOrders([pickup, ...reordered, dropoff]);
}

export function addWaypointBeforeDropoff(stops: JourneyStop[]): JourneyStop[] {
  if (stops.length < 2) return stops;
  const pickup = stops[0];
  const dropoff = stops[stops.length - 1];
  const middle = stops.slice(1, -1);
  const insert: JourneyStop = {
    id: newStopId(),
    order: 0,
    stop_type: 'waypoint',
    notes: '',
    location: null,
  };
  return reassignStopOrders([pickup, ...middle, insert, dropoff]);
}

export function removeWaypoint(stops: JourneyStop[], waypointId: string): JourneyStop[] {
  const waypoints = getWaypointSlice(stops);
  if (waypoints.length <= 1) return stops;
  const pickup = stops[0];
  const dropoff = stops[stops.length - 1];
  const filtered = waypoints.filter((w) => w.id !== waypointId);
  return reassignStopOrders([pickup, ...filtered, dropoff]);
}

/** Shape expected by booking/journey API (no client `id`). */
export function toApiStops(stops: JourneyStop[]) {
  return stops.map((s, i) => ({
    order: i + 1,
    stop_type: s.stop_type,
    notes: s.notes,
    location: s.location,
  }));
}

export function allStopsHavePlaces(stops: JourneyStop[]): boolean {
  return stops.every(
    (s) =>
      s.location != null &&
      s.location.name.trim() !== '' &&
      s.location.place_id !== ''
  );
}

/** Enough to request Directions (name + Places result or coordinates). */
export function canPreviewJourneyRoute(stops: JourneyStop[]): boolean {
  if (stops.length < 3) return false;
  return stops.every((s) => {
    const L = s.location;
    if (!L?.name?.trim()) return false;
    if (L.place_id) return true;
    return (
      Number.isFinite(L.lat) &&
      Number.isFinite(L.lng) &&
      !(L.lat === 0 && L.lng === 0)
    );
  });
}

/** Package flow: exactly pickup + dropoff with resolved Places (or coords). */
export function canCompletePackagePickupDrop(stops: JourneyStop[]): boolean {
  if (stops.length !== 2) return false;
  const [a, b] = stops;
  if (a.stop_type !== 'pickup' || b.stop_type !== 'dropoff') return false;
  return allStopsHavePlaces(stops);
}

export function stopsToMapRoute(stops: JourneyStop[]) {
  return stops.map((s) => ({
    name: s.location?.name ?? '',
    lat: s.location?.lat,
    lng: s.location?.lng,
  }));
}
