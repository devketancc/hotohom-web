import type { ApiResponse } from '@/types/api';

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
