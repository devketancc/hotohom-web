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

export type CrewTripEventType = 'refueling' | 'rest_stop' | 'breakdown' | 'custom';

export type CrewTripEventWritePayload = {
  event_type: CrewTripEventType;
  occurred_at: string;
  notes?: string;
};
