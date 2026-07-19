'use client';

import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys, getAdminTripSettlement } from '@/services/admin.service';

export function useAdminTripSettlement(tripId: string, enabled: boolean) {
  return useQuery({
    queryKey: adminQueryKeys.tripSettlement(tripId),
    queryFn: () => getAdminTripSettlement(tripId),
    enabled: enabled && Boolean(tripId),
    // Backend 400s (TRIP_NOT_ENDED) on status races — don't hammer it.
    retry: false,
  });
}
