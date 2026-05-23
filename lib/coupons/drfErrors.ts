import { isAxiosError } from 'axios';
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

/** DRF validation errors are exposed under `error.details` as `{ field: [messages] }`. */
export function extractDrfFieldErrors(error: unknown): Record<string, string> | null {
  if (!isAxiosError(error)) return null;
  const body = error.response?.data as {
    success?: boolean;
    error?: { details?: unknown; message?: string };
  };
  const details = body?.error?.details;
  if (!details || typeof details !== 'object' || Array.isArray(details)) return null;

  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(details as Record<string, unknown>)) {
    if (Array.isArray(val) && val.length > 0) {
      out[key] = String(val[0]);
    } else if (typeof val === 'string' && val) {
      out[key] = val;
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      const nested = val as Record<string, unknown>;
      const first = Object.values(nested).flat().find((v) => typeof v === 'string' || Array.isArray(v));
      if (Array.isArray(first) && first[0]) out[key] = String(first[0]);
    }
  }
  return Object.keys(out).length ? out : null;
}

export function applyDrfErrorsToForm<T extends FieldValues>(
  errors: Record<string, string>,
  setError: UseFormSetError<T>,
  fieldAliases: Partial<Record<string, FieldPath<T>>> = {}
): void {
  for (const [apiKey, message] of Object.entries(errors)) {
    if (apiKey === 'non_field_errors') {
      setError('root' as FieldPath<T>, { type: 'server', message });
      continue;
    }
    const path = (fieldAliases[apiKey] ?? (apiKey as FieldPath<T>)) as FieldPath<T>;
    setError(path, { type: 'server', message });
  }
}
