import { normalizeBookingDetailRaw } from '@/lib/normalizeBookingDetail';
import { normalizeCrewExpenseLog } from '@/lib/normalizeCrewExpenses';
import apiClient from '@/services/apiClient';
import type { CrewTripEndPayload, CrewTripExpenseLog } from '@/types/crew';
import type { ApiResponse } from '@/types/api';
import type {
  AdminCreateStaffPayload,
  AdminCalendarBookingInfo,
  AdminCalendarBookingPartyMember,
  AdminCalendarEventReason,
  AdminCaravanCalendarEvent,
  AdminCaravanCalendarResource,
  AdminCaravanBlockout,
  AdminCaravanClass,
  AdminCaravanClassMedia,
  AdminCaravanManualBlockoutReason,
  AdminFleetCaravan,
  AdminFleetCaravanDetail,
  AdminFleetCaravanHomeHub,
  AdminHub,
  AdminPaginated,
  AdminStaffProfile,
  AdminStaffCalendarEvent,
  AdminStaffCalendarReason,
  AdminStaffCalendarResource,
  AdminStaffBlockout,
  AdminStaffManualBlockoutReason,
  AdminStaffRole,
  AdminRosterBooking,
  AdminBookingDetail,
  AdminBookingStop,
  AdminRosterCaravan,
  AdminRosterPartyMember,
  AdminUpdateStaffPayload,
} from '@/types/admin';

export const adminQueryKeys = {
  hubs: ['admin', 'hubs'] as const,
  caravanClasses: ['admin', 'caravan-classes'] as const,
  caravans: ['admin', 'caravans', 'fleet'] as const,
  staff: (params?: { role?: string; hub?: string }) => ['admin', 'staff', params?.role ?? '', params?.hub ?? ''] as const,
  staffDetail: (id: string) => ['admin', 'staff', 'detail', id] as const,
  caravanDetail: (id: string) => ['admin', 'caravans', 'detail', id] as const,
  caravanCalendar: (params: { caravanId: string; start: string; end: string; hub?: string }) =>
    ['admin', 'caravans', 'calendar', params.caravanId, params.start, params.end, params.hub ?? ''] as const,
  staffCalendar: (params: { staffId: string; start: string; end: string; role?: string; hub?: string }) =>
    ['admin', 'staff', 'calendar', params.staffId, params.start, params.end, params.role ?? '', params.hub ?? ''] as const,
  roster: (params: { date?: string; start?: string; end?: string; hub?: string; hasAlerts?: boolean }) =>
    ['admin', 'calendar', 'roster', params.date ?? '', params.start ?? '', params.end ?? '', params.hub ?? '', params.hasAlerts ?? false] as const,
  bookingDetail: (id: string) => ['admin', 'bookings', 'detail', id] as const,
  tripExpenses: (tripId: string) => ['admin', 'trips', tripId, 'expenses'] as const,
};

function readCoordinates(raw: Record<string, unknown>): { lat: number; lng: number } | null {
  const coords = raw.coordinates;
  if (coords && typeof coords === 'object' && !Array.isArray(coords)) {
    const c = coords as Record<string, unknown>;
    const lat = Number(c.lat);
    const lng = Number(c.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  const lat = Number(raw.lat);
  const lng = Number(raw.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

function normalizeStaffRole(raw: unknown): AdminStaffRole {
  return raw === 'helper' ? 'helper' : 'driver';
}

function normalizeAdminStaffProfile(raw: unknown): AdminStaffProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;

  const userRaw = r.user;
  if (!userRaw || typeof userRaw !== 'object') return null;
  const u = userRaw as Record<string, unknown>;
  const userId = u.id != null ? String(u.id) : '';
  if (!userId) return null;

  return {
    id,
    user: {
      id: userId,
      name: u.name != null ? String(u.name) : '',
      first_name: u.first_name != null ? String(u.first_name) : '',
      last_name: u.last_name != null ? String(u.last_name) : '',
      phone: u.phone != null ? String(u.phone) : '',
      email: u.email != null ? String(u.email) : '',
      role: normalizeStaffRole(u.role),
      is_active: Boolean(u.is_active),
    },
    hub: r.hub != null ? String(r.hub) : '',
    hub_name: r.hub_name != null ? String(r.hub_name) : '',
    role: normalizeStaffRole(r.role),
    is_active: Boolean(r.is_active),
    notes: r.notes != null ? String(r.notes) : '',
    created_at: r.created_at != null ? String(r.created_at) : '',
    updated_at: r.updated_at != null ? String(r.updated_at) : '',
  };
}

function normalizeAdminHub(raw: unknown): AdminHub | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  const coords = readCoordinates(r);
  if (!coords) return null;

  return {
    id,
    name: r.name != null ? String(r.name) : '',
    city: r.city != null ? String(r.city) : '',
    state: r.state != null ? String(r.state) : '',
    formatted_address:
      r.formatted_address != null ? String(r.formatted_address) : String(r.formattedAddress ?? ''),
    is_active: Boolean(r.is_active),
    google_maps_url: r.google_maps_url != null ? String(r.google_maps_url) : null,
    coordinates: coords,
    location_type: r.location_type != null ? String(r.location_type) : 'hub',
  };
}

function normalizeMedia(raw: unknown): AdminCaravanClassMedia | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  const id = m.id != null ? String(m.id) : '';
  const url = m.url != null ? String(m.url) : '';
  if (!id || !url) return null;
  return {
    id,
    url,
    media_type: m.media_type != null ? String(m.media_type) : 'image',
    order: Number(m.order) || 0,
  };
}

function normalizeAdminCaravanClass(raw: unknown): AdminCaravanClass | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;

  const amenitiesRaw = r.amenities;
  const amenities = Array.isArray(amenitiesRaw)
    ? amenitiesRaw.filter((a): a is string => typeof a === 'string')
    : [];

  const mediaRaw = r.media;
  const media = Array.isArray(mediaRaw)
    ? mediaRaw.map(normalizeMedia).filter((m): m is AdminCaravanClassMedia => m !== null)
    : [];

  return {
    id,
    code: r.code != null ? String(r.code) : '',
    name: r.name != null ? String(r.name) : '',
    description: r.description != null ? String(r.description) : '',
    full_capacity: Number(r.full_capacity) || 0,
    capacity_pets: Number(r.capacity_pets) || 0,
    human_capacity_decreased_by_each_pet: Number(r.human_capacity_decreased_by_each_pet) || 0,
    amenities,
    is_pet_friendly: Boolean(r.is_pet_friendly),
    is_active: Boolean(r.is_active),
    media,
  };
}

function unwrapResults<T>(data: ApiResponse<AdminPaginated<unknown>> | undefined, normalize: (row: unknown) => T | null): T[] {
  const inner = data?.data;
  const list = inner?.results;
  if (!Array.isArray(list)) return [];
  return list.map(normalize).filter((row): row is T => row !== null);
}

export async function listAdminHubs(): Promise<AdminHub[]> {
  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/locations/', {
    params: { type: 'hub' },
  });
  return unwrapResults(data, normalizeAdminHub);
}

export async function listAdminCaravanClasses(): Promise<AdminCaravanClass[]> {
  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/caravan-classes/');
  return unwrapResults(data, normalizeAdminCaravanClass);
}

function normalizeAdminFleetCaravan(raw: unknown): AdminFleetCaravan | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  const nested = r.caravan_class;
  const caravan_class = normalizeAdminCaravanClass(nested);
  if (!caravan_class) return null;

  return {
    id,
    name: r.name != null ? String(r.name) : '',
    registration_no: r.registration_no != null ? String(r.registration_no) : '',
    year: Number(r.year) || 0,
    home_hub_name: r.home_hub_name != null ? String(r.home_hub_name) : '',
    thumbnail: r.thumbnail != null && typeof r.thumbnail === 'string' ? r.thumbnail : null,
    is_active: Boolean(r.is_active),
    is_available: Boolean(r.is_available),
    caravan_class,
  };
}

export async function listAdminFleetCaravans(): Promise<AdminFleetCaravan[]> {
  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/caravans/');
  return unwrapResults(data, normalizeAdminFleetCaravan);
}

function normalizeFleetHomeHub(raw: unknown): AdminFleetCaravanHomeHub | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  return {
    id,
    name: r.name != null ? String(r.name) : '',
    city: r.city != null ? String(r.city) : '',
  };
}

function normalizeAdminFleetCaravanDetail(raw: unknown): AdminFleetCaravanDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  const caravan_class = normalizeAdminCaravanClass(r.caravan_class);
  if (!caravan_class) return null;

  const extraRaw = r.extra_amenities;
  const extra_amenities = Array.isArray(extraRaw)
    ? extraRaw.filter((a): a is string => typeof a === 'string')
    : [];

  const allRaw = r.all_amenities;
  const all_amenities = Array.isArray(allRaw)
    ? allRaw.filter((a): a is string => typeof a === 'string')
    : [];

  const mediaRaw = r.media;
  const media = Array.isArray(mediaRaw)
    ? mediaRaw.map(normalizeMedia).filter((m): m is AdminCaravanClassMedia => m !== null)
    : [];

  return {
    id,
    name: r.name != null ? String(r.name) : '',
    registration_no: r.registration_no != null ? String(r.registration_no) : '',
    year: Number(r.year) || 0,
    caravan_class,
    home_hub: normalizeFleetHomeHub(r.home_hub),
    extra_amenities,
    all_amenities,
    media,
    is_active: Boolean(r.is_active),
    is_available: Boolean(r.is_available),
    created_at: r.created_at != null ? String(r.created_at) : '',
    updated_at: r.updated_at != null ? String(r.updated_at) : '',
  };
}

export async function getAdminFleetCaravanById(id: string): Promise<AdminFleetCaravanDetail> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/admin/caravans/${encodeURIComponent(id)}/`);
  const inner = data?.data;
  const row = normalizeAdminFleetCaravanDetail(inner);
  if (!row) {
    throw new Error('Caravan not found or invalid response');
  }
  return row;
}

function normalizeCalendarEventReason(raw: unknown): AdminCalendarEventReason {
  const reason = typeof raw === 'string' ? raw.toLowerCase() : '';
  if (
    reason === 'booking' ||
    reason === 'maintenance' ||
    reason === 'private_event' ||
    reason === 'breakdown' ||
    reason === 'other'
  ) {
    return reason;
  }
  return 'other';
}

function normalizeStaffCalendarReason(raw: unknown): AdminStaffCalendarReason {
  const reason = typeof raw === 'string' ? raw.toLowerCase() : '';
  if (reason === 'booking' || reason === 'leave' || reason === 'training' || reason === 'other') {
    return reason;
  }
  return 'other';
}

function normalizeCalendarPartyMember(raw: unknown): AdminCalendarBookingPartyMember | null {
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

function normalizeCalendarBookingInfo(raw: unknown): AdminCalendarBookingInfo | null {
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

function normalizeCaravanCalendarEvent(raw: unknown): AdminCaravanCalendarEvent | null {
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
    reason: normalizeCalendarEventReason(r.reason),
    notes: r.notes != null ? String(r.notes) : '',
    ...(booking ? { booking_info: booking } : {}),
  };
}

function normalizeStaffCalendarEvent(raw: unknown): AdminStaffCalendarEvent | null {
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

function normalizeCaravanCalendarResource(raw: unknown): AdminCaravanCalendarResource | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const caravan_id = r.caravan_id != null ? String(r.caravan_id) : '';
  if (!caravan_id) return null;

  const eventsRaw = Array.isArray(r.events) ? r.events : [];
  const events = eventsRaw.map(normalizeCaravanCalendarEvent).filter((e): e is AdminCaravanCalendarEvent => e !== null);

  return {
    caravan_id,
    registration: r.registration != null ? String(r.registration) : '',
    class_code: r.class_code != null ? String(r.class_code) : '',
    hub: r.hub != null ? String(r.hub) : null,
    events,
  };
}

function normalizeStaffCalendarResource(raw: unknown): AdminStaffCalendarResource | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const staff_id = r.staff_id != null ? String(r.staff_id) : '';
  if (!staff_id) return null;

  const eventsRaw = Array.isArray(r.events) ? r.events : [];
  const events = eventsRaw.map(normalizeStaffCalendarEvent).filter((e): e is AdminStaffCalendarEvent => e !== null);

  return {
    staff_id,
    name: r.name != null ? String(r.name) : '',
    phone: r.phone != null ? String(r.phone) : '',
    role: normalizeStaffRole(r.role),
    hub: r.hub != null ? String(r.hub) : null,
    events,
  };
}

function normalizeStaffBlockout(raw: unknown): AdminStaffBlockout | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  const start_date = r.start_date != null ? String(r.start_date) : '';
  const end_date = r.end_date != null ? String(r.end_date) : '';
  if (!id || !start_date || !end_date) return null;
  return {
    id,
    start_date,
    end_date,
    reason: normalizeStaffCalendarReason(r.reason),
    notes: r.notes != null ? String(r.notes) : '',
    is_active: Boolean(r.is_active),
    created_at: r.created_at != null ? String(r.created_at) : '',
  };
}

function normalizeCaravanBlockout(raw: unknown): AdminCaravanBlockout | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  const start_date = r.start_date != null ? String(r.start_date) : '';
  const end_date = r.end_date != null ? String(r.end_date) : '';
  if (!id || !start_date || !end_date) return null;
  return {
    id,
    start_date,
    end_date,
    reason: normalizeCalendarEventReason(r.reason),
    notes: r.notes != null ? String(r.notes) : '',
    created_at: r.created_at != null ? String(r.created_at) : '',
  };
}

export async function getAdminCaravanCalendar(params: {
  start: string;
  end: string;
  caravanId: string;
  hub?: string;
}): Promise<AdminCaravanCalendarResource | null> {
  const { start, end, caravanId, hub } = params;
  const { data } = await apiClient.get<ApiResponse<unknown>>('/admin/calendar/caravans/', {
    params: {
      start,
      end,
      caravan_id: caravanId,
      ...(hub ? { hub } : {}),
    },
  });

  const inner = data?.data;
  if (!Array.isArray(inner)) return null;
  const resource = inner
    .map(normalizeCaravanCalendarResource)
    .find((row): row is AdminCaravanCalendarResource => Boolean(row));
  return resource ?? null;
}

export async function getAdminStaffCalendar(params: {
  start: string;
  end: string;
  staffId: string;
  role?: string;
  hub?: string;
}): Promise<AdminStaffCalendarResource | null> {
  const { start, end, staffId, role, hub } = params;
  const { data } = await apiClient.get<ApiResponse<unknown>>('/admin/calendar/staff/', {
    params: {
      start,
      end,
      staff_id: staffId,
      ...(role ? { role } : {}),
      ...(hub ? { hub } : {}),
    },
  });
  const inner = data?.data;
  if (!Array.isArray(inner)) return null;
  const resource = inner.map(normalizeStaffCalendarResource).find((row): row is AdminStaffCalendarResource => Boolean(row));
  return resource ?? null;
}

function normalizeRosterPartyMember(raw: unknown): AdminRosterPartyMember | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  const name = r.name != null ? String(r.name) : '';
  if (!name) return null;
  return {
    id,
    name,
    phone: r.phone != null ? String(r.phone) : '',
  };
}

function normalizeRosterCaravan(raw: unknown): AdminRosterCaravan | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  const registration = r.registration != null ? String(r.registration) : '';
  const class_code = r.class_code != null ? String(r.class_code) : '';
  if (!id || !registration) return null;
  return {
    id,
    registration,
    class_code,
    hub: r.hub != null && typeof r.hub === 'string' ? r.hub : null,
  };
}

function normalizeAdminRosterBooking(raw: unknown): AdminRosterBooking | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const booking_id = r.booking_id != null ? String(r.booking_id) : '';
  const customer_name = r.customer_name != null ? String(r.customer_name) : '';
  const start = r.start != null ? String(r.start) : '';
  const end = r.end != null ? String(r.end) : '';
  const status = r.status != null ? String(r.status) : '';
  const caravan = normalizeRosterCaravan(r.caravan);
  if (!booking_id || !start || !end || !caravan) return null;

  const alertsRaw = r.open_alerts;
  const open_alerts = Array.isArray(alertsRaw)
    ? alertsRaw.filter((a): a is string => typeof a === 'string')
    : [];

  return {
    booking_id,
    customer_name,
    start,
    end,
    status,
    caravan,
    driver: normalizeRosterPartyMember(r.driver),
    helper: normalizeRosterPartyMember(r.helper),
    open_alerts,
  };
}

function normalizeAdminBookingDetail(raw: unknown): AdminBookingDetail | null {
  const row = normalizeBookingDetailRaw(raw);
  if (!row) return null;
  return {
    ...row,
    stops: row.stops as AdminBookingStop[],
  };
}

export type AdminCalendarRosterQueryParams = {
  /** When set, API uses single-day mode (`date` only). */
  date?: string;
  /** Inclusive YYYY-MM-DD range start (omit when `date` is set). */
  start?: string;
  /** Inclusive YYYY-MM-DD range end (omit when `date` is set). */
  end?: string;
  hub?: string;
  hasAlerts?: boolean;
};

/**
 * GET /admin/calendar/roster/
 * Caller is responsible for validation (e.g. max 90-day span); backend still enforces.
 */
export async function listAdminCalendarRoster(params: AdminCalendarRosterQueryParams): Promise<AdminRosterBooking[]> {
  const query: Record<string, string> = {};
  if (params.date) {
    query.date = params.date;
  } else {
    if (params.start) query.start = params.start;
    if (params.end) query.end = params.end;
  }
  if (params.hub) query.hub = params.hub;
  if (params.hasAlerts) query.has_alerts = 'true';

  const { data } = await apiClient.get<ApiResponse<unknown>>('/admin/calendar/roster/', { params: query });
  const inner = data?.data;
  if (!Array.isArray(inner)) return [];
  return inner.map(normalizeAdminRosterBooking).filter((row): row is AdminRosterBooking => row !== null);
}

export async function getAdminBookingById(id: string): Promise<AdminBookingDetail> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/admin/bookings/${encodeURIComponent(id)}/`);
  const row = normalizeAdminBookingDetail(data?.data);
  if (!row) throw new Error('Failed to load booking details');
  return row;
}

export async function listAdminTripExpenses(tripId: string): Promise<CrewTripExpenseLog[]> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(
    `/admin/trips/${encodeURIComponent(tripId)}/expenses/`
  );
  const inner = data?.data;
  if (!Array.isArray(inner)) return [];
  return inner.map(normalizeCrewExpenseLog).filter((log): log is CrewTripExpenseLog => log !== null);
}

export async function submitAdminTripEnd(
  tripId: string,
  payload: CrewTripEndPayload
): Promise<void> {
  await apiClient.post(`/admin/trips/${encodeURIComponent(tripId)}/end/`, payload);
}

export async function approveAdminTripEOT(tripId: string): Promise<void> {
  await apiClient.post(`/admin/trips/${encodeURIComponent(tripId)}/approve-eot/`);
}

export async function listAdminStaff(params?: { role?: string; hub?: string }): Promise<AdminStaffProfile[]> {
  const { data } = await apiClient.get<ApiResponse<unknown>>('/admin/staff/', {
    params: {
      ...(params?.role ? { role: params.role } : {}),
      ...(params?.hub ? { hub: params.hub } : {}),
    },
  });
  const inner = data?.data;
  if (!Array.isArray(inner)) return [];
  return inner.map(normalizeAdminStaffProfile).filter((row): row is AdminStaffProfile => row !== null);
}

export async function getAdminStaffById(id: string): Promise<AdminStaffProfile> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/admin/staff/${encodeURIComponent(id)}/`);
  const row = normalizeAdminStaffProfile(data?.data);
  if (!row) throw new Error('Failed to load staff profile');
  return row;
}

export async function createAdminStaffBlockout(
  staffId: string,
  payload: { start_date: string; end_date: string; reason: AdminStaffManualBlockoutReason; notes?: string }
): Promise<AdminStaffBlockout> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(`/admin/staff/${encodeURIComponent(staffId)}/blockouts/`, payload);
  const row = normalizeStaffBlockout(data?.data);
  if (!row) throw new Error('Failed to create staff blockout');
  return row;
}

export async function deleteAdminStaffBlockout(staffId: string, blockoutId: string): Promise<void> {
  await apiClient.delete(`/admin/staff/${encodeURIComponent(staffId)}/blockouts/${encodeURIComponent(blockoutId)}/`);
}

export async function createAdminCaravanBlockout(
  caravanId: string,
  payload: { start_date: string; end_date: string; reason: AdminCaravanManualBlockoutReason; notes?: string }
): Promise<AdminCaravanBlockout> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(`/admin/caravans/${encodeURIComponent(caravanId)}/block/`, payload);
  const row = normalizeCaravanBlockout(data?.data ?? data);
  if (!row) throw new Error('Failed to create caravan blockout');
  return row;
}

export async function deleteAdminCaravanBlockout(caravanId: string, blockoutId: string): Promise<void> {
  await apiClient.delete(`/admin/caravans/${encodeURIComponent(caravanId)}/blockouts/${encodeURIComponent(blockoutId)}/`);
}

export async function createAdminStaff(payload: AdminCreateStaffPayload): Promise<AdminStaffProfile> {
  const { data } = await apiClient.post<ApiResponse<unknown>>('/admin/staff/', payload);
  const row = normalizeAdminStaffProfile(data?.data);
  if (!row) throw new Error('Failed to create staff');
  return row;
}

export async function updateAdminStaff(id: string, payload: AdminUpdateStaffPayload): Promise<AdminStaffProfile> {
  const { data } = await apiClient.patch<ApiResponse<unknown>>(`/admin/staff/${encodeURIComponent(id)}/`, payload);
  const row = normalizeAdminStaffProfile(data?.data);
  if (!row) throw new Error('Failed to update staff');
  return row;
}
