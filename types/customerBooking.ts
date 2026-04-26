/** API shapes for customer booking list/detail (distinct from wizard `BookingData`). */

export type BookingListStatus =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | string;

export type TripStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | string;

export interface CustomerBookingStop {
  id: string;
  order: number;
  stop_type: 'pickup' | 'waypoint' | 'dropoff' | string;
  location: string;
  location_name: string;
  estimated_arrival: string | null;
  notes: string;
}

export interface CustomerBookingTrip {
  id: string;
  status: TripStatus;
  odometer_start: number | null;
  odometer_end: number | null;
  actual_km: number | null;
  actual_start: string | null;
  actual_end: string | null;
  extra_km: number;
  extra_km_charge: string;
  ac_hours: string;
  ac_charge: string;
  gen_hours: string;
  gen_charge: string;
  late_hours: string;
  late_charge: string;
  parking_charge: string;
  toll_charge: string;
  damage_charge: string;
  other_charge: string;
  other_charge_note: string;
  total_extra_charge: string;
  eot_submitted_at: string | null;
  driver_notes: string;
  events: unknown[];
  updated_at: string;
}

export interface CustomerBookingPricingSnapshot {
  km_rate: number;
  day_rate: number;
  total_days: number;
  deposit_amount: number;
}

export interface CustomerBookingAssignment {
  driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  helper_id: string | null;
  helper_name: string | null;
  helper_phone: string | null;
}

export interface CustomerBookingListItem {
  id: string;
  source: string;
  booking_type: string;
  status: BookingListStatus;
  customer: string;
  customer_name: string;
  customer_phone: string;
  caravan: string;
  caravan_name: string;
  caravan_class: string;
  /** Legacy fields retained as optional for backward compatibility during rollout. */
  driver?: string | null;
  driver_name?: string;
  assignment: CustomerBookingAssignment | null;
  is_b2b: boolean;
  b2b_partner: string | null;
  package: string | null;
  start_datetime: string;
  end_datetime: string;
  total_days: number;
  num_humans: number;
  num_pets: number;
  is_one_way: boolean;
  pricing_mode: string;
  pricing_snapshot: CustomerBookingPricingSnapshot;
  pet_cleaning_charge: string;
  base_price: string;
  addons_price: string;
  coupon_discount: string;
  subtotal: string;
  razorpay_charges: string;
  grand_total: string;
  cancellation_reason: string;
  cancelled_at: string | null;
  notes: string;
  stops: CustomerBookingStop[];
  trip: CustomerBookingTrip;
  created_at: string;
  updated_at: string;
}

/** Single booking from GET /bookings/{id}/ (same shape as list rows). */
export type CustomerBookingDetail = CustomerBookingListItem;

export interface PaginatedBookings {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerBookingListItem[];
}
