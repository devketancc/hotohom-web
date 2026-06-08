import type { AdminPaginated } from '@/types/admin';
import type { TravelPackage } from '@/types/package';

export type AdminPackage = TravelPackage;

export interface AdminPackageDayWrite {
  day_number: number;
  title: string;
  description?: string;
  stay_type: string;
  stay_name?: string;
  stay_location?: string | null;
  stay_address?: string;
  amenities?: string[];
  stay_notes?: string;
}

export interface AdminPackageStopWrite {
  order: number;
  day_number?: number | null;
  stop_type: string;
  title?: string;
  location: string;
  distance_from_prev_km?: number | null;
  notes?: string;
}

export interface AdminPackageWritePayload {
  name: string;
  description?: string;
  caravan_class: string;
  home_hub: string;
  duration_days: number;
  included_km: number;
  base_price: string;
  thumbnail_url?: string;
  highlights?: string[];
  images?: string[];
  is_active?: boolean;
  days: AdminPackageDayWrite[];
  stops: AdminPackageStopWrite[];
}

export interface AdminPackageListQuery {
  page?: number;
  page_size?: number;
}

export type AdminPackageListResponse = AdminPaginated<AdminPackage>;

export interface AdminPackageLocationOption {
  id: string;
  name: string;
  location_type: string;
}
