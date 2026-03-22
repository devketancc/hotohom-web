// lib/logger.ts
export const logger = {
  info: (message: string, meta?: unknown) => {
    console.info(`[INFO] ${message}`, meta ? meta : '');
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(`[WARN] ${message}`, meta ? meta : '');
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error ? error : '');
  },
};
