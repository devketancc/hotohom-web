import type { AdminStaffCalendarReason } from '@/types/admin';

export function crewReasonToLabel(reason: AdminStaffCalendarReason): string {
  switch (reason) {
    case 'booking':
      return 'Booking';
    case 'leave':
      return 'Leave';
    case 'training':
      return 'Training';
    default:
      return 'Other';
  }
}

export function crewReasonToColor(reason: AdminStaffCalendarReason): string {
  switch (reason) {
    case 'booking':
      return '#3b82f6';
    case 'leave':
      return '#d97706';
    case 'training':
      return '#8b5cf6';
    default:
      return '#6b7280';
  }
}

export function crewReasonStyles(reason: AdminStaffCalendarReason): { tintClass: string; badgeClass: string; legendClass: string } {
  switch (reason) {
    case 'booking':
      return {
        tintClass: 'bg-blue-500/20 border-l-blue-500 text-foreground',
        badgeClass: 'bg-blue-500/30 text-foreground',
        legendClass: 'border-l-blue-500 bg-blue-500/15 text-foreground',
      };
    case 'leave':
      return {
        tintClass: 'bg-amber-500/20 border-l-amber-500 text-foreground',
        badgeClass: 'bg-amber-500/30 text-foreground',
        legendClass: 'border-l-amber-500 bg-amber-500/15 text-foreground',
      };
    case 'training':
      return {
        tintClass: 'bg-violet-500/20 border-l-violet-500 text-foreground',
        badgeClass: 'bg-violet-500/30 text-foreground',
        legendClass: 'border-l-violet-500 bg-violet-500/15 text-foreground',
      };
    default:
      return {
        tintClass: 'bg-zinc-500/15 border-l-zinc-400 text-foreground',
        badgeClass: 'bg-zinc-500/25 text-foreground',
        legendClass: 'border-l-zinc-400 bg-zinc-500/15 text-foreground',
      };
  }
}
