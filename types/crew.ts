import type { AdminBookingDetail, AdminRosterBooking, AdminStaffCalendarResource } from '@/types/admin';
import type { BookingTripCore, BookingTripEvent } from '@/types/bookingDetail';

export type CrewRosterBooking = AdminRosterBooking;

export type CrewCalendarResource = AdminStaffCalendarResource;

export type CrewBookingDetail = AdminBookingDetail;

export type CrewTripStatus = 'pending' | 'active' | 'eot_pending' | 'completed' | string;

export type CrewTrip = BookingTripCore;

export type CrewTripEvent = BookingTripEvent;

export type CrewTripStartPayload = {
  odometer_start: number;
};

export type CrewTripEndPayload = {
  odometer_end: number;
  ac_hours?: number;
  gen_hours?: number;
  toll_charge?: number;
  parking_charge?: number;
  damage_charge?: number;
  other_charge?: number;
  other_charge_note?: string;
  driver_notes?: string;
};

export type CrewTripEventType =
  | 'arrived_at_pickup'
  | 'passenger_pickup'
  | 'passenger_drop'
  | 'refueling'
  | 'rest_stop'
  | 'breakdown'
  | 'custom';

export type CrewTripEventWritePayload = {
  event_type: CrewTripEventType;
  occurred_at: string;
  notes?: string;
  images?: string[];
  bill_url?: string;
};

export type CrewExpenseType =
  | 'ac_hours'
  | 'gen_hours'
  | 'parking_charge'
  | 'damage_charge'
  | 'toll_charge'
  | 'other_charge';

export type CrewTripExpenseItem = {
  id: string;
  expense_type: CrewExpenseType;
  value: string;
  description: string;
};

export type CrewTripExpenseLog = {
  id: string;
  occurred_at: string;
  lat: string | null;
  lng: string | null;
  notes: string;
  recorded_by_name: string;
  images: string[];
  items: CrewTripExpenseItem[];
  created_at: string;
};

export type CrewTripExpenseWriteItem = {
  expense_type: CrewExpenseType;
  value: number;
  description?: string;
};

export type CrewTripExpenseWritePayload = {
  occurred_at: string;
  lat?: number | null;
  lng?: number | null;
  notes?: string;
  images?: string[];
  items: CrewTripExpenseWriteItem[];
};

export type CrewTripEOTSummary = {
  ac_hours: string;
  gen_hours: string;
  parking_charge: string;
  damage_charge: string;
  toll_charge: string;
  other_charge: string;
};
