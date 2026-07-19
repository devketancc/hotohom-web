import type { ApiRejectionError } from '@/lib/errorHandler';
import type { AdminStaffProfile, AssignmentConflictIssue } from '@/types/admin';

/**
 * Extracts the soft-conflict issue list from a 409 ASSIGNMENT_CONFLICTS
 * rejection; returns null for any other error so callers can fall back to a toast.
 */
export function extractAssignmentConflicts(err: unknown): AssignmentConflictIssue[] | null {
  if (!(err instanceof Error)) return null;
  const rejection = err as ApiRejectionError;
  if (rejection.code !== 'ASSIGNMENT_CONFLICTS') return null;
  const details = rejection.details;
  if (!details || typeof details !== 'object') return [];
  const issues = (details as Record<string, unknown>).issues;
  if (!Array.isArray(issues)) return [];
  return issues
    .filter(
      (row): row is { code: string; message: string } =>
        Boolean(row) &&
        typeof row === 'object' &&
        typeof (row as Record<string, unknown>).code === 'string' &&
        typeof (row as Record<string, unknown>).message === 'string'
    )
    .map((row) => ({ code: row.code, message: row.message }));
}

/**
 * Orders a staff picker list: booking-hub matches first, then active staff,
 * then alphabetical. `hubName` is the roster's hub display name (not an id).
 */
export function sortStaffForHub(staff: AdminStaffProfile[], hubName: string): AdminStaffProfile[] {
  const target = hubName.trim().toLowerCase();
  return [...staff].sort((a, b) => {
    if (target) {
      const aMatch = a.hub_name.trim().toLowerCase() === target ? 0 : 1;
      const bMatch = b.hub_name.trim().toLowerCase() === target ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
    }
    if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
    return a.user.name.localeCompare(b.user.name);
  });
}
