import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, MapPin, Layers, Truck, ClipboardList, CalendarRange, Wallet, LifeBuoy } from 'lucide-react';

export type AdminNavBadge = 'soon';

export type AdminNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: AdminNavBadge;
  children?: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { id: 'overview', label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { id: 'hubs', label: 'Hubs', href: '/admin/hubs', icon: MapPin },
  { id: 'caravan-classes', label: 'Classes', href: '/admin/caravan-classes', icon: Layers },
  { id: 'caravans', label: 'Caravans', href: '/admin/caravans', icon: Truck },
  {
    id: 'operations',
    label: 'Operations',
    href: '/admin/operations',
    icon: ClipboardList,
    disabled: true,
    badge: 'soon',
  },
  {
    id: 'bookings',
    label: 'Bookings',
    href: '/admin/bookings',
    icon: CalendarRange,
    disabled: true,
    badge: 'soon',
  },
  {
    id: 'finance',
    label: 'Finance',
    href: '/admin/finance',
    icon: Wallet,
    disabled: true,
    badge: 'soon',
  },
  {
    id: 'support',
    label: 'Support',
    href: '/admin/support',
    icon: LifeBuoy,
    disabled: true,
    badge: 'soon',
  },
];

/** Flatten one level of children for active matching (extend when nested nav ships). */
function flattenNav(items: AdminNavItem[]): AdminNavItem[] {
  const out: AdminNavItem[] = [];
  for (const item of items) {
    out.push(item);
    if (item.children?.length) out.push(...item.children);
  }
  return out;
}

export function adminNavItemActive(pathname: string, item: AdminNavItem): boolean {
  const path = pathname || '';
  if (item.href === '/admin') return path === '/admin' || path === '/admin/';
  return path === item.href || path.startsWith(`${item.href}/`);
}

export function getAdminNavTitle(pathname: string, items: AdminNavItem[] = ADMIN_NAV): string {
  for (const item of flattenNav(items)) {
    if (adminNavItemActive(pathname, item)) return item.label;
  }
  return 'Dashboard';
}

/** Reserved for role-based nav filtering (e.g. hide Finance for `ops`). */
export function getNavForRole(_role: string | undefined, items: AdminNavItem[] = ADMIN_NAV): AdminNavItem[] {
  return items;
}
