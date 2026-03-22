// config/env.ts

export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  RAZORPAY_KEY: process.env.NEXT_PUBLIC_RAZORPAY_KEY || '',
  GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
};
