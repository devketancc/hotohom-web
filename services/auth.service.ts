import apiClient from './apiClient';
import { ApiResponse } from '@/types/api';

export const authService = {
  async login(phone: string, otp: string): Promise<ApiResponse<{ token: string; user: unknown }>> {
    const { data } = await apiClient.post('/auth/login', { phone, otp });
    return data;
  },

  async verify(token: string): Promise<ApiResponse<{ user: unknown }>> {
    const { data } = await apiClient.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
};
