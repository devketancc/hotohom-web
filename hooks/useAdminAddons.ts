import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listAdminAddons } from '@/services/addonAdmin.service';
import type { AdminAddonListQuery } from '@/types/adminAddon';

export const addonQueryKeys = {
  list: (params: AdminAddonListQuery) => ['admin', 'addons', 'list', params] as const,
  detail: (id: string) => ['admin', 'addons', 'detail', id] as const,
};

export type UseAdminAddonsInput = {
  isActiveFilter: boolean;
  page: number;
  pageSize: number;
};

export function useAdminAddons({ isActiveFilter, page, pageSize }: UseAdminAddonsInput) {
  const queryParams = useMemo(
    (): AdminAddonListQuery => ({
      page,
      page_size: pageSize,
      is_active: isActiveFilter,
    }),
    [isActiveFilter, page, pageSize]
  );

  return useQuery({
    queryKey: addonQueryKeys.list(queryParams),
    queryFn: () => listAdminAddons(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
