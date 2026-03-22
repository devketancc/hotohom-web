import apiClient from './apiClient';
import { ApiResponse } from '@/types/api';
import { BookingData, AvailabilityData } from '@/types/booking';

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

  async getBooking(id: string): Promise<ApiResponse<BookingData>> {
    const { data } = await apiClient.get(`/bookings/${id}`);
    return data;
  }
};
