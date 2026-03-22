import apiClient from './apiClient';
import { ApiResponse } from '@/types/api';
import { BookingData } from '@/types/booking';

export const bookingService = {
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
