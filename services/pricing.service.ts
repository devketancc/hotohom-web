import apiClient from './apiClient';
import { ApiResponse } from '@/types/api';
import { BookingData } from '@/types/booking';

export const pricingService = {
  async calculatePrice(payload: Partial<BookingData>): Promise<ApiResponse<BookingData['pricing']>> {
    const { data } = await apiClient.post('/pricing/calculate', payload);
    return data;
  }
};
