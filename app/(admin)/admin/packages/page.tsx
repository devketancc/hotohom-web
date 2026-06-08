'use client';

import { useMemo, useState } from 'react';
import { PackageDeactivateDialog } from '@/components/admin/packages/PackageDeactivateDialog';
import type { PackageActiveFilter } from '@/components/admin/packages/PackagesFilters';
import { PackagesFilters } from '@/components/admin/packages/PackagesFilters';
import { PackagesHeader } from '@/components/admin/packages/PackagesHeader';
import { PackagesList } from '@/components/admin/packages/PackagesList';
import { useAdminPackages } from '@/hooks/useAdminPackages';
import { usePackageMutations } from '@/hooks/usePackageMutations';
import type { AdminPackage } from '@/types/adminPackage';

const PAGE_SIZE = 20;

export default function AdminPackagesPage() {
  const [activeFilter, setActiveFilter] = useState<PackageActiveFilter>('active');
  const [page, setPage] = useState(1);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminPackage | null>(null);

  const listQuery = useAdminPackages({ page, pageSize: PAGE_SIZE });
  const { data, isPending, isError, error, isFetching } = listQuery;
  const allResults = data?.results ?? [];
  const total = data?.count ?? 0;

  const packages = useMemo(() => {
    if (activeFilter === 'all') return allResults;
    return allResults.filter((p) => p.is_active);
  }, [allResults, activeFilter]);

  const showSkeleton = isPending && !data;
  const { deactivateMutation } = usePackageMutations();

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateMutation.mutateAsync(deactivateTarget.id);
      setDeactivateTarget(null);
    } catch {
      /* toast in mutation */
    }
  };

  return (
    <>
      <PackagesHeader />

      <PackagesFilters
        activeFilter={activeFilter}
        onActiveFilterChange={(v) => {
          setActiveFilter(v);
          setPage(1);
        }}
        total={total}
        filteredCount={packages.length}
        isFetching={isFetching && !showSkeleton}
        className="mb-6"
      />

      <PackagesList
        packages={packages}
        isLoading={showSkeleton}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        onDeactivate={setDeactivateTarget}
        deactivatingId={deactivateMutation.isPending ? deactivateMutation.variables ?? null : null}
      />

      <PackageDeactivateDialog
        pkg={deactivateTarget}
        open={Boolean(deactivateTarget)}
        onOpenChange={(o) => {
          if (!o) setDeactivateTarget(null);
        }}
        onConfirm={handleDeactivateConfirm}
        isDeactivating={deactivateMutation.isPending}
      />
    </>
  );
}
