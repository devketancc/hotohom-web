export interface CaravanClass {
  id: string;
  name: string;
  pricePerDay: number;
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
  dates: {
    start: Date | null;
    end: Date | null;
  };
  caravanClass: CaravanClass | null;
  passengers: Passenger[];
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
