import type { LucideIcon } from 'lucide-react';
import { CalendarDays, CalendarRange } from 'lucide-react';

export type CrewNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const CREW_NAV: CrewNavItem[] = [
  { id: 'roster', label: 'Roster', href: '/crew/roster', icon: CalendarRange },
  { id: 'calendar', label: 'Calendar', href: '/crew/calendar', icon: CalendarDays },
];

export function crewNavItemActive(pathname: string, item: CrewNavItem): boolean {
  if (item.href === '/crew/roster') {
    return pathname === '/crew/roster' || pathname.startsWith('/crew/bookings/');
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function crewScheduleTitle(userName?: string | null): string {
  const name = userName?.trim();
  return name ? `Schedule for ${name}` : 'Schedule';
}

export function getCrewNavTitle(pathname: string, options?: { userName?: string | null }): string {
  if (pathname.startsWith('/crew/bookings/')) return 'Booking';
  const item = CREW_NAV.find((n) => crewNavItemActive(pathname, n));
  if (item?.id === 'calendar') return crewScheduleTitle(options?.userName);
  return item?.label ?? 'Crew';
}
