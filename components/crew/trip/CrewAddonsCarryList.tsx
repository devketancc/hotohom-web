'use client';

import type { LucideIcon } from 'lucide-react';
import { Bed, Bike, Briefcase, Flame, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BookingItem } from '@/types/bookingDetail';

function addonCategoryLabel(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function addonIcon(item: BookingItem): { Icon: LucideIcon; className: string } {
  const name = item.addon_name.toLowerCase();
  const cat = item.addon_category.toLowerCase();
  if (name.includes('bed') || name.includes('bedding')) {
    return { Icon: Bed, className: 'bg-blue-500/20 text-blue-300' };
  }
  if (name.includes('bbq') || name.includes('grill')) {
    return { Icon: Flame, className: 'bg-violet-500/20 text-violet-300' };
  }
  if (name.includes('bike') || cat.includes('adventure')) {
    return { Icon: Bike, className: 'bg-emerald-500/20 text-emerald-300' };
  }
  if (cat.includes('comfort')) {
    return { Icon: Briefcase, className: 'bg-violet-500/20 text-violet-300' };
  }
  return { Icon: Package, className: 'bg-amber-500/20 text-amber-300' };
}

export function CrewAddonsCarryList({
  items,
  compact = false,
}: {
  items: BookingItem[];
  compact?: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
        No add-ons for this booking.
      </p>
    );
  }

  return (
    <ul className={cn('space-y-2', compact && 'space-y-1.5')}>
      {items.map((item) => {
        const { Icon, className } = addonIcon(item);
        return (
          <li
            key={item.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border border-border/80 bg-muted/15',
              compact ? 'px-2.5 py-2' : 'px-3 py-2.5'
            )}
          >
            <span
              className={cn(
                'flex shrink-0 items-center justify-center rounded-lg',
                compact ? 'size-9' : 'size-10',
                className
              )}
            >
              <Icon className={compact ? 'size-4' : 'size-5'} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn('font-semibold text-foreground', compact && 'text-sm')}>{item.addon_name}</p>
              {item.addon_category ? (
                <p className="text-xs text-muted-foreground">{addonCategoryLabel(item.addon_category)}</p>
              ) : null}
            </div>
            <span className={cn('shrink-0 font-semibold text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
              Qty: {item.quantity}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function CrewAddonsCarryHeader({ count }: { count: number }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
          <Briefcase className="size-4" aria-hidden />
        </span>
        <h2 className="text-sm font-bold tracking-tight">Add-ons (Carry with you)</h2>
      </div>
      <Badge variant="secondary" className="text-xs">
        {count} {count === 1 ? 'Item' : 'Items'}
      </Badge>
    </div>
  );
}
