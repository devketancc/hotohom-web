'use client';

import { useQuery } from '@tanstack/react-query';
import { crewQueryKeys, getCrewTripEOTSummary } from '@/services/crew.service';

export function useCrewTripEOTSummary(tripId: string, enabled: boolean) {
  return useQuery({
    queryKey: crewQueryKeys.tripEotSummary(tripId),
    queryFn: () => getCrewTripEOTSummary(tripId),
    enabled: enabled && Boolean(tripId),
    staleTime: 0,
  });
}
