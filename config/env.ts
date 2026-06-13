// config/env.ts

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value && process.env.NODE_ENV === 'production') {
    console.warn(`Environment variable ${key} is missing in production!`);
  }
  return value || '';
};

const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
/**
 * Route API calls same-origin through app/api/v1/[[...segments]]/route.ts (server-side fetch)
 * in BOTH dev and production, so the browser never makes a cross-origin (CORS) request.
 * Opt out with NEXT_PUBLIC_API_DEV_PROXY=false to call the backend directly.
 */
const useApiProxy =
  rawApiBase.startsWith('http') &&
  process.env.NEXT_PUBLIC_API_DEV_PROXY !== 'false';

export const env = {
  API_BASE_URL: useApiProxy ? '' : rawApiBase || 'MISSING_API_URL',
  RAZORPAY_KEY: process.env.NEXT_PUBLIC_RAZORPAY_KEY || '',
  /** Trimmed; full Google Maps browser keys are ~39 chars — shorter values usually mean truncation or .env parse issues. */
  GOOGLE_MAPS_KEY: (process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '').trim(),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

// Runtime verification
if (typeof window !== 'undefined') {
  console.log('🌐 App Environment:', {
    baseUrl: env.API_BASE_URL,
    isDev: env.IS_DEVELOPMENT,
    nodeEnv: process.env.NODE_ENV
  });
}
