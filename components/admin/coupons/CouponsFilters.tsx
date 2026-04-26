'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type CouponActiveFilter = 'active' | 'inactive';

export function CouponsFilters({
  search,
  onSearchChange,
  activeFilter,
  onActiveFilterChange,
  total,
  isFetching,
  className,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeFilter: CouponActiveFilter;
  onActiveFilterChange: (v: CouponActiveFilter) => void;
  total: number;
  isFetching?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border/80 bg-card/40 p-4 shadow-sm ring-1 ring-foreground/5 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <Label htmlFor="coupon-search" className="text-muted-foreground">
          Search by code
        </Label>
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="coupon-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="e.g. SUMMER25"
            className="h-9 pl-9"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        <span className="text-xs font-medium text-muted-foreground">Status</span>
        <div
          className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5 shadow-inner"
          role="group"
          aria-label="Filter by active status"
        >
          <button
            type="button"
            onClick={() => onActiveFilterChange('active')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeFilter === 'active'
                ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => onActiveFilterChange('inactive')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeFilter === 'inactive'
                ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Inactive
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">{total}</span> result{total === 1 ? '' : 's'}
          {isFetching ? <span className="ml-2 text-primary">Updating…</span> : null}
        </p>
      </div>
    </div>
  );
}
