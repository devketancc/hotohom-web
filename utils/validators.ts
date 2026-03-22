// utils/validators.ts
import { Passenger } from '@/types/booking';
import { CONSTANTS } from '@/config/constants';

export function validatePassengers(passengers: Passenger[]): string | null {
  if (passengers.length === 0) {
    return 'At least one passenger is required.';
  }
  if (passengers.length > CONSTANTS.MAX_PASSENGERS) {
    return `Maximum ${CONSTANTS.MAX_PASSENGERS} passengers allowed.`;
  }
  
  for (const p of passengers) {
    if (!p.firstName || !p.lastName) return 'All passengers must have a requested name.';
    if (!p.age || p.age <= 0) return 'Valid age is required for all passengers.';
  }

  return null;
}
