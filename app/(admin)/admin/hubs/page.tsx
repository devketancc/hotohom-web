'use client';

import { useQuery } from '@tanstack/react-query';
import { ExternalLink, MapPin, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { adminQueryKeys, listAdminHubs } from '@/services/admin.service';
import type { AdminHub } from '@/types/admin';

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
        active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'
      )}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function HubCard({ hub }: { hub: AdminHub }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold tracking-tight">{hub.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hub.city}
            {hub.state ? `, ${hub.state}` : ''}
          </p>
        </div>
        <StatusPill active={hub.is_active} />
      </div>
      {hub.formatted_address ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{hub.formatted_address}</p>
      ) : null}
      {hub.google_maps_url ? (
        <a
          href={hub.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ExternalLink className="size-4 shrink-0" aria-hidden />
          Open in Maps
        </a>
      ) : null}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/50" />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3 md:hidden" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl bg-muted/40" />
      ))}
    </div>
  );
}

export default function AdminHubsPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: adminQueryKeys.hubs,
    queryFn: listAdminHubs,
    staleTime: 5 * 60 * 1000,
  });

  const hubs = data ?? [];

  return (
    <>
      <AdminPageHeader
        title="Hubs"
        description="Operational hubs used for pickups, fleet staging, and regional filters across the admin console."
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
          <p className="text-sm font-medium text-destructive">{error instanceof Error ? error.message : 'Failed to load hubs'}</p>
          <Button type="button" variant="outline" size="sm" className="mt-4 gap-2" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} aria-hidden />
            Retry
          </Button>
        </div>
      ) : null}

      {!isPending && !isError && hubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <MapPin className="mb-3 size-10 text-muted-foreground/60" aria-hidden />
          <p className="font-medium text-foreground">No hubs returned</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Check API access or create hub locations in the backend.</p>
        </div>
      ) : null}

      {!isPending && !isError && hubs.length > 0 ? (
        <>
          <div className="grid gap-3 md:hidden">
            {hubs.map((hub) => (
              <HubCard key={hub.id} hub={hub} />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 font-semibold text-foreground">City / State</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Address</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hubs.map((hub) => (
                  <tr key={hub.id} className="border-b border-border/80 last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{hub.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {hub.city}
                      {hub.state ? `, ${hub.state}` : ''}
                    </td>
                    <td className="max-w-md px-4 py-3 text-muted-foreground">{hub.formatted_address || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusPill active={hub.is_active} />
                    </td>
                    <td className="px-4 py-3">
                      {hub.google_maps_url ? (
                        <a
                          href={hub.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                        >
                          <ExternalLink className="size-3.5" aria-hidden />
                          Maps
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </>
  );
}
