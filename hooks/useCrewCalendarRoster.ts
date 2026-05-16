'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { differenceInCalendarDays, isValid, parseISO, startOfDay } from 'date-fns';
import {
  crewQueryKeys,
  listCrewRosterWithFallback,
  type CrewCalendarRosterQueryParams,
} from '@/services/crew.service';

export type RosterPreset = '7d' | '30d' | 'custom';

export type CrewRosterFetchFilters = {
  startYmd: string;
  endYmd: string;
};

export type RosterValidation =
  | { ok: true }
  | { ok: false; reason: 'invalid_date' | 'date_order' | 'range_exceeded' };

export function validateCrewRosterFilters(f: CrewRosterFetchFilters): RosterValidation {
  const start = parseISO(f.startYmd);
  const end = parseISO(f.endYmd);
  if (!isValid(start) || !isValid(end)) return { ok: false, reason: 'invalid_date' };
  const sd = startOfDay(start);
  const ed = startOfDay(end);
  if (differenceInCalendarDays(ed, sd) < 0) return { ok: false, reason: 'date_order' };
  if (differenceInCalendarDays(ed, sd) > 90) return { ok: false, reason: 'range_exceeded' };
  return { ok: true };
}

export function toCrewRosterQueryParams(f: CrewRosterFetchFilters): CrewCalendarRosterQueryParams | null {
  const v = validateCrewRosterFilters(f);
  if (!v.ok) return null;

  const sameDay = f.startYmd === f.endYmd;
  return sameDay ? { date: f.startYmd } : { start: f.startYmd, end: f.endYmd };
}

export function useCrewCalendarRoster(filters: CrewRosterFetchFilters) {
  const params = useMemo(() => toCrewRosterQueryParams(filters), [filters]);
  const validation = useMemo(() => validateCrewRosterFilters(filters), [filters]);

  const queryKey = crewQueryKeys.roster({
    date: params?.date,
    start: params?.start,
    end: params?.end,
  });

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!params) throw new Error('Invalid date range');
      return listCrewRosterWithFallback(params);
    },
    enabled: validation.ok && params !== null,
  });

  return {
    data: query.data?.bookings,
    dataSource: query.data?.dataSource,
    isPending: query.isPending,
    error: query.error,
    validation,
    refetch: query.refetch,
  };
}
