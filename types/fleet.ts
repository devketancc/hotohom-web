/** Fleet (caravan + caravan-class) types from public /api/v1/caravans/ endpoints. */

export interface CaravanMediaItem {
  id: string;
  url: string;
  media_type: 'image' | 'video' | 'tour360';
  order: number;
  uploaded_at?: string;
}

/**
 * Public caravan-class shape returned nested inside CaravanListSerializer /
 * CaravanDetailSerializer. Distinct from the availability-flow CaravanClass in
 * `types/booking.ts` (which carries day_rate/km_rate/available_count).
 */
export interface FleetCaravanClass {
  id: string;
  code: string;
  name: string;
  description: string;
  full_capacity: number;
  capacity_pets: number;
  human_capacity_decreased_by_each_pet: number;
  amenities: string[];
  is_pet_friendly: boolean;
  is_active: boolean;
  media: CaravanMediaItem[];
}

export interface FleetCaravanListItem {
  id: string;
  name: string;
  registration_no: string;
  year: number;
  caravan_class: FleetCaravanClass;
  home_hub_name: string;
  is_active: boolean;
  is_available: boolean;
  thumbnail: string | null;
}

export interface FleetCaravanDetail
  extends Omit<FleetCaravanListItem, 'home_hub_name' | 'thumbnail'> {
  home_hub: { id: string; name: string; city?: string };
  extra_amenities: string[];
  all_amenities: string[];
  media: CaravanMediaItem[];
  created_at: string;
  updated_at: string;
}

export interface FleetCaravanPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: FleetCaravanListItem[];
}

/** Derived view-model for /fleet index cards. */
export interface FleetClassSummary {
  klass: FleetCaravanClass;
  unitCount: number;
  /** Best image: first class media of type=image, falling back to a unit thumbnail. */
  coverImage: string | null;
  /** Up to 4 unit thumbnails for the detail page hero rail. */
  unitThumbnails: string[];
  /** Units belonging to this class (used by /fleet/[code]). */
  units: FleetCaravanListItem[];
}
