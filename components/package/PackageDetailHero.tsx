'use client';

import { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TravelPackage } from '@/types/package';
import { packageGalleryUrls, packageBasePriceNumber } from '@/utils/packageGallery';
import { formatCurrency } from '@/utils/format';

type PackageDetailHeroProps = {
  pkg: TravelPackage;
  className?: string;
};

export function PackageDetailHero({ pkg, className }: PackageDetailHeroProps) {
  const gallery = packageGalleryUrls(pkg);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeUrl = gallery[activeIndex] ?? gallery[0];
  const price = packageBasePriceNumber(pkg.base_price);

  return (
    <section className={cn('relative', className)}>
      <div className="relative aspect-[21/9] min-h-[280px] max-h-[520px] w-full overflow-hidden rounded-2xl border border-white/10 md:rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote gallery */}
        <img
          src={activeUrl}
          alt={pkg.name}
          className="h-full w-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stitch-background via-stitch-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-stitch-primary font-headline">
                Curated package
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-stitch-on-background font-headline md:text-5xl lg:text-6xl">
                {pkg.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-stitch-on-surface-variant font-body">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-stitch-primary shrink-0" aria-hidden />
                  {pkg.home_hub_name}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-stitch-primary shrink-0" aria-hidden />
                  {pkg.duration_days} {pkg.duration_days === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
            {price != null && (
              <div className="glass-card rounded-2xl border border-white/10 px-5 py-4 text-right shrink-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-stitch-on-surface-variant font-headline">
                  From
                </p>
                <p className="text-2xl font-bold text-stitch-primary font-headline md:text-3xl">
                  {formatCurrency(price)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {gallery.length > 1 && (
        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-custom"
          role="tablist"
          aria-label="Package photos"
        >
          {gallery.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Photo ${i + 1} of ${gallery.length}`}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all md:h-20 md:w-28',
                i === activeIndex
                  ? 'border-stitch-primary ring-2 ring-stitch-primary/30'
                  : 'border-white/10 opacity-70 hover:opacity-100'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
