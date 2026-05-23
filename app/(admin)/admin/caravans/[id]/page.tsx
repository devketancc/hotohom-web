'use client';

import type { ReactNode } from 'react';
import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { adminQueryKeys, getAdminFleetCaravanById } from '@/services/admin.service';
import type { AdminCaravanClassMedia, AdminFleetCaravanDetail } from '@/types/admin';

function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', className)}>{children}</span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AmenityChips({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">None listed</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((a) => (
        <span
          key={a}
          className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground"
        >
          {a}
        </span>
      ))}
    </div>
  );
}

function MediaGrid({ items, label }: { items: AdminCaravanClassMedia[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((m) => (
          <a
            key={m.id}
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt="" className="h-full w-full object-cover" width={320} height={180} loading="lazy" />
          </a>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-10 w-40 animate-pulse rounded-md bg-muted/50" />
      <div className="h-48 animate-pulse rounded-xl bg-muted/40" />
      <div className="h-40 animate-pulse rounded-xl bg-muted/40" />
    </div>
  );
}

function AdminCaravanDetailInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const backHref = useMemo(() => {
    const q = searchParams.toString();
    return q ? `/admin/caravans?${q}` : '/admin/caravans';
  }, [searchParams]);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: adminQueryKeys.caravanDetail(id),
    queryFn: () => getAdminFleetCaravanById(id),
    enabled: Boolean(id),
    staleTime: 3 * 60 * 1000,
  });

  const detail: AdminFleetCaravanDetail | undefined = data;

  const combinedMedia = useMemo(() => {
    if (!detail) return { unit: [] as AdminCaravanClassMedia[], classOnly: [] as AdminCaravanClassMedia[] };
    const unit = detail.media;
    const classMedia = detail.caravan_class.media;
    const unitUrls = new Set(unit.map((m) => m.url));
    const classOnly = classMedia.filter((m) => !unitUrls.has(m.url));
    return { unit, classOnly };
  }, [detail]);

  if (!id) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">Invalid caravan link</p>
        <Link href="/admin/caravans" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4 inline-flex')}>
          Back to fleet
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href={backHref}
          scroll={false}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to fleet
        </Link>
      </div>

      {isPending ? <DetailSkeleton /> : null}

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center">
          <p className="text-sm font-medium text-destructive">
            {error instanceof Error ? error.message : 'Failed to load caravan'}
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-4 gap-2" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} aria-hidden />
            Retry
          </Button>
          <div className="mt-4">
            <Link href={backHref} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'inline-flex')}>
              Back to fleet
            </Link>
          </div>
        </div>
      ) : null}

      {!isPending && !isError && detail ? (
        <div className="space-y-6">
          <AdminPageHeader
            title={detail.name}
            description={`${detail.registration_no} · ${detail.year}`}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/caravans/${detail.id}/calendar${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  View Calendar
                </Link>
                <Badge className={detail.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}>
                  {detail.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge className={detail.is_available ? 'bg-sky-500/15 text-sky-300' : 'bg-muted text-muted-foreground'}>
                  {detail.is_available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            }
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Home hub">
              {detail.home_hub ? (
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</dt>
                    <dd className="font-medium">{detail.home_hub.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">City</dt>
                    <dd className="text-muted-foreground">{detail.home_hub.city || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hub ID</dt>
                    <dd className="font-mono text-xs text-muted-foreground">{detail.home_hub.id}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">No hub assigned</p>
              )}
            </Section>

            <Section title="Caravan class">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-mono text-lg font-bold text-primary">{detail.caravan_class.code}</span>{' '}
                  <span className="font-semibold">{detail.caravan_class.name}</span>
                </p>
                <p className="text-muted-foreground">{detail.caravan_class.description}</p>
                <p className="text-xs text-muted-foreground">
                  Capacity {detail.caravan_class.full_capacity}
                  {detail.caravan_class.capacity_pets > 0 ? ` · up to ${detail.caravan_class.capacity_pets} pets` : ''}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge
                    className={
                      detail.caravan_class.is_pet_friendly ? 'bg-sky-500/15 text-sky-300' : 'bg-muted text-muted-foreground'
                    }
                  >
                    {detail.caravan_class.is_pet_friendly ? 'Pet friendly class' : 'No pets class'}
                  </Badge>
                  <Badge
                    className={detail.caravan_class.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}
                  >
                    {detail.caravan_class.is_active ? 'Class active' : 'Class inactive'}
                  </Badge>
                </div>
              </div>
            </Section>
          </div>

          <Section title="Amenities">
            <p className="mb-3 text-xs text-muted-foreground">Combined list (class + unit extras)</p>
            <AmenityChips items={detail.all_amenities} />
            {detail.extra_amenities.length > 0 ? (
              <div className="mt-4 border-t border-border/60 pt-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Unit extras only</p>
                <AmenityChips items={detail.extra_amenities} />
              </div>
            ) : null}
          </Section>

          {(combinedMedia.unit.length > 0 || combinedMedia.classOnly.length > 0) ? (
            <Section title="Media">
              <div className="space-y-6">
                {combinedMedia.unit.length > 0 ? <MediaGrid items={combinedMedia.unit} label="Unit" /> : null}
                {combinedMedia.classOnly.length > 0 ? (
                  <MediaGrid items={combinedMedia.classOnly} label="From class" />
                ) : null}
              </div>
            </Section>
          ) : null}

          <Section title="Record">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Caravan ID</dt>
                <dd className="font-mono text-xs text-muted-foreground">{detail.id}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</dt>
                <dd className="text-muted-foreground">{detail.created_at || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Updated</dt>
                <dd className="text-muted-foreground">{detail.updated_at || '—'}</dd>
              </div>
            </dl>
          </Section>
        </div>
      ) : null}
    </>
  );
}

export default function AdminCaravanDetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <AdminCaravanDetailInner />
    </Suspense>
  );
}
