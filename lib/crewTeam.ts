import type { CrewBookingDetail } from '@/types/crew';
import type { AuthUser } from '@/store/authStore';

export type CrewRoleLabel = 'Driver' | 'Helper';

export function crewRoleLabel(role: string | undefined): CrewRoleLabel | null {
  if (role === 'driver') return 'Driver';
  if (role === 'helper') return 'Helper';
  return null;
}

export function crewContactLinks(booking: CrewBookingDetail, user: AuthUser | null) {
  const assignment = booking.assignment;
  const role = user?.role;
  const customer = booking.customer_phone?.trim()
    ? { label: 'Customer', name: booking.customer_name, phone: booking.customer_phone.trim() }
    : null;

  let teammate: { label: string; name: string; phone: string } | null = null;
  if (role === 'driver' && assignment?.helper_phone?.trim()) {
    teammate = {
      label: 'Helper',
      name: assignment.helper_name || 'Helper',
      phone: assignment.helper_phone.trim(),
    };
  } else if (role === 'helper' && assignment?.driver_phone?.trim()) {
    teammate = {
      label: 'Driver',
      name: assignment.driver_name || 'Driver',
      phone: assignment.driver_phone.trim(),
    };
  }

  return { customer, teammate };
}
