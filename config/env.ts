// config/env.ts

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value && process.env.NODE_ENV === 'production') {
    console.warn(`Environment variable ${key} is missing in production!`);
  }
  return value || '';
};

const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
/** In dev, same-origin /api/v1/* is handled by app/api/v1/[[...segments]]/route.ts (server fetch) to avoid browser CORS. */
const useDevApiProxy =
  process.env.NODE_ENV === 'development' &&
  rawApiBase.startsWith('http') &&
  process.env.NEXT_PUBLIC_API_DEV_PROXY !== 'false';

export const env = {
  API_BASE_URL: useDevApiProxy ? '' : rawApiBase || 'MISSING_API_URL',
  RAZORPAY_KEY: process.env.NEXT_PUBLIC_RAZORPAY_KEY || '',
  GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
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
