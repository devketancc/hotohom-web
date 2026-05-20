import apiClient from '@/services/apiClient';
import { normalizeBookingDetailRaw } from '@/lib/normalizeBookingDetail';
import { normalizeRosterBooking } from '@/lib/normalizeRoster';
import { normalizeStaffCalendarResource } from '@/lib/normalizeStaffCalendar';
import type { ApiResponse } from '@/types/api';
import type { CrewBookingDetail, CrewCalendarResource, CrewRosterBooking } from '@/types/crew';
import type { AdminBookingStop } from '@/types/admin';

export const crewQueryKeys = {
  calendar: (params: { start: string; end: string }) =>
    ['crew', 'calendar', params.start, params.end] as const,
  roster: (params: { date?: string; start?: string; end?: string }) =>
    ['crew', 'roster', params.date ?? '', params.start ?? '', params.end ?? ''] as const,
  bookingDetail: (id: string) => ['crew', 'bookings', 'detail', id] as const,
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

/** Phase 2: trip lifecycle APIs at `/crew/trips/` — no UI in crew portal v1. */
export type CrewTripApiSurface = {
  list: '/crew/trips/';
  detail: '/crew/trips/{id}/';
  start: '/crew/trips/{id}/start/';
  end: '/crew/trips/{id}/end/';
  events: '/crew/trips/{id}/events/';
};
