'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { differenceInCalendarDays, isValid, parseISO, startOfDay } from 'date-fns';
import {
  adminQueryKeys,
  listAdminCalendarRoster,
  type AdminCalendarRosterQueryParams,
} from '@/services/admin.service';

export type RosterPreset = '7d' | '30d' | 'custom';

export type RosterFetchFilters = {
  startYmd: string;
  endYmd: string;
  hubId: string;
  alertsOnly: boolean;
};

export type RosterValidation =
  | { ok: true }
  | { ok: false; reason: 'invalid_date' | 'date_order' | 'range_exceeded' };

export function validateRosterFilters(f: RosterFetchFilters): RosterValidation {
  const start = parseISO(f.startYmd);
  const end = parseISO(f.endYmd);
  if (!isValid(start) || !isValid(end)) return { ok: false, reason: 'invalid_date' };
  const sd = startOfDay(start);
  const ed = startOfDay(end);
  if (differenceInCalendarDays(ed, sd) < 0) return { ok: false, reason: 'date_order' };
  if (differenceInCalendarDays(ed, sd) > 90) return { ok: false, reason: 'range_exceeded' };
  return { ok: true };
}

/** Build API params; returns null if filters fail validation (caller should not fetch). */
export function toRosterQueryParams(f: RosterFetchFilters): AdminCalendarRosterQueryParams | null {
  const v = validateRosterFilters(f);
  if (!v.ok) return null;

  const sameDay = f.startYmd === f.endYmd;
  const base: AdminCalendarRosterQueryParams = sameDay
    ? { date: f.startYmd }
    : { start: f.startYmd, end: f.endYmd };

  if (f.hubId) base.hub = f.hubId;
  if (f.alertsOnly) base.hasAlerts = true;
  return base;
}

export function useAdminCalendarRoster(filters: RosterFetchFilters) {
  const params = useMemo(() => toRosterQueryParams(filters), [filters]);
  const validation = useMemo(() => validateRosterFilters(filters), [filters]);

  const queryKey = adminQueryKeys.roster({
    date: params?.date,
    start: params?.start,
    end: params?.end,
    hub: params?.hub,
    hasAlerts: params?.hasAlerts,
  });

  const query = useQuery({
    queryKey,
    queryFn: () => listAdminCalendarRoster(params!),
    enabled: params !== null,
    staleTime: 30_000,
  });

  return { ...query, validation, queryParams: params };
}
