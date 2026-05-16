import type {
  AdminBookingDetail,
  AdminRosterBooking,
  AdminStaffCalendarResource,
} from '@/types/admin';

export type CrewRosterBooking = AdminRosterBooking;

export type CrewCalendarResource = AdminStaffCalendarResource;

/** Field-ops booking detail from GET /crew/bookings/{id}/ (pricing omitted on BE). */
export type CrewBookingDetail = AdminBookingDetail;

export type CrewRosterDataSource = 'roster' | 'calendar';
