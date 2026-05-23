import type { BookingData, JourneyStopLocation } from '@/types/booking';
import type { CreatePackageCartPayload, CreateCartRouteStopPayload } from '@/types/cart';
import type { TravelPackage } from '@/types/package';

const COORD_DECIMALS = 6;

function roundCoordinate(value: number): number {
  const m = 10 ** COORD_DECIMALS;
  return Math.round(value * m) / m;
}

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

function toRouteStopPayload(
  order: number,
  stop_type: 'pickup' | 'dropoff',
  loc: JourneyStopLocation
): CreateCartRouteStopPayload {
  return {
    order,
    stop_type,
    notes: '',
    location: {
      name: loc.name,
      lat: roundCoordinate(loc.lat),
      lng: roundCoordinate(loc.lng),
      place_id: loc.place_id,
      meta: loc.meta && typeof loc.meta === 'object' ? { ...loc.meta } : {},
    },
  };
}

export function buildPackageCartPayload(input: {
  pkg: TravelPackage;
  booking: BookingData;
  pickup: JourneyStopLocation;
  dropoff: JourneyStopLocation;
  customerName: string;
  customerPhone: string;
}): CreatePackageCartPayload {
  const { pkg, booking, pickup, dropoff, customerName, customerPhone } = input;
  const { hub, caravanClass, dates, passengers, pets } = booking;

  if (!hub) throw new Error('Missing hub');
  if (!caravanClass) throw new Error('Missing caravan class');
  if (!dates.start || !dates.end) throw new Error('Missing travel dates');

  const stops: CreateCartRouteStopPayload[] = [
    toRouteStopPayload(1, 'pickup', pickup),
    toRouteStopPayload(2, 'dropoff', dropoff),
  ];

  const estimatedKm =
    Number.isFinite(booking.journey?.distanceKm) && (booking.journey?.distanceKm ?? 0) > 0
      ? booking.journey!.distanceKm
      : pkg.included_km;

  return {
    package_id: pkg.id,
    caravan_class_id: caravanClass.id,
    hub_id: hub,
    start_datetime: toTripStartISO(dates.start),
    end_datetime: toTripEndISO(dates.end),
    num_humans: passengers,
    num_pets: pets,
    name: customerName.trim(),
    phone: customerPhone.trim(),
    stops,
    is_one_way: true,
    estimated_km: estimatedKm,
  };
}
