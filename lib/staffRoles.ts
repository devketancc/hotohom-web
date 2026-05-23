/**
 * Roles allowed into `/admin` after staff OTP verify.
 * Must match backend `UserRole` string values (Django TextChoices), not labels.
 * Excludes `customer`, `driver`, `helper`, `b2b_partner` — add here if they should use this portal.
 */
export const STAFF_ROLES = ['superadmin', 'ops', 'finance', 'support'] as const;

export function isStaffRole(role: string | undefined): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return (STAFF_ROLES as readonly string[]).includes(normalized);
}
