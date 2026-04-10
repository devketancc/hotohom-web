import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';
import { handleApiError } from '@/lib/errorHandler';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

const apiClient = axios.create({
  baseURL: env.API_BASE_URL ? `${env.API_BASE_URL.replace(/\/$/, '')}/api/v1` : '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? useAuthStore.getState().accessToken : null;
    if (token && config.headers) {
      const headers = AxiosHeaders.from(config.headers);
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
        config.headers = headers;
      }
    }

    if (env.IS_DEVELOPMENT) {
      console.log(`📡 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? '';

    if (status !== 401 || !originalRequest || isAuthPublicPath(url)) {
      const errorMsg = handleApiError(error);
      return Promise.reject(new Error(errorMsg));
    }

    if (originalRequest._retry) {
      // Keep 401 fallback auth-only; explicit logout handles full booking/cart trace cleanup.
      useAuthStore.getState().logout();
      const errorMsg = handleApiError(error);
      return Promise.reject(new Error(errorMsg));
    }

    const refresh = useAuthStore.getState().refreshToken;
    if (!refresh) {
      useAuthStore.getState().logout();
      const errorMsg = handleApiError(error);
      return Promise.reject(new Error(errorMsg));
    }

    if (!refreshPromise) {
      refreshPromise = authService
        .refreshAccessToken(refresh)
        .then((newAccess) => {
          useAuthStore.getState().setAccessToken(newAccess);
          return newAccess;
        })
        .catch((e) => {
          useAuthStore.getState().logout();
          throw e;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const newAccess = await refreshPromise;
      originalRequest._retry = true;
      const headers = AxiosHeaders.from(originalRequest.headers ?? {});
      headers.set('Authorization', `Bearer ${newAccess}`);
      originalRequest.headers = headers;
      return apiClient(originalRequest);
    } catch {
      const errorMsg = handleApiError(error);
      return Promise.reject(new Error(errorMsg));
    }
  }
);

function isAuthPublicPath(url: string): boolean {
  return (
    url.includes('/auth/otp/send/') ||
    url.includes('/auth/otp/verify/') ||
    url.includes('/auth/token/refresh/')
  );
}

export default apiClient;
