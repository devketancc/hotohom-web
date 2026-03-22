import axios from 'axios';
import { env } from '@/config/env';
import { handleApiError } from '@/lib/errorHandler';

const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token if needed
apiClient.interceptors.request.use(
  (config) => {
    // Determine token logic here,e.g., from local storage or cookies
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = handleApiError(error);
    // Transform error to generic structure or throw to handle in catch block
    return Promise.reject(new Error(errorMsg));
  }
);

export default apiClient;
