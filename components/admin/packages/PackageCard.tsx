'use client';

import Link from 'next/link';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { PackageStatusBadge } from '@/components/admin/packages/PackageStatusBadge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';
import type { AdminPackage } from '@/types/adminPackage';

export function PackageCard({
  pkg,
  onDeactivate,
  isDeactivating,
}: {
  pkg: AdminPackage;
  onDeactivate: () => void;
  isDeactivating?: boolean;
}) {
  const price = Number.parseFloat(pkg.base_price);

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-base font-bold tracking-tight text-foreground sm:text-lg">{pkg.name}</p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {pkg.home_hub_name} · Class {pkg.caravan_class_code} · {pkg.duration_days}{' '}
                {pkg.duration_days === 1 ? 'day' : 'days'}
              </p>
            </div>
            <PackageStatusBadge isActive={pkg.is_active} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
            <span>
              From{' '}
              <span className="font-medium text-foreground">
                {Number.isFinite(price) ? formatCurrency(price) : '—'}
              </span>
            </span>
            <span>
              <span className="font-medium text-foreground">{pkg.included_km.toLocaleString('en-IN')}</span> km
              included
            </span>
            <span>
              <span className="font-medium text-foreground">{pkg.days?.length ?? 0}</span> itinerary days
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-muted/15 px-4 py-3 sm:flex-col sm:border-l sm:border-t-0 sm:py-4">
          <Link
            href={`/admin/packages/${pkg.id}/edit`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1')}
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Link>
          {pkg.is_active && (
            <Link
              href={`/packages/${pkg.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1')}
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Preview
            </Link>
          )}
          {pkg.is_active && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-destructive hover:text-destructive"
              disabled={isDeactivating}
              onClick={onDeactivate}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Deactivate
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
