import apiClient from './apiClient';
import { ApiResponse } from '@/types/api';
import type { CustomerBookingDetail, PaginatedBookings } from '@/types/customerBooking';
import { BookingData, AvailabilityData } from '@/types/booking';

function normalizeCustomerBooking(raw: unknown): CustomerBookingDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  const assignmentRaw = r.assignment;
  const assignment =
    assignmentRaw && typeof assignmentRaw === 'object'
      ? {
          driver_id: assignmentRaw && (assignmentRaw as Record<string, unknown>).driver_id != null
            ? String((assignmentRaw as Record<string, unknown>).driver_id)
            : null,
          driver_name: assignmentRaw && (assignmentRaw as Record<string, unknown>).driver_name != null
            ? String((assignmentRaw as Record<string, unknown>).driver_name)
            : null,
          driver_phone: assignmentRaw && (assignmentRaw as Record<string, unknown>).driver_phone != null
            ? String((assignmentRaw as Record<string, unknown>).driver_phone)
            : null,
          helper_id: assignmentRaw && (assignmentRaw as Record<string, unknown>).helper_id != null
            ? String((assignmentRaw as Record<string, unknown>).helper_id)
            : null,
          helper_name: assignmentRaw && (assignmentRaw as Record<string, unknown>).helper_name != null
            ? String((assignmentRaw as Record<string, unknown>).helper_name)
            : null,
          helper_phone: assignmentRaw && (assignmentRaw as Record<string, unknown>).helper_phone != null
            ? String((assignmentRaw as Record<string, unknown>).helper_phone)
            : null,
        }
      : null;
  const driverName = r.driver_name != null ? String(r.driver_name) : '';
  return {
    ...(r as CustomerBookingDetail),
    assignment:
      assignment ??
      (driverName
        ? {
            driver_id: r.driver != null ? String(r.driver) : null,
            driver_name: driverName,
            driver_phone: null,
            helper_id: null,
            helper_name: null,
            helper_phone: null,
          }
        : null),
    driver_name: driverName || assignment?.driver_name || undefined,
  };
}

export const bookingService = {
  async getAvailableCaravans(params: { start: string; end: string; hub: string }): Promise<ApiResponse<AvailabilityData>> {
    const { data } = await apiClient.get('/caravans/availability/', { params });
    return data;
  },

  async getCaravans(query?: Record<string, unknown>): Promise<ApiResponse<unknown[]>> {
    const { data } = await apiClient.get('/caravans', { params: query });
    return data;
  },

  async createBooking(bookingPayload: Partial<BookingData>): Promise<ApiResponse<{ bookingId: string }>> {
    const { data } = await apiClient.post('/bookings', bookingPayload);
    return data;
  },

  async getBooking(id: string): Promise<ApiResponse<CustomerBookingDetail>> {
    const { data } = await apiClient.get(`/bookings/${id}/`);
    if (data?.success) {
      const normalized = normalizeCustomerBooking(data.data);
      if (normalized) data.data = normalized;
    }
    return data;
  },

  async listBookings(params?: { page?: number }): Promise<ApiResponse<PaginatedBookings>> {
    const { data } = await apiClient.get('/bookings/', { params });
    if (data?.success && data.data?.results && Array.isArray(data.data.results)) {
      data.data.results = data.data.results
        .map((row: unknown) => normalizeCustomerBooking(row))
        .filter((row): row is CustomerBookingDetail => row !== null);
    }
    return data;
  },
};
