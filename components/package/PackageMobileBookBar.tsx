'use client';

import type { TravelPackage } from '@/types/package';
import { packageBasePriceNumber } from '@/utils/packageGallery';
import { formatCurrency } from '@/utils/format';

type PackageMobileBookBarProps = {
  pkg: TravelPackage;
  onChooseDates: () => void;
};

export function PackageMobileBookBar({ pkg, onChooseDates }: PackageMobileBookBarProps) {
  const price = packageBasePriceNumber(pkg.base_price);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-stitch-background/95 backdrop-blur-xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      role="region"
      aria-label="Book this package"
    >
      <div className="mx-auto flex max-w-screen-lg items-center justify-between gap-4">
        <div className="min-w-0">
          {price != null ? (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-stitch-on-surface-variant font-headline">
                From
              </p>
              <p className="text-lg font-bold text-stitch-primary font-headline truncate">
                {formatCurrency(price)}
              </p>
            </>
          ) : (
            <p className="text-sm font-bold text-stitch-on-background font-headline truncate">{pkg.name}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onChooseDates}
          className="shrink-0 rounded-xl bg-stitch-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-stitch-on-primary hover:brightness-110 transition-all"
        >
          Choose dates
        </button>
      </div>
    </div>
  );
}
