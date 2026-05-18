import { normalizeBookingDetailRaw } from '@/lib/normalizeBookingDetail';
import apiClient from './apiClient';
import { ApiResponse } from '@/types/api';
import type { CustomerBookingDetail, PaginatedBookings } from '@/types/customerBooking';
import { BookingData, AvailabilityData } from '@/types/booking';

function normalizeCustomerBooking(raw: unknown): CustomerBookingDetail | null {
  const row = normalizeBookingDetailRaw(raw);
  if (!row) return null;
  return row as CustomerBookingDetail;
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
        .filter((row: CustomerBookingDetail | null): row is CustomerBookingDetail => row !== null);
    }
    return data;
  },
};
