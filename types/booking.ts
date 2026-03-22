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

export interface Journey {
  pickupLocation: string;
  dropoffLocation: string;
  distanceKm: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface BookingData {
  hub: string | null;
  hubName: string | null;
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
}
