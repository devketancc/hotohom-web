/** Travel package from GET /api/v1/packages/ */

export interface PackageStop {
  id: string;
  order: number;
  stop_type: string;
  location: string;
  location_name: string;
  notes: string;
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
  is_active: boolean;
  stops: PackageStop[];
  created_at: string;
}

export interface PackagesPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: TravelPackage[];
}
