/**
 * Roles allowed into `/crew` after crew OTP verify.
 * Must match backend `UserRole` string values (Django TextChoices).
 */
export const CREW_ROLES = ['driver', 'helper'] as const;

export type CrewRole = (typeof CREW_ROLES)[number];

export function isCrewRole(role: string | undefined): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return (CREW_ROLES as readonly string[]).includes(normalized);
}
