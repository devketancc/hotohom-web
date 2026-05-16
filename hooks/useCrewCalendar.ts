'use client';

import { useQuery } from '@tanstack/react-query';
import { crewQueryKeys, getCrewCalendar } from '@/services/crew.service';

export function useCrewCalendar(params: { start: string; end: string; enabled?: boolean }) {
  const { start, end, enabled = true } = params;

  return useQuery({
    queryKey: crewQueryKeys.calendar({ start, end }),
    queryFn: () => getCrewCalendar({ start, end }),
    enabled: enabled && Boolean(start && end),
    staleTime: 2 * 60 * 1000,
  });
}
