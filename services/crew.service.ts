import { isAxiosError } from 'axios';
import apiClient from '@/services/apiClient';
import { calendarEventsToRosterBookings } from '@/lib/crewRosterFromCalendar';
import type { ApiResponse } from '@/types/api';
import type {
  AdminBookingDetail,
  AdminRosterBooking,
  AdminStaffCalendarResource,
} from '@/types/admin';
import type { CrewRosterDataSource } from '@/types/crew';

export const crewQueryKeys = {
  roster: (params: { date?: string; start?: string; end?: string }) =>
    ['crew', 'roster', params.date ?? '', params.start ?? '', params.end ?? ''] as const,
  calendar: (params: { start: string; end: string }) => ['crew', 'calendar', params.start, params.end] as const,
  bookingDetail: (id: string) => ['crew', 'bookings', 'detail', id] as const,
};

export type CrewCalendarRosterQueryParams = {
  date?: string;
  start?: string;
  end?: string;
};

/** True when the crew API route is missing (not deployed) or not found. */
export function isCrewApiUnavailable(err: unknown): boolean {
  if (!isAxiosError(err)) return false;
  const status = err.response?.status;
  if (status === 404 || status === 501) return true;
  const code = (err.response?.data as { error?: { code?: string } } | undefined)?.error?.code;
  return code === 'NOT_FOUND' || code === 'ENDPOINT_NOT_FOUND';
}

export const CREW_API_UNAVAILABLE_MESSAGE =
  'Crew schedule is not available yet. The server needs the /api/v1/crew/ endpoints—contact your administrator.';

function crewApiUnavailableError(): Error {
  const err = new Error(CREW_API_UNAVAILABLE_MESSAGE) as Error & { code?: string };
  err.code = 'CREW_API_UNAVAILABLE';
  return err;
}

function normalizeRosterPartyMember(raw: unknown): AdminRosterBooking['driver'] {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const name = r.name != null ? String(r.name) : '';
  if (!name) return null;
  return {
    id: r.id != null ? String(r.id) : '',
    name,
    phone: r.phone != null ? String(r.phone) : '',
  };
}

function normalizeRosterCaravan(raw: unknown): AdminRosterBooking['caravan'] | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  const registration = r.registration != null ? String(r.registration) : '—';
  if (!id) return null;
  return {
    id,
    registration: registration || '—',
    class_code: r.class_code != null ? String(r.class_code) : '',
    hub: r.hub != null && typeof r.hub === 'string' ? r.hub : null,
  };
}

function normalizeCrewRosterBooking(raw: unknown): AdminRosterBooking | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const booking_id = r.booking_id != null ? String(r.booking_id) : '';
  const start = r.start != null ? String(r.start) : '';
  const end = r.end != null ? String(r.end) : '';
  if (!booking_id || !start || !end) return null;

  let caravan = normalizeRosterCaravan(r.caravan);
  if (!caravan) {
    caravan = {
      id: booking_id,
      registration: '—',
      class_code: '',
      hub: null,
    };
  }

  const alertsRaw = r.open_alerts;
  const open_alerts = Array.isArray(alertsRaw)
    ? alertsRaw.filter((a): a is string => typeof a === 'string')
    : [];

  return {
    booking_id,
    customer_name: r.customer_name != null ? String(r.customer_name) : '',
    start,
    end,
    status: r.status != null ? String(r.status) : '',
    caravan,
    driver: normalizeRosterPartyMember(r.driver),
    helper: normalizeRosterPartyMember(r.helper),
    open_alerts,
  };
}

function normalizeStaffCalendarReason(raw: unknown): AdminStaffCalendarResource['events'][0]['reason'] {
  const v = raw != null ? String(raw) : '';
  if (v === 'booking' || v === 'leave' || v === 'training') return v;
  return 'other';
}

function normalizeCalendarPartyMember(raw: unknown) {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  return {
    id,
    name: r.name != null ? String(r.name) : '',
    phone: r.phone != null ? String(r.phone) : '',
  };
}

function normalizeCalendarBookingInfo(raw: unknown) {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  return {
    id,
    customer_id: r.customer_id != null ? String(r.customer_id) : '',
    customer_name: r.customer_name != null ? String(r.customer_name) : '',
    status: r.status != null ? String(r.status) : '',
    driver: normalizeCalendarPartyMember(r.driver),
    helper: normalizeCalendarPartyMember(r.helper),
  };
}

function normalizeStaffCalendarEvent(raw: unknown): AdminStaffCalendarResource['events'][0] | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const blockout_id = r.blockout_id != null ? String(r.blockout_id) : '';
  const start = r.start != null ? String(r.start) : '';
  const end = r.end != null ? String(r.end) : '';
  if (!blockout_id || !start || !end) return null;
  const booking = normalizeCalendarBookingInfo(r.booking_info);
  return {
    blockout_id,
    start,
    end,
    reason: normalizeStaffCalendarReason(r.reason),
    notes: r.notes != null ? String(r.notes) : '',
    ...(booking ? { booking_info: booking } : {}),
  };
}

function normalizeCrewCalendarResource(raw: unknown): AdminStaffCalendarResource | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const staff_id = r.staff_id != null ? String(r.staff_id) : '';
  if (!staff_id) return null;
  const eventsRaw = Array.isArray(r.events) ? r.events : [];
  const events = eventsRaw
    .map(normalizeStaffCalendarEvent)
    .filter((e): e is AdminStaffCalendarResource['events'][0] => e !== null);
  const roleRaw = r.role != null ? String(r.role) : 'driver';
  return {
    staff_id,
    name: r.name != null ? String(r.name) : '',
    phone: r.phone != null ? String(r.phone) : '',
    role: roleRaw === 'helper' ? 'helper' : 'driver',
    hub: r.hub != null ? String(r.hub) : null,
    events,
  };
}

function normalizeCrewBookingDetail(raw: unknown): AdminBookingDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;

  const stopsRaw = Array.isArray(r.stops) ? r.stops : [];
  const stops = stopsRaw
    .map((s) => {
      if (!s || typeof s !== 'object') return null;
      const row = s as Record<string, unknown>;
      const sid = row.id != null ? String(row.id) : '';
      if (!sid) return null;
      return {
        id: sid,
        order: Number(row.order) || 0,
        stop_type: row.stop_type != null ? String(row.stop_type) : '',
        location: row.location != null ? String(row.location) : '',
        location_name: row.location_name != null ? String(row.location_name) : '',
        estimated_arrival: row.estimated_arrival != null ? String(row.estimated_arrival) : null,
        notes: row.notes != null ? String(row.notes) : '',
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const assignmentRaw = r.assignment;
  let assignment: AdminBookingDetail['assignment'] = null;
  if (assignmentRaw && typeof assignmentRaw === 'object') {
    const a = assignmentRaw as Record<string, unknown>;
    assignment = {
      driver_id: a.driver_id != null ? String(a.driver_id) : null,
      driver_name: a.driver_name != null ? String(a.driver_name) : null,
      driver_phone: a.driver_phone != null ? String(a.driver_phone) : null,
      helper_id: a.helper_id != null ? String(a.helper_id) : null,
      helper_name: a.helper_name != null ? String(a.helper_name) : null,
      helper_phone: a.helper_phone != null ? String(a.helper_phone) : null,
    };
  }

  const tripRaw = r.trip;
  let trip: AdminBookingDetail['trip'] = null;
  if (tripRaw && typeof tripRaw === 'object') {
    const t = tripRaw as Record<string, unknown>;
    const tid = t.id != null ? String(t.id) : '';
    if (tid) {
      trip = {
        id: tid,
        status: t.status != null ? String(t.status) : '',
        odometer_start: Number.isFinite(Number(t.odometer_start)) ? Number(t.odometer_start) : null,
        odometer_end: Number.isFinite(Number(t.odometer_end)) ? Number(t.odometer_end) : null,
        actual_km: Number.isFinite(Number(t.actual_km)) ? Number(t.actual_km) : null,
        actual_start: t.actual_start != null ? String(t.actual_start) : null,
        actual_end: t.actual_end != null ? String(t.actual_end) : null,
        extra_km: Number(t.extra_km) || 0,
        extra_km_charge: t.extra_km_charge != null ? String(t.extra_km_charge) : '0',
        ac_hours: t.ac_hours != null ? String(t.ac_hours) : '0',
        ac_charge: t.ac_charge != null ? String(t.ac_charge) : '0',
        gen_hours: t.gen_hours != null ? String(t.gen_hours) : '0',
        gen_charge: t.gen_charge != null ? String(t.gen_charge) : '0',
        late_hours: t.late_hours != null ? String(t.late_hours) : '0',
        late_charge: t.late_charge != null ? String(t.late_charge) : '0',
        parking_charge: t.parking_charge != null ? String(t.parking_charge) : '0',
        toll_charge: t.toll_charge != null ? String(t.toll_charge) : '0',
        damage_charge: t.damage_charge != null ? String(t.damage_charge) : '0',
        other_charge: t.other_charge != null ? String(t.other_charge) : '0',
        other_charge_note: t.other_charge_note != null ? String(t.other_charge_note) : '',
        total_extra_charge: t.total_extra_charge != null ? String(t.total_extra_charge) : '0',
        eot_submitted_at: t.eot_submitted_at != null ? String(t.eot_submitted_at) : null,
        driver_notes: t.driver_notes != null ? String(t.driver_notes) : '',
        events: [],
        updated_at: t.updated_at != null ? String(t.updated_at) : '',
      };
    }
  }

  return {
    id,
    source: r.source != null ? String(r.source) : '',
    booking_type: r.booking_type != null ? String(r.booking_type) : '',
    status: r.status != null ? String(r.status) : '',
    customer: r.customer != null ? String(r.customer) : '',
    customer_name: r.customer_name != null ? String(r.customer_name) : '',
    customer_phone: r.customer_phone != null ? String(r.customer_phone) : '',
    caravan: r.caravan != null ? String(r.caravan) : '',
    caravan_name: r.caravan_name != null ? String(r.caravan_name) : '',
    caravan_class: r.caravan_class != null ? String(r.caravan_class) : '',
    driver: r.driver != null ? String(r.driver) : null,
    driver_name: assignment?.driver_name ?? '',
    assignment,
    is_b2b: Boolean(r.is_b2b),
    b2b_partner: r.b2b_partner != null ? String(r.b2b_partner) : null,
    package: r.package != null ? String(r.package) : null,
    start_datetime: r.start_datetime != null ? String(r.start_datetime) : '',
    end_datetime: r.end_datetime != null ? String(r.end_datetime) : '',
    total_days: Number(r.total_days) || 0,
    num_humans: Number(r.num_humans) || 0,
    num_pets: Number(r.num_pets) || 0,
    is_one_way: Boolean(r.is_one_way),
    pricing_mode: r.pricing_mode != null ? String(r.pricing_mode) : '',
    pricing_snapshot: {
      km_rate: 0,
      day_rate: 0,
      total_days: Number(r.total_days) || 0,
      deposit_amount: 0,
    },
    pet_cleaning_charge: '0',
    base_price: '0',
    addons_price: '0',
    coupon_discount: '0',
    subtotal: '0',
    razorpay_charges: '0',
    grand_total: '0',
    cancellation_reason: r.cancellation_reason != null ? String(r.cancellation_reason) : '',
    cancelled_at: r.cancelled_at != null ? String(r.cancelled_at) : null,
    notes: r.notes != null ? String(r.notes) : '',
    stops,
    trip,
    created_at: r.created_at != null ? String(r.created_at) : '',
    updated_at: r.updated_at != null ? String(r.updated_at) : '',
  };
}

function rosterQueryToParams(params: CrewCalendarRosterQueryParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.date) {
    query.date = params.date;
  } else {
    if (params.start) query.start = params.start;
    if (params.end) query.end = params.end;
  }
  return query;
}

function rosterRangeFromParams(params: CrewCalendarRosterQueryParams): { start: string; end: string } {
  if (params.date) return { start: params.date, end: params.date };
  return {
    start: params.start ?? params.date ?? '',
    end: params.end ?? params.start ?? '',
  };
}

/** GET /crew/roster/ — may 404 until backend ships. */
export async function listCrewRoster(params: CrewCalendarRosterQueryParams): Promise<AdminRosterBooking[]> {
  const { data } = await apiClient.get<ApiResponse<unknown>>('/crew/roster/', {
    params: rosterQueryToParams(params),
  });
  const inner = data?.data;
  if (!Array.isArray(inner)) return [];
  return inner.map(normalizeCrewRosterBooking).filter((row): row is AdminRosterBooking => row !== null);
}

/** GET /crew/calendar/ */
export async function getCrewCalendar(params: {
  start: string;
  end: string;
}): Promise<AdminStaffCalendarResource | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<unknown>>('/crew/calendar/', {
      params: { start: params.start, end: params.end },
    });
    const inner = data?.data;
    if (Array.isArray(inner)) {
      const first = inner.map(normalizeCrewCalendarResource).find((r): r is AdminStaffCalendarResource => Boolean(r));
      return first ?? null;
    }
    return normalizeCrewCalendarResource(inner);
  } catch (err) {
    if (isCrewApiUnavailable(err)) throw crewApiUnavailableError();
    throw err;
  }
}

export type CrewRosterWithSource = {
  bookings: AdminRosterBooking[];
  dataSource: CrewRosterDataSource;
};

/** Prefer roster API; fall back to calendar booking events. */
export async function listCrewRosterWithFallback(
  params: CrewCalendarRosterQueryParams
): Promise<CrewRosterWithSource> {
  try {
    const bookings = await listCrewRoster(params);
    return { bookings, dataSource: 'roster' };
  } catch (err) {
    if (!isCrewApiUnavailable(err)) throw err;
  }

  const { start, end } = rosterRangeFromParams(params);
  if (!start || !end) return { bookings: [], dataSource: 'calendar' };

  try {
    const calendar = await getCrewCalendar({ start, end });
    const bookings = calendarEventsToRosterBookings(calendar?.events ?? []);
    return { bookings, dataSource: 'calendar' };
  } catch (err) {
    if (isCrewApiUnavailable(err)) throw crewApiUnavailableError();
    throw err;
  }
}

/** GET /crew/bookings/{id}/ */
export async function getCrewBookingById(id: string): Promise<AdminBookingDetail> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/crew/bookings/${encodeURIComponent(id)}/`);
  const row = normalizeCrewBookingDetail(data?.data);
  if (!row) throw new Error('Failed to load booking details');
  return row;
}
