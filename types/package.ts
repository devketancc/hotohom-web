/** Travel package from GET /api/v1/packages/ */

export interface StayLocationDetail {
  id: string;
  name: string;
  lat: string;
  lng: string;
}

export interface PackageStop {
  id: string;
  order: number;
  day_number: number | null;
  stop_type: string;
  title: string;
  location: string;
  location_name: string;
  distance_from_prev_km: number | null;
  notes: string;
}

export interface PackageDay {
  id: string;
  day_number: number;
  title: string;
  description: string;
  stay_type: string;
  stay_name: string;
  stay_location: string | null;
  stay_location_detail: StayLocationDetail | null;
  stay_address: string;
  amenities: string[];
  stay_notes: string;
  stops: PackageStop[];
}

export interface TravelPackage {
  id: string;
  name: string;
  description: string;
  caravan_class: string;
  caravan_class_code: string;
  home_hub: string;
  home_hub_name: string;
  duration_days: number;
  included_km: number;
  base_price: string;
  thumbnail_url: string | null;
  highlights: string[];
  images: string[];
  is_active: boolean;
  days: PackageDay[];
  created_at: string;
}

export interface PackagesPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: TravelPackage[];
}
