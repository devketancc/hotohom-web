import type { BookingData } from '@/types/booking';
import type { CreateCartPayload, CreateCartStopPayload } from '@/types/cart';
import { canPreviewJourneyRoute } from '@/utils/journeyStops';

/** Backend allows max 6 decimal places on lat/lng (and total digit constraints on the decimal field). */
const COORD_DECIMALS = 6;

function roundCoordinate(value: number): number {
  const m = 10 ** COORD_DECIMALS;
  return Math.round(value * m) / m;
}

/**
 * Combines booking calendar date with fixed wall times (local), then serializes to ISO UTC.
 * If the API requires a fixed timezone (e.g. Asia/Kolkata), replace with an explicit offset formatter.
 */
function toTripStartISO(date: Date): string {
  const d = new Date(date);
  d.setHours(6, 30, 0, 0);
  return d.toISOString();
}

function toTripEndISO(date: Date): string {
  const d = new Date(date);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

export function buildCartPayload(booking: BookingData): CreateCartPayload {
  const { hub, caravanClass, dates, passengers, pets, journey } = booking;

  if (!hub) {
    throw new Error('Missing hub');
  }
  if (!caravanClass) {
    throw new Error('Missing caravan class');
  }
  if (!dates.start || !dates.end) {
    throw new Error('Missing travel dates');
  }
  if (!journey?.stops?.length) {
    throw new Error('Missing journey stops');
  }
  if (!canPreviewJourneyRoute(journey.stops)) {
    throw new Error('Journey stops are incomplete');
  }

  const routeStops: CreateCartStopPayload[] = journey.stops.map((s, index) => {
    const loc = s.location;
    if (!loc) {
      throw new Error(`Stop ${index + 1} has no location`);
    }
    return {
      order: index + 1,
      stop_type: s.stop_type,
      notes: s.notes ?? '',
      location: {
        name: loc.name,
        lat: roundCoordinate(loc.lat),
        lng: roundCoordinate(loc.lng),
        place_id: loc.place_id,
        meta: loc.meta && typeof loc.meta === 'object' ? { ...loc.meta } : {},
      },
    };
  });

  const stops: CreateCartStopPayload[] = [
    {
      location_id: hub,
      order: 0,
      stop_type: 'hub_start',
      notes: '',
    },
    ...routeStops,
    {
      location_id: hub,
      order: routeStops.length + 1,
      stop_type: 'hub_end',
      notes: '',
    },
  ];

  return {
    caravan_class_id: caravanClass.id,
    hub_id: hub,
    start_datetime: toTripStartISO(dates.start),
    end_datetime: toTripEndISO(dates.end),
    num_humans: passengers,
    num_pets: pets,
    is_one_way: false,
    estimated_km: journey.distanceKm,
    stops,
  };
}
