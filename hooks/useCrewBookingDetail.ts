'use client';

import { useQuery } from '@tanstack/react-query';
import { crewQueryKeys, getCrewBookingById } from '@/services/crew.service';

export function useCrewBookingDetail(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: crewQueryKeys.bookingDetail(bookingId),
    queryFn: () => getCrewBookingById(bookingId),
    enabled: Boolean(bookingId) && enabled,
    staleTime: 15_000,
  });
}
