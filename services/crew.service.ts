import apiClient from '@/services/apiClient';
import { normalizeBookingDetailRaw, normalizeBookingTrip, normalizeBookingTripEvent } from '@/lib/normalizeBookingDetail';
import { normalizeCrewEOTSummary, normalizeCrewExpenseLog } from '@/lib/normalizeCrewExpenses';
import { normalizeRosterBooking } from '@/lib/normalizeRoster';
import { normalizeStaffCalendarResource } from '@/lib/normalizeStaffCalendar';
import type { ApiResponse } from '@/types/api';
import type {
  CrewBookingDetail,
  CrewCalendarResource,
  CrewRosterBooking,
  CrewTrip,
  CrewTripEndPayload,
  CrewTripEOTSummary,
  CrewTripEvent,
  CrewTripEventWritePayload,
  CrewTripExpenseLog,
  CrewTripExpenseWritePayload,
  CrewTripStartPayload,
} from '@/types/crew';
import type { AdminBookingStop } from '@/types/admin';

export const crewQueryKeys = {
  calendar: (params: { start: string; end: string }) =>
    ['crew', 'calendar', params.start, params.end] as const,
  roster: (params: { date?: string; start?: string; end?: string }) =>
    ['crew', 'roster', params.date ?? '', params.start ?? '', params.end ?? ''] as const,
  bookingDetail: (id: string) => ['crew', 'bookings', 'detail', id] as const,
  trip: (tripId: string) => ['crew', 'trips', 'detail', tripId] as const,
  tripEvents: (tripId: string) => ['crew', 'trips', 'events', tripId] as const,
  tripExpenses: (tripId: string) => ['crew', 'trips', 'expenses', tripId] as const,
  tripEotSummary: (tripId: string) => ['crew', 'trips', 'eot-summary', tripId] as const,
};

export type CrewCalendarQueryParams = {
  start: string;
  end: string;
};

export type CrewRosterQueryParams = {
  date?: string;
  start?: string;
  end?: string;
};

export async function getCrewCalendar(params: CrewCalendarQueryParams): Promise<CrewCalendarResource | null> {
  const { data } = await apiClient.get<ApiResponse<unknown>>('/crew/calendar/', {
    params: { start: params.start, end: params.end },
  });
  const inner = data?.data;
  if (!inner || typeof inner !== 'object') return null;
  return normalizeStaffCalendarResource(inner);
}

export async function listCrewRoster(params: CrewRosterQueryParams): Promise<CrewRosterBooking[]> {
  const query: Record<string, string> = {};
  if (params.date) {
    query.date = params.date;
  } else {
    if (params.start) query.start = params.start;
    if (params.end) query.end = params.end;
  }

  const { data } = await apiClient.get<ApiResponse<unknown>>('/crew/roster/', { params: query });
  const inner = data?.data;
  if (!Array.isArray(inner)) return [];
  return inner.map(normalizeRosterBooking).filter((row): row is CrewRosterBooking => row !== null);
}

export async function getCrewBookingById(id: string): Promise<CrewBookingDetail> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/crew/bookings/${encodeURIComponent(id)}/`);
  const row = normalizeBookingDetailRaw(data?.data);
  if (!row) throw new Error('Failed to load booking details');
  return {
    ...row,
    stops: row.stops as AdminBookingStop[],
  };
}

export async function getCrewTrip(tripId: string): Promise<CrewTrip> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/crew/trips/${encodeURIComponent(tripId)}/`);
  const row = normalizeBookingTrip(data?.data);
  if (!row) throw new Error('Failed to load trip');
  return row;
}

export async function startCrewTrip(tripId: string, body: CrewTripStartPayload): Promise<CrewTrip> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/crew/trips/${encodeURIComponent(tripId)}/start/`,
    body
  );
  const row = normalizeBookingTrip(data?.data);
  if (!row) throw new Error('Failed to start trip');
  return row;
}

export async function endCrewTrip(tripId: string, body: CrewTripEndPayload): Promise<CrewTrip> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/crew/trips/${encodeURIComponent(tripId)}/end/`,
    body
  );
  const row = normalizeBookingTrip(data?.data);
  if (!row) throw new Error('Failed to submit end of trip');
  return row;
}

export async function listCrewTripEvents(tripId: string): Promise<CrewTripEvent[]> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(
    `/crew/trips/${encodeURIComponent(tripId)}/events/`
  );
  const inner = data?.data;
  if (!Array.isArray(inner)) return [];
  return inner.map(normalizeBookingTripEvent).filter((e): e is CrewTripEvent => e !== null);
}

export async function createCrewTripEvent(
  tripId: string,
  body: CrewTripEventWritePayload
): Promise<CrewTripEvent> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/crew/trips/${encodeURIComponent(tripId)}/events/`,
    body
  );
  const row = normalizeBookingTripEvent(data?.data);
  if (!row) throw new Error('Failed to log event');
  return row;
}

export async function listCrewTripExpenses(tripId: string): Promise<CrewTripExpenseLog[]> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(
    `/crew/trips/${encodeURIComponent(tripId)}/expenses/`
  );
  const inner = data?.data;
  if (!Array.isArray(inner)) return [];
  return inner.map(normalizeCrewExpenseLog).filter((log): log is CrewTripExpenseLog => log !== null);
}

export async function createCrewTripExpense(
  tripId: string,
  body: CrewTripExpenseWritePayload
): Promise<CrewTripExpenseLog> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/crew/trips/${encodeURIComponent(tripId)}/expenses/`,
    body
  );
  const row = normalizeCrewExpenseLog(data?.data);
  if (!row) throw new Error('Failed to log expense');
  return row;
}

export async function getCrewTripEOTSummary(tripId: string): Promise<CrewTripEOTSummary> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(
    `/crew/trips/${encodeURIComponent(tripId)}/eot-summary/`
  );
  const row = normalizeCrewEOTSummary(data?.data);
  if (!row) throw new Error('Failed to load EOT summary');
  return row;
}
