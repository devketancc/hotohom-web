'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationService } from '@/services/location.service';
import { packageService } from '@/services/package.service';

export function usePackageById(packageId: string | undefined) {
  const { data: hubs } = useQuery({
    queryKey: ['hubs'],
    queryFn: () => locationService.getHubs(),
  });

  const hubIds = useMemo(() => hubs?.map((h) => h.id) ?? [], [hubs]);

  return useQuery({
    queryKey: ['packageById', packageId, hubIds.join(',')],
    queryFn: async () => {
      if (!packageId || hubIds.length === 0) return null;
      const res = await packageService.listPackagesAcrossHubs(hubIds);
      const list = res.data?.results ?? [];
      return list.find((p) => p.id === packageId) ?? null;
    },
    enabled: Boolean(packageId) && hubIds.length > 0,
  });
}
