import type { TravelPackage } from '@/types/package';

export interface CaravanClass {
  id: string;
  name: string;
  description: string;
  full_capacity: number;
  capacity_pets: number;
  is_pet_friendly: boolean;
  amenities: string[];
  day_rate: string;
  km_rate: string;
  deposit_amount: string;
  available_count: number;
}

export interface AvailabilityData {
  start: string;
  end: string;
  hub: string;
  available_classes: CaravanClass[];
}

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
}

/** Location payload aligned with booking/journey API */
export interface JourneyStopLocation {
  name: string;
  lat: number;
  lng: number;
  place_id: string;
  meta: Record<string, unknown>;
}

export interface JourneyStop {
  /** Client-only id for React / drag-drop (omit when sending to API) */
  id: string;
  order: number;
  stop_type: 'pickup' | 'waypoint' | 'dropoff';
  notes: string;
  location: JourneyStopLocation | null;
}

export interface Journey {
  pickupLocation: string;
  dropoffLocation: string;
  distanceKm: number;
  stops: JourneyStop[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export type BookingFlow = 'standard' | 'package';

/** Persisted when user picks a hub (from LocationHub.coordinates) for maps / round-trip routing. */
export interface HubLocation {
  lat: number;
  lng: number;
}

export interface BookingData {
  hub: string | null;
  hubName: string | null;
  hubLocation: HubLocation | null;
  dates: {
    start: Date | null;
    end: Date | null;
    totalDays: number;
  };
  caravanClass: CaravanClass | null;
  passengers: number;
  pets: number;
  journey: Journey | null;
  addons: Addon[];
  pricing: {
    basePrice: number;
    addonsPrice: number;
    tax: number;
    total: number;
  };
  bookingFlow: BookingFlow;
  /** Package row while user is in package booking (set on detail proceed). */
  activePackage: TravelPackage | null;
}
