import type { ApiResponse } from '@/types/api';
import type {
  BookingAssignment,
  BookingDetailExtensions,
  BookingItem,
  BookingPricingBreakdown,
  BookingPricingSnapshot,
  BookingTripCore,
  BookingTripEvent,
} from '@/types/bookingDetail';

export type AdminPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type AdminPaginatedResponse<T> = ApiResponse<AdminPaginated<T>>;

export interface AdminHub {
  id: string;
  name: string;
  city: string;
  state: string;
  formatted_address: string;
  is_active: boolean;
  google_maps_url: string | null;
  coordinates: { lat: number; lng: number };
  location_type: string;
}

export interface AdminCaravanClassMedia {
  id: string;
  url: string;
  media_type: string;
  order: number;
}

export interface AdminCaravanClass {
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
  media: AdminCaravanClassMedia[];
}

/** Individual caravan (fleet unit) from `GET /admin/caravans/`. */
export interface AdminFleetCaravan {
  id: string;
  name: string;
  registration_no: string;
  year: number;
  home_hub_name: string;
  thumbnail: string | null;
  is_active: boolean;
  is_available: boolean;
  caravan_class: AdminCaravanClass;
}

/** Home hub object on caravan detail (`GET /admin/caravans/:id/`). */
export interface AdminFleetCaravanHomeHub {
  id: string;
  name: string;
  city: string;
}

/** Full caravan from `GET /admin/caravans/:id/`. */
export interface AdminFleetCaravanDetail {
  id: string;
  name: string;
  registration_no: string;
  year: number;
  caravan_class: AdminCaravanClass;
  home_hub: AdminFleetCaravanHomeHub | null;
  extra_amenities: string[];
  all_amenities: string[];
  media: AdminCaravanClassMedia[];
  is_active: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export type AdminCalendarEventReason = 'booking' | 'maintenance' | 'private_event' | 'breakdown' | 'other';

export interface AdminCalendarBookingPartyMember {
  id: string;
  name: string;
  phone: string;
}

export interface AdminCalendarBookingInfo {
  id: string;
  customer_id: string;
  customer_name: string;
  status: string;
  driver: AdminCalendarBookingPartyMember | null;
  helper: AdminCalendarBookingPartyMember | null;
}

export interface AdminCaravanCalendarEvent {
  blockout_id: string;
  start: string;
  end: string;
  reason: AdminCalendarEventReason;
  notes: string;
  booking_info?: AdminCalendarBookingInfo;
}

export interface AdminCaravanCalendarResource {
  caravan_id: string;
  registration: string;
  class_code: string;
  hub: string | null;
  events: AdminCaravanCalendarEvent[];
}

export type AdminCaravanManualBlockoutReason = 'maintenance' | 'private_event' | 'breakdown' | 'other';

export interface AdminCaravanBlockout {
  id: string;
  start_date: string;
  end_date: string;
  reason: AdminCalendarEventReason;
  notes: string;
  created_at: string;
}

export type AdminStaffCalendarReason = 'booking' | 'leave' | 'training' | 'other';

export interface AdminStaffCalendarEvent {
  blockout_id: string;
  start: string;
  end: string;
  reason: AdminStaffCalendarReason;
  notes: string;
  booking_info?: AdminCalendarBookingInfo;
}

export interface AdminStaffCalendarResource {
  staff_id: string;
  name: string;
  phone: string;
  role: AdminStaffRole;
  hub: string | null;
  events: AdminStaffCalendarEvent[];
}

export type AdminStaffManualBlockoutReason = 'leave' | 'training' | 'other';

export interface AdminStaffBlockout {
  id: string;
  start_date: string;
  end_date: string;
  reason: AdminStaffCalendarReason;
  notes: string;
  is_active: boolean;
  created_at: string;
}

export type AdminStaffRole = 'driver' | 'helper';

export interface AdminStaffUser {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  role: AdminStaffRole;
  is_active: boolean;
}

export interface AdminStaffProfile {
  id: string;
  user: AdminStaffUser;
  hub: string;
  hub_name: string;
  role: AdminStaffRole;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AdminCreateStaffPayload {
  phone: string;
  first_name: string;
  last_name?: string;
  email?: string;
  hub: string;
  role: AdminStaffRole;
  notes?: string;
}

export interface AdminUpdateStaffPayload {
  hub?: string;
  role?: AdminStaffRole;
  is_active?: boolean;
  notes?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

/** `GET /admin/calendar/roster/` — party on assignment (id from backend when present). */
export interface AdminRosterPartyMember {
  id: string;
  name: string;
  phone: string;
}

export interface AdminRosterCaravan {
  id: string;
  registration: string;
  class_code: string;
  hub: string | null;
}

/** Normalized row from admin calendar roster API. */
export interface AdminRosterBooking {
  booking_id: string;
  customer_name: string;
  start: string;
  end: string;
  status: string;
  caravan: AdminRosterCaravan;
  driver: AdminRosterPartyMember | null;
  helper: AdminRosterPartyMember | null;
  open_alerts: string[];
}

export interface AdminBookingStop {
  id: string;
  order: number;
  stop_type: string;
  location: string;
  location_name: string;
  estimated_arrival: string | null;
  notes: string;
}

export type AdminBookingTripEvent = BookingTripEvent;
export type AdminBookingTrip = BookingTripCore;
export type AdminBookingPricingSnapshot = BookingPricingSnapshot;
export type AdminBookingAssignment = BookingAssignment;
export type AdminBookingItem = BookingItem;
export type AdminBookingPricingBreakdown = BookingPricingBreakdown;

export interface AdminBookingDetail extends BookingDetailExtensions {
  id: string;
  source: string;
  booking_type: string;
  status: string;
  customer: string;
  customer_name: string;
  customer_phone: string;
  caravan: string;
  caravan_name: string;
  caravan_class: string;
  /** Legacy fields retained as optional for backward compatibility during rollout. */
  driver?: string | null;
  driver_name?: string;
  assignment: AdminBookingAssignment | null;
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
  pricing_snapshot: AdminBookingPricingSnapshot;
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
  stops: AdminBookingStop[];
  trip: AdminBookingTrip | null;
  created_at: string;
  updated_at: string;
}

/** `POST /admin/bookings/{id}/assign-staff/` — ids are StaffProfile ids. */
export interface AdminAssignStaffPayload {
  driver_id?: string;
  helper_id?: string;
  override?: boolean;
}

/** One soft conflict from a 409 ASSIGNMENT_CONFLICTS response. */
export interface AssignmentConflictIssue {
  code: string;
  message: string;
}

export type AdminSettlementVerdict = 'balance_due' | 'refund' | 'settled';

export interface AdminSettlementRefundBreakdown {
  deposit_refund: string;
  advance_refund: string;
  total_refund: string;
}

/** `GET /admin/trips/{id}/settlement/` — flat shape; branch fields are null when not applicable. */
export interface AdminTripSettlement {
  trip_id: string;
  booking_id: string;
  pricing_mode: string;
  buffered_km: number;
  actual_km: number;
  km_rate: string;
  km_credit: string;
  eot_extras: string;
  net_charges: string;
  deposit_held: string;
  deposit_id: string | null;
  final_net: string;
  settlement: AdminSettlementVerdict;
  balance_due: string | null;
  refund_breakdown: AdminSettlementRefundBreakdown | null;
  advance_payment_id: string | null;
  next_step: string | null;
  next_steps: string[];
}

/** `POST /admin/trips/{id}/balance-link/` — normalized union of the link / no-link-needed shapes. */
export interface AdminBalanceLinkResult {
  linkNeeded: boolean;
  paymentId: string | null;
  paymentUrl: string | null;
  razorpayPaymentLinkId: string | null;
  amount: string | null;
  alreadyExists: boolean;
  message: string | null;
}

export interface AdminRefundPayload {
  refund_amount: string;
  refund_reason: string;
}
