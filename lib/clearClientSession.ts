import { useBookingStore } from '@/store/bookingStore';
import { useUiStore } from '@/store/uiStore';

/**
 * Explicit user logout should wipe all persisted booking trace.
 * We intentionally keep API 401 handling auth-only to avoid wiping
 * active trip drafts on transient request failures.
 */
export function clearClientSession(): void {
  if (typeof window === 'undefined') return;
  useBookingStore.getState().reset();
  useUiStore.getState().reset();
}
