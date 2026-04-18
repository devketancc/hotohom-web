'use client';

import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Truck } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { adminQueryKeys, listAdminCaravanClasses } from '@/services/admin.service';
import type { AdminCaravanClass } from '@/types/admin';

function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', className)}>{children}</span>
  );
}

function AmenityChips({ amenities }: { amenities: string[] }) {
  const max = 4;
  const shown = amenities.slice(0, max);
  const rest = amenities.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((a) => (
        <span
          key={a}
          className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          {a}
        </span>
      ))}
      {rest > 0 ? (
        <span className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          +{rest}
        </span>
      ) : null}
    </div>
  );
}

function CaravanClassCard({ row }: { row: AdminCaravanClass }) {
  const thumb = row.media[0]?.url;
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex gap-4">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote admin URLs; avoid next.config churn
            <img src={thumb} alt="" className="h-full w-full object-cover" width={96} height={80} loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Truck className="size-8 opacity-40" aria-hidden />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary">{row.code}</span>
            <span className="font-heading text-base font-semibold tracking-tight">{row.name}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Up to {row.full_capacity} guests
            {row.capacity_pets > 0 ? ` · ${row.capacity_pets} pets` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className={row.is_pet_friendly ? 'bg-sky-500/15 text-sky-300' : 'bg-muted text-muted-foreground'}>
              {row.is_pet_friendly ? 'Pet friendly' : 'No pets'}
            </Badge>
            <Badge className={row.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}>
              {row.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>
      {row.amenities.length > 0 ? (
        <div className="mt-3 border-t border-border/60 pt-3">
          <AmenityChips amenities={row.amenities} />
        </div>
      ) : null}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3 md:hidden" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/40" />
      ))}
    </div>
  );
}

export default function AdminCaravanClassesPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: adminQueryKeys.caravanClasses,
    queryFn: listAdminCaravanClasses,
    staleTime: 5 * 60 * 1000,
  });

  const rows = data ?? [];

  return (
    <>
      <AdminPageHeader
        title="Classes"
        description="Caravan classes define capacity, amenities, and catalog codes used across bookings and fleet filters."
      />

      {isPending ? (
        <>
          <CardSkeleton />
          <div className="mt-4 hidden md:block">
            <TableSkeleton />
          </div>
        </>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center">
          <p className="text-sm font-medium text-destructive">
            {error instanceof Error ? error.message : 'Failed to load caravan classes'}
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-4 gap-2" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} aria-hidden />
            Retry
          </Button>
        </div>
      ) : null}

      {!isPending && !isError && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Truck className="mb-3 size-10 text-muted-foreground/60" aria-hidden />
          <p className="font-medium text-foreground">No caravan classes returned</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Verify admin API access and seeded catalog data.</p>
        </div>
      ) : null}

      {!isPending && !isError && rows.length > 0 ? (
        <>
          <div className="grid gap-3 md:hidden">
            {rows.map((row) => (
              <CaravanClassCard key={row.id} row={row} />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-3 py-3 font-semibold text-foreground"> </th>
                  <th className="px-3 py-3 font-semibold text-foreground">Code</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Name</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Capacity</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Flags</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Amenities</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const thumb = row.media[0]?.url;
                  return (
                    <tr key={row.id} className="border-b border-border/80 last:border-0 hover:bg-muted/20">
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
                      <td className="px-3 py-3 font-mono text-xs font-bold text-primary">{row.code}</td>
                      <td className="px-3 py-3 font-medium">{row.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {row.full_capacity} guests
                        {row.capacity_pets > 0 ? ` · ${row.capacity_pets} pets` : ''}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge className={row.is_pet_friendly ? 'bg-sky-500/15 text-sky-300' : 'bg-muted text-muted-foreground'}>
                            {row.is_pet_friendly ? 'Pets' : 'No pets'}
                          </Badge>
                          <Badge className={row.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}>
                            {row.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </td>
                      <td className="max-w-xs px-3 py-3">
                        <AmenityChips amenities={row.amenities} />
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
