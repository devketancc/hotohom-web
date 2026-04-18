'use client';

import type { ReactNode } from 'react';
import { Suspense, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Filter, RefreshCw, Truck } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  adminQueryKeys,
  listAdminCaravanClasses,
  listAdminFleetCaravans,
  listAdminHubs,
} from '@/services/admin.service';
import type { AdminFleetCaravan, AdminHub } from '@/types/admin';

function parseIdList(param: string | null): string[] {
  if (!param?.trim()) return [];
  return [...new Set(param.split(',').map((s) => s.trim()).filter(Boolean))].sort();
}

function serializeIdList(ids: string[]): string {
  return [...new Set(ids)].sort().join(',');
}

function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', className)}>{children}</span>
  );
}

function applyFleetFilters(
  rows: AdminFleetCaravan[],
  classIds: string[],
  hubIds: string[],
  hubs: AdminHub[]
): AdminFleetCaravan[] {
  let list = rows;
  if (classIds.length) {
    const set = new Set(classIds);
    list = list.filter((r) => set.has(r.caravan_class.id));
  }
  if (hubIds.length && hubs.length) {
    const names = new Set(
      hubIds
        .map((hid) => hubs.find((h) => h.id === hid)?.name?.trim())
        .filter((n): n is string => Boolean(n))
    );
    list = list.filter((r) => names.has((r.home_hub_name ?? '').trim()));
  }
  return list;
}

function FleetCard({ row, listQuery }: { row: AdminFleetCaravan; listQuery: string }) {
  const thumb = row.thumbnail || row.caravan_class.media[0]?.url;
  const href = `/admin/caravans/${row.id}${listQuery}`;
  return (
    <Link
      href={href}
      scroll={false}
      className="block rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-primary/40"
    >
      <div className="flex gap-4">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="h-full w-full object-cover" width={96} height={80} loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Truck className="size-8 opacity-40" aria-hidden />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-semibold tracking-tight">{row.name}</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{row.registration_no}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{row.caravan_class.code}</span> {row.caravan_class.name} · {row.year}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{row.home_hub_name || '—'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className={row.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}>
              {row.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge className={row.is_available ? 'bg-sky-500/15 text-sky-300' : 'bg-muted text-muted-foreground'}>
              {row.is_available ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FleetPageSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-24 animate-pulse rounded-xl bg-muted/40" />
      <div className="h-40 animate-pulse rounded-xl bg-muted/40" />
    </div>
  );
}

function AdminFleetCaravansContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const classIds = useMemo(() => parseIdList(searchParams.get('class')), [searchParams]);
  const hubIds = useMemo(() => parseIdList(searchParams.get('hub')), [searchParams]);

  const listQuery = useMemo(() => {
    const q = searchParams.toString();
    return q ? `?${q}` : '';
  }, [searchParams]);

  const goToCaravanDetail = (fleetId: string) => {
    router.push(`/admin/caravans/${fleetId}${listQuery}`);
  };

  const replaceQuery = useCallback(
    (nextClass: string[], nextHub: string[]) => {
      const params = new URLSearchParams();
      const c = serializeIdList(nextClass);
      const h = serializeIdList(nextHub);
      if (c) params.set('class', c);
      if (h) params.set('hub', h);
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const toggleClassId = (id: string) => {
    const next = classIds.includes(id) ? classIds.filter((x) => x !== id) : [...classIds, id];
    replaceQuery(next, hubIds);
  };

  const toggleHubId = (id: string) => {
    const next = hubIds.includes(id) ? hubIds.filter((x) => x !== id) : [...hubIds, id];
    replaceQuery(classIds, next);
  };

  const clearFilters = () => replaceQuery([], []);

  const activeFilterCount = classIds.length + hubIds.length;

  const { data: fleet, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: adminQueryKeys.caravans,
    queryFn: listAdminFleetCaravans,
    staleTime: 5 * 60 * 1000,
  });

  const { data: classes = [] } = useQuery({
    queryKey: adminQueryKeys.caravanClasses,
    queryFn: listAdminCaravanClasses,
    staleTime: 5 * 60 * 1000,
  });

  const { data: hubs = [] } = useQuery({
    queryKey: adminQueryKeys.hubs,
    queryFn: listAdminHubs,
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(
    () => applyFleetFilters(fleet ?? [], classIds, hubIds, hubs),
    [fleet, classIds, hubIds, hubs]
  );

  const selectAllClasses = () => replaceQuery(classes.map((c) => c.id), hubIds);
  const selectAllHubs = () => replaceQuery(classIds, hubs.map((h) => h.id));

  return (
    <>
      <AdminPageHeader
        title="Caravans"
        description="Fleet units by registration, home hub, and class. Use filters to narrow the list; selections sync to the URL for sharing."
      />

      {!isPending && !isError && (classes.length > 0 || hubs.length > 0) ? (
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="size-4 shrink-0" aria-hidden />
              <span>
                {activeFilterCount > 0 ? (
                  <>
                    <span className="font-semibold text-foreground">{activeFilterCount}</span> filter
                    {activeFilterCount === 1 ? '' : 's'} active
                  </>
                ) : (
                  'No filters — showing all loaded units'
                )}
              </span>
            </div>
            {activeFilterCount > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="grid gap-6 md:grid-cols-2">
                <fieldset className="min-w-0 space-y-3">
                  <legend className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Class</legend>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="xs" onClick={selectAllClasses} disabled={classes.length === 0}>
                      Select all
                    </Button>
                    <Button type="button" variant="outline" size="xs" onClick={() => replaceQuery([], hubIds)} disabled={classIds.length === 0}>
                      Clear class
                    </Button>
                  </div>
                  <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {classes.map((c) => {
                      const id = `fleet-class-${c.id}`;
                      const checked = classIds.includes(c.id);
                      return (
                        <li key={c.id} className="flex items-center gap-2">
                          <input
                            id={id}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleClassId(c.id)}
                            className="size-4 rounded border-border accent-primary"
                          />
                          <label htmlFor={id} className="cursor-pointer text-sm leading-tight">
                            <span className="font-mono font-semibold text-primary">{c.code}</span> {c.name}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>

                <fieldset className="min-w-0 space-y-3">
                  <legend className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Home hub</legend>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="xs" onClick={selectAllHubs} disabled={hubs.length === 0}>
                      Select all
                    </Button>
                    <Button type="button" variant="outline" size="xs" onClick={() => replaceQuery(classIds, [])} disabled={hubIds.length === 0}>
                      Clear hub
                    </Button>
                  </div>
                  <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {hubs.map((h) => {
                      const id = `fleet-hub-${h.id}`;
                      const checked = hubIds.includes(h.id);
                      return (
                        <li key={h.id} className="flex items-center gap-2">
                          <input
                            id={id}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleHubId(h.id)}
                            className="size-4 rounded border-border accent-primary"
                          />
                          <label htmlFor={id} className="cursor-pointer text-sm leading-tight">
                            {h.name}
                            {h.city ? <span className="text-muted-foreground"> · {h.city}</span> : null}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              </div>
          </div>
        </div>
      ) : null}

      {isPending ? <FleetPageSkeleton /> : null}

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center">
          <p className="text-sm font-medium text-destructive">
            {error instanceof Error ? error.message : 'Failed to load caravans'}
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-4 gap-2" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} aria-hidden />
            Retry
          </Button>
        </div>
      ) : null}

      {!isPending && !isError && (fleet?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Truck className="mb-3 size-10 text-muted-foreground/60" aria-hidden />
          <p className="font-medium text-foreground">No caravans returned</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Verify admin API access and fleet seed data.</p>
        </div>
      ) : null}

      {!isPending && !isError && (fleet?.length ?? 0) > 0 && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
          <p className="font-medium text-foreground">No units match these filters</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try clearing a filter or broadening class / hub selection.</p>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : null}

      {!isPending && !isError && filtered.length > 0 ? (
        <>
          <div className="grid gap-3 md:hidden">
            {filtered.map((row) => (
              <FleetCard key={row.id} row={row} listQuery={listQuery} />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-3 py-3 font-semibold text-foreground"> </th>
                  <th className="px-3 py-3 font-semibold text-foreground">Name</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Registration</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Year</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Class</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Home hub</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const thumb = row.thumbnail || row.caravan_class.media[0]?.url;
                  const detailHref = `/admin/caravans/${row.id}${listQuery}`;
                  return (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-b border-border/80 last:border-0 hover:bg-muted/20"
                      tabIndex={0}
                      aria-label={`View caravan ${row.name}`}
                      onClick={() => goToCaravanDetail(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          goToCaravanDetail(row.id);
                        }
                      }}
                    >
                      <td className="px-3 py-2">
                        <div className="relative h-12 w-14 overflow-hidden rounded-md border border-border bg-muted">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt="" className="h-full w-full object-cover" width={56} height={48} loading="lazy" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Truck className="size-5 opacity-40" aria-hidden />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium">
                        <Link
                          href={detailHref}
                          scroll={false}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                        <Link
                          href={detailHref}
                          scroll={false}
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.registration_no}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{row.year}</td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-xs font-bold text-primary">{row.caravan_class.code}</span>{' '}
                        <span className="text-muted-foreground">{row.caravan_class.name}</span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{row.home_hub_name || '—'}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge className={row.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}>
                            {row.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge className={row.is_available ? 'bg-sky-500/15 text-sky-300' : 'bg-muted text-muted-foreground'}>
                            {row.is_available ? 'Avail.' : 'Busy'}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </>
  );
}

export default function AdminCaravansPage() {
  return (
    <Suspense fallback={<FleetPageSkeleton />}>
      <AdminFleetCaravansContent />
    </Suspense>
  );
}
