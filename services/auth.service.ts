import axios, { isAxiosError } from 'axios';
import { env } from '@/config/env';
import type { AuthUser } from '@/store/authStore';

type ApiEnvelope = {
  success?: boolean;
  error?: { code?: string; message?: string; details?: unknown };
  message?: string;
  detail?: string;
};

function parseApiErrorPayload(data: unknown): { message: string; code?: string } | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as ApiEnvelope;
  if (d.error?.message) return { message: d.error.message, code: d.error.code };
  if (typeof d.message === 'string') return { message: d.message };
  if (typeof d.detail === 'string') return { message: d.detail };
  return null;
}

function toRequestError(e: unknown): Error {
  if (isAxiosError(e)) {
    const parsed = parseApiErrorPayload(e.response?.data);
    if (parsed) {
      const err = new Error(parsed.message) as Error & { code?: string };
      err.code = parsed.code;
      return err;
    }
    const body = e.response?.data as { message?: string; detail?: string } | undefined;
    return new Error(body?.message || body?.detail || e.message || 'Request failed');
  }
  return e instanceof Error ? e : new Error('Request failed');
}

/** True when login OTP cannot be sent because the phone is not on file yet. */
export function isUnregisteredPhoneOtpError(code?: string, message?: string): boolean {
  const c = (code ?? '').toUpperCase();
  const m = (message ?? '').toLowerCase();
  if (
    c.includes('NOT_REGISTERED') ||
    c.includes('NOT_FOUND') ||
    c.includes('UNREGISTERED') ||
    c.includes('NO_USER') ||
    c.includes('UNKNOWN_PHONE') ||
    c.includes('USER_NOT_FOUND') ||
    c.includes('PHONE_NOT_REGISTERED') ||
    c.includes('ACCOUNT_NOT_FOUND') ||
    c.includes('DOES_NOT_EXIST')
  ) {
    return true;
  }
  if (
    m.includes('not registered') ||
    m.includes('no account') ||
    m.includes('not found') ||
    m.includes('does not exist') ||
    m.includes('user not found') ||
    m.includes('no user') ||
    m.includes('register first')
  ) {
    return true;
  }
  return false;
}

export type SendOtpResult =
  | { ok: true }
  | { ok: false; message: string; code?: string; notRegistered?: boolean };

export type ResendOtpResult =
  | { ok: true; message?: string }
  | { ok: false; message: string; code?: string };

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
  async sendOtp(phone: string): Promise<SendOtpResult> {
    try {
      const { data } = await publicAuthClient.post<{
        success: boolean;
        data?: { message?: string };
        error?: { code?: string; message?: string };
      }>('/auth/otp/send/', { phone });

      if (data.success === true) return { ok: true };

      const message = data.error?.message ?? 'Could not send OTP. Try again.';
      const code = data.error?.code;
      return {
        ok: false,
        message,
        code,
        notRegistered: isUnregisteredPhoneOtpError(code, message),
      };
    } catch (e) {
      const err = toRequestError(e);
      const code = (err as Error & { code?: string }).code;
      return {
        ok: false,
        message: err.message,
        code,
        notRegistered: isUnregisteredPhoneOtpError(code, err.message),
      };
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
        const parsed = parseApiErrorPayload(data);
        throw Object.assign(new Error(parsed?.message || data.message || 'Invalid OTP. Please try again.'), {
          code: parsed?.code ?? (data as ApiEnvelope).error?.code,
        });
      }

      return data.data;
    } catch (e) {
      if (isAxiosError(e)) throw toRequestError(e);
      throw e;
    }
  },

  /** Body is `{ phone }` only until the backend documents an optional flow discriminator. */
  async resendOtp(phone: string, _options?: { purpose?: 'login' | 'register' }): Promise<ResendOtpResult> {
    void _options;
    try {
      const { data } = await publicAuthClient.post<{
        success: boolean;
        data?: { message?: string };
        error?: { code?: string; message?: string };
      }>('/auth/resend-otp/', { phone });

      if (data.success === true) {
        return { ok: true, message: data.data?.message };
      }

      const message = data.error?.message ?? 'Could not resend code. Try again.';
      return {
        ok: false,
        message,
        code: data.error?.code,
      };
    } catch (e) {
      const err = toRequestError(e);
      return {
        ok: false,
        message: err.message,
        code: (err as Error & { code?: string }).code,
      };
    }
  },

  async register(payload: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  }): Promise<{ message?: string }> {
    try {
      const { data } = await publicAuthClient.post<{
        success: boolean;
        data?: { message?: string };
        error?: { code?: string; message?: string };
      }>('/auth/register/', payload);

      if (data.success === true) {
        return { message: data.data?.message };
      }

      const message = data.error?.message ?? 'Could not start registration. Try again.';
      const err = new Error(message) as Error & { code?: string };
      err.code = data.error?.code;
      throw err;
    } catch (e) {
      throw toRequestError(e);
    }
  },

  async registerVerify(phone: string, otp: string): Promise<VerifyOtpResult> {
    try {
      const { data } = await publicAuthClient.post<{
        success: boolean;
        data?: VerifyOtpResult;
        message?: string;
        error?: { code?: string; message?: string };
      }>('/auth/register/verify/', { phone, otp });

      if (!data.success || !data.data) {
        const parsed = parseApiErrorPayload(data);
        throw Object.assign(new Error(parsed?.message || data.message || 'Invalid OTP. Please try again.'), {
          code: parsed?.code ?? data.error?.code,
        });
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
