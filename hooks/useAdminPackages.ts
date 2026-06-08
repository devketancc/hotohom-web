import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listAdminPackages, packageAdminQueryKeys } from '@/services/packageAdmin.service';
import type { AdminPackageListQuery } from '@/types/adminPackage';

export type UseAdminPackagesInput = {
  page: number;
  pageSize: number;
};

export function useAdminPackages({ page, pageSize }: UseAdminPackagesInput) {
  const queryParams = useMemo(
    (): AdminPackageListQuery => ({
      page,
      page_size: pageSize,
    }),
    [page, pageSize]
  );

  return useQuery({
    queryKey: packageAdminQueryKeys.list(queryParams),
    queryFn: () => listAdminPackages(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
