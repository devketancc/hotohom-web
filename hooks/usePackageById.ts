'use client';

import { useQuery } from '@tanstack/react-query';
import { packageService } from '@/services/package.service';

export function usePackageById(packageId: string | undefined) {
  return useQuery({
    queryKey: ['packageById', packageId],
    queryFn: async () => {
      if (!packageId) return null;
      const res = await packageService.getPackageById(packageId);
      if (!res.success || !res.data) return null;
      return res.data;
    },
    enabled: Boolean(packageId),
  });
}
