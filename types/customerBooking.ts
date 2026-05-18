/** API shapes for customer booking list/detail (distinct from wizard `BookingData`). */

import type {
  BookingAssignment,
  BookingDetailExtensions,
  BookingItem,
  BookingPricingBreakdown,
  BookingPricingSnapshot,
  BookingTripCore,
  BookingTripEvent,
} from '@/types/bookingDetail';

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

export type CustomerBookingTripEvent = BookingTripEvent;
export type CustomerBookingTrip = BookingTripCore & { status: TripStatus };
export type CustomerBookingPricingSnapshot = BookingPricingSnapshot;
export type CustomerBookingAssignment = BookingAssignment;
export type CustomerBookingItem = BookingItem;
export type CustomerBookingPricingBreakdown = BookingPricingBreakdown;

export interface CustomerBookingListItem extends BookingDetailExtensions {
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
  trip: CustomerBookingTrip | null;
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
