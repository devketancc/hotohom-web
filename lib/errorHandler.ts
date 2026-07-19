import { isAxiosError, type AxiosError } from 'axios';
import { logger } from './logger';

type MotohomErrorEnvelope = {
  error?: { code?: string; message?: string; details?: unknown };
  message?: string;
  detail?: string;
};

export type ApiRejectionError = Error & { code?: string; details?: unknown };

function parseMotohomPayload(
  data: unknown
): { message: string; code?: string; details?: unknown } | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as MotohomErrorEnvelope;
  if (d.error?.message) return { message: d.error.message, code: d.error.code, details: d.error.details };
  if (typeof d.message === 'string' && d.message) return { message: d.message };
  if (typeof d.detail === 'string' && d.detail) return { message: d.detail };
  return null;
}

function fromAxiosError(error: AxiosError): ApiRejectionError {
  const parsed = parseMotohomPayload(error.response?.data);
  if (parsed) {
    const err = new Error(parsed.message) as ApiRejectionError;
    if (parsed.code) err.code = parsed.code;
    if (parsed.details !== undefined) err.details = parsed.details;
    return err;
  }
  return new Error(error.message || 'Request failed') as ApiRejectionError;
}

function buildRejectionError(error: unknown): ApiRejectionError {
  if (isAxiosError(error)) {
    return fromAxiosError(error);
  }
  if (error instanceof Error) {
    const e = error as ApiRejectionError;
    const out = new Error(e.message) as ApiRejectionError;
    if (e.code) out.code = e.code;
    if (e.details !== undefined) out.details = e.details;
    return out;
  }
  return new Error('An unexpected error occurred. Please try again later.');
}

/**
 * Maps API failures to an Error with backend `message`, optional Motohom `code`
 * (e.g. INVALID_DATE, RANGE_TOO_LARGE), and optional structured `details`.
 */
export function toRejectionError(error: unknown): ApiRejectionError {
  logger.error('API Error occurred', error);
  return buildRejectionError(error);
}

/** Returns user-facing message only. */
export function handleApiError(error: unknown): string {
  logger.error('API Error occurred', error);
  return buildRejectionError(error).message;
}
