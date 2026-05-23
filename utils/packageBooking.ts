import type { CaravanClass } from '@/types/booking';
import type { TravelPackage } from '@/types/package';

/** Minimal caravan row for UI / cart when only package metadata is known. */
export function minimalCaravanClassFromPackage(pkg: TravelPackage): CaravanClass {
  return {
    id: pkg.caravan_class,
    name: `Class ${pkg.caravan_class_code}`,
    description: pkg.description || '',
    full_capacity: 6,
    capacity_pets: 0,
    is_pet_friendly: true,
    amenities: [],
    day_rate: '0',
    km_rate: '0',
    deposit_amount: '0',
    available_count: 0,
  };
}
