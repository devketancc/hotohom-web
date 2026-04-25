import { isAxiosError, type AxiosError } from 'axios';
import { logger } from './logger';

type MotohomErrorEnvelope = {
  error?: { code?: string; message?: string };
  message?: string;
  detail?: string;
};

function parseMotohomPayload(data: unknown): { message: string; code?: string } | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as MotohomErrorEnvelope;
  if (d.error?.message) return { message: d.error.message, code: d.error.code };
  if (typeof d.message === 'string' && d.message) return { message: d.message };
  if (typeof d.detail === 'string' && d.detail) return { message: d.detail };
  return null;
}

function fromAxiosError(error: AxiosError): Error & { code?: string } {
  const parsed = parseMotohomPayload(error.response?.data);
  if (parsed) {
    const err = new Error(parsed.message) as Error & { code?: string };
    if (parsed.code) err.code = parsed.code;
    return err;
  }
  return new Error(error.message || 'Request failed') as Error & { code?: string };
}

function buildRejectionError(error: unknown): Error & { code?: string } {
  if (isAxiosError(error)) {
    return fromAxiosError(error);
  }
  if (error instanceof Error) {
    const e = error as Error & { code?: string };
    const out = new Error(e.message) as Error & { code?: string };
    if (e.code) out.code = e.code;
    return out;
  }
  return new Error('An unexpected error occurred. Please try again later.');
}

/**
 * Maps API failures to an Error with backend `message` and optional Motohom `code`
 * (e.g. INVALID_DATE, RANGE_TOO_LARGE).
 */
export function toRejectionError(error: unknown): Error & { code?: string } {
  logger.error('API Error occurred', error);
  return buildRejectionError(error);
}

/** Returns user-facing message only. */
export function handleApiError(error: unknown): string {
  logger.error('API Error occurred', error);
  return buildRejectionError(error).message;
}
