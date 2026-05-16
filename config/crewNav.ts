import type { LucideIcon } from 'lucide-react';
import { CalendarRange, ClipboardList } from 'lucide-react';

export type CrewNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const CREW_NAV: CrewNavItem[] = [
  { id: 'roster', label: 'Roster', href: '/crew/roster', icon: ClipboardList },
  { id: 'calendar', label: 'Calendar', href: '/crew/calendar', icon: CalendarRange },
];

export function crewNavItemActive(pathname: string, item: CrewNavItem): boolean {
  const path = pathname || '';
  if (item.href === '/crew/roster') {
    return path === '/crew/roster' || path.startsWith('/crew/roster/');
  }
  return path === item.href || path.startsWith(`${item.href}/`);
}

export function getCrewNavTitle(pathname: string, items: CrewNavItem[] = CREW_NAV): string {
  for (const item of items) {
    if (crewNavItemActive(pathname, item)) return item.label;
  }
  return 'Crew';
}
