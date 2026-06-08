'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { UseFormWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatStayType, formatStopType } from '@/utils/packageLabels';
import { formatCurrency } from '@/utils/format';
import type { PackageWizardFormValues } from '@/lib/packages/schema';

export function PackageWizardReview({
  watch,
  mode,
  packageId,
  hubName,
  classLabel,
}: {
  watch: UseFormWatch<PackageWizardFormValues>;
  mode: 'create' | 'edit';
  packageId?: string;
  hubName?: string;
  classLabel?: string;
}) {
  const values = watch();
  const price = Number.parseFloat(values.base_price);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Review & publish</CardTitle>
        <CardDescription>
          Confirm details before {mode === 'create' ? 'creating' : 'saving'} the package.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        {mode === 'edit' && packageId && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <Link
              href={`/packages/${packageId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-4" aria-hidden />
              Open customer preview
            </Link>
          </div>
        )}

        <section>
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Basics</h3>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{values.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{values.is_active ? 'Active' : 'Inactive'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Hub</dt>
              <dd className="font-medium">{hubName || values.home_hub || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Class</dt>
              <dd className="font-medium">{classLabel || values.caravan_class || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-medium">
                {values.duration_days} {Number(values.duration_days) === 1 ? 'day' : 'days'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Included km</dt>
              <dd className="font-medium">{Number(values.included_km).toLocaleString('en-IN')} km</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Base price</dt>
              <dd className="font-medium">{Number.isFinite(price) ? formatCurrency(price) : '—'}</dd>
            </div>
          </dl>
          {values.description?.trim() ? (
            <p className="mt-3 text-muted-foreground leading-relaxed">{values.description}</p>
          ) : null}
        </section>

        <section>
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Media</h3>
          <p className="text-muted-foreground">
            {values.highlights?.length ?? 0} highlights · {values.images?.length ?? 0} gallery images
            {values.thumbnail_url?.trim() ? ' · thumbnail set' : ''}
          </p>
        </section>

        <section>
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
            Itinerary ({values.days?.length ?? 0} days)
          </h3>
          <ul className="space-y-2">
            {(values.days ?? [])
              .slice()
              .sort((a, b) => Number(a.day_number) - Number(b.day_number))
              .map((d) => (
                <li key={d.day_number} className="rounded-lg bg-muted/30 px-3 py-2">
                  <span className="font-medium">
                    Day {d.day_number}: {d.title}
                  </span>
                  {d.stay_type !== 'none' ? (
                    <span className="ml-2 text-muted-foreground">· {formatStayType(d.stay_type)}</span>
                  ) : null}
                </li>
              ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
            Route ({values.stops?.length ?? 0} stops)
          </h3>
          <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
            {(values.stops ?? [])
              .slice()
              .sort((a, b) => Number(a.order) - Number(b.order))
              .map((s, i) => (
                <li key={i}>
                  <span className="text-foreground font-medium">{formatStopType(s.stop_type)}</span>
                  {s.day_number ? ` (Day ${s.day_number})` : ''}
                  {s.title?.trim() ? ` — ${s.title}` : ''}
                </li>
              ))}
          </ol>
        </section>
      </CardContent>
    </Card>
  );
}
