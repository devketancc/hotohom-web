import axios, { isAxiosError } from 'axios';
import { env } from '@/config/env';
import type { AuthUser } from '@/store/authStore';

function toRequestError(e: unknown): Error {
  if (isAxiosError(e)) {
    const body = e.response?.data as { message?: string; detail?: string } | undefined;
    return new Error(body?.message || body?.detail || e.message || 'Request failed');
  }
  return e instanceof Error ? e : new Error('Request failed');
}

const baseURL = env.API_BASE_URL
  ? `${env.API_BASE_URL.replace(/\/$/, '')}/api/v1`
  : '/api/v1';

/** Auth endpoints only — no Bearer injection; avoids cycles with apiClient refresh logic. */
const publicAuthClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export type VerifyOtpResult = {
  access: string;
  refresh: string;
  user: AuthUser;
  is_new_user: boolean;
};

export const authService = {
  async sendOtp(phone: string): Promise<boolean> {
    try {
      const { data } = await publicAuthClient.post<{ success: boolean; data?: { message?: string } }>(
        '/auth/otp/send/',
        { phone }
      );
      return data.success === true;
    } catch (e) {
      throw toRequestError(e);
    }
  },

  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResult> {
    try {
      const { data } = await publicAuthClient.post<{
        success: boolean;
        data?: VerifyOtpResult;
        message?: string;
      }>('/auth/otp/verify/', { phone, otp });

      if (!data.success || !data.data) {
        throw new Error(data.message || 'Invalid OTP. Please try again.');
      }

      return data.data;
    } catch (e) {
      if (isAxiosError(e)) throw toRequestError(e);
      throw e;
    }
  },

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const { data } = await publicAuthClient.post<{
        success?: boolean;
        access?: string;
        data?: { access?: string };
      }>('/auth/token/refresh/', { refresh: refreshToken });

      const access = data.access ?? data.data?.access;
      if (!access) {
        throw new Error('Token refresh failed');
      }
      return access;
    } catch (e) {
      throw toRequestError(e);
    }
  },

  /** Bearer uses access token; body carries refresh (server invalidation). Use publicAuthClient to avoid apiClient refresh loops. */
  async logout(accessToken: string, refreshToken: string): Promise<void> {
    await publicAuthClient.post(
      '/auth/logout/',
      { refresh: refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  },
};
