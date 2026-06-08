'use client';

import { PackageCard } from '@/components/admin/packages/PackageCard';
import { PackagesEmptyState } from '@/components/admin/packages/PackagesEmptyState';
import { PackagesPagination } from '@/components/admin/packages/PackagesPagination';
import { cn } from '@/lib/utils';
import type { AdminPackage } from '@/types/adminPackage';

export function PackagesList({
  packages,
  isLoading,
  isError,
  errorMessage,
  page,
  pageSize,
  total,
  onPageChange,
  onDeactivate,
  deactivatingId,
  className,
}: {
  packages: AdminPackage[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onDeactivate: (pkg: AdminPackage) => void;
  deactivatingId: string | null;
  className?: string;
}) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/50" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center', className)}>
        <p className="text-sm text-muted-foreground">{errorMessage ?? 'Could not load packages.'}</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return <PackagesEmptyState />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-3">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onDeactivate={() => onDeactivate(pkg)}
            isDeactivating={deactivatingId === pkg.id}
          />
        ))}
      </div>
      {total > pageSize && (
        <PackagesPagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
      )}
    </div>
  );
}
