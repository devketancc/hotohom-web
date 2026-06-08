'use client';

import { cn } from '@/lib/utils';

export type PackageActiveFilter = 'active' | 'all';

export function PackagesFilters({
  activeFilter,
  onActiveFilterChange,
  total,
  filteredCount,
  isFetching,
  className,
}: {
  activeFilter: PackageActiveFilter;
  onActiveFilterChange: (v: PackageActiveFilter) => void;
  total: number;
  filteredCount: number;
  isFetching?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="inline-flex rounded-lg border border-border/80 bg-muted/30 p-1">
        {(['active', 'all'] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={activeFilter === key}
            onClick={() => onActiveFilterChange(key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
              activeFilter === key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {key === 'active' ? 'Active' : 'All'}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground sm:text-sm">
        {isFetching ? 'Updating…' : (
          <>
            Showing <span className="font-medium text-foreground">{filteredCount}</span>
            {activeFilter === 'active' ? ` active of ${total} on this page` : ` of ${total} on this page`}
          </>
        )}
      </p>
    </div>
  );
}
