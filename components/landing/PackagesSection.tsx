'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import {
  PackageShowcaseCard,
  taglineForIndex,
} from '@/components/landing/PackageShowcaseCard';
import { Reveal } from '@/components/shared/Reveal';
import { locationService } from '@/services/location.service';
import { packageService, type PackageFilters } from '@/services/package.service';
import { formatCurrency } from '@/utils/format';

const FALLBACK_PACKAGE_IMAGE =
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1600&auto=format&fit=crop';

const ALL_HUBS = '';

const DURATION_RANGES = [
  { value: '', label: 'Any Duration' },
  { value: '1-3', label: '1 to 3 Days', minDays: 1, maxDays: 3 },
  { value: '4-7', label: '4 to 7 Days', minDays: 4, maxDays: 7 },
  { value: '8-14', label: '8 to 14 Days', minDays: 8, maxDays: 14 },
  { value: '15+', label: '15+ Days', minDays: 15 },
] as const;

const PRICE_RANGES = [
  { value: '', label: 'Any Price' },
  { value: 'u25', label: 'Under 25K', maxPrice: 25000 },
  { value: '25-50', label: '25K to 50K', minPrice: 25000, maxPrice: 50000 },
  { value: '50-100', label: '50K to 1L', minPrice: 50000, maxPrice: 100000 },
  { value: '100+', label: '1L+', minPrice: 100000 },
] as const;


export function PackagesSection() {
  const [selectedHubId, setSelectedHubId] = useState<string>(ALL_HUBS);
  const [selectedClassCode, setSelectedClassCode] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: hubs,
    isLoading: hubsLoading,
    isError: hubsError,
    refetch: refetchHubs,
  } = useQuery({
    queryKey: ['hubs'],
    queryFn: () => locationService.getHubs(),
  });

  const hubIds = useMemo(() => hubs?.map((h) => h.id) ?? [], [hubs]);
  const allHubsMode = selectedHubId === ALL_HUBS;
  const packagesEnabled = !allHubsMode ? !!selectedHubId : hubIds.length > 0;

  const activeFilters = useMemo<PackageFilters>(() => {
    const duration = DURATION_RANGES.find((r) => r.value === selectedDuration);
    const price = PRICE_RANGES.find((r) => r.value === selectedPrice);
    return {
      ...(selectedClassCode ? { class: selectedClassCode } : {}),
      ...(duration && 'minDays' in duration ? { minDays: duration.minDays } : {}),
      ...(duration && 'maxDays' in duration ? { maxDays: duration.maxDays } : {}),
      ...(price && 'minPrice' in price ? { minPrice: price.minPrice } : {}),
      ...(price && 'maxPrice' in price ? { maxPrice: price.maxPrice } : {}),
    };
  }, [selectedClassCode, selectedDuration, selectedPrice]);

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const allHubsQueryKey = ['packages', 'all', 'list', hubIds.join(',')] as const;

  const { data: allForHub, isLoading: allLoading, isError: allError, refetch: refetchAll } = useQuery({
    queryKey: allHubsMode ? allHubsQueryKey : (['packages', selectedHubId, 'list'] as const),
    queryFn: () =>
      allHubsMode
        ? packageService.listPackagesAcrossHubs(hubIds)
        : packageService.listPackages({ hub: selectedHubId }),
    enabled: packagesEnabled && !hubsLoading && !!hubs?.length,
  });

  const {
    data: filtered,
    isLoading: filteredLoading,
    isError: filteredError,
    refetch: refetchFiltered,
  } = useQuery({
    queryKey: allHubsMode
      ? (['packages', 'all', 'filtered', hubIds.join(','), activeFilters] as const)
      : (['packages', selectedHubId, 'filtered', activeFilters] as const),
    queryFn: () =>
      allHubsMode
        ? packageService.listPackagesAcrossHubs(hubIds, activeFilters)
        : packageService.listPackages({ hub: selectedHubId, ...activeFilters }),
    enabled: packagesEnabled && hasActiveFilters && !hubsLoading && !!hubs?.length,
  });

  const classOptions = useMemo(() => {
    const results = allForHub?.data?.results ?? [];
    const codes = new Set<string>();
    for (const p of results) {
      if (p.caravan_class_code) codes.add(p.caravan_class_code);
    }
    return Array.from(codes).sort();
  }, [allForHub]);

  const displayPackages = useMemo(() => {
    if (!packagesEnabled) return [];
    if (hasActiveFilters) return filtered?.data?.results ?? [];
    return allForHub?.data?.results ?? [];
  }, [packagesEnabled, hasActiveFilters, filtered, allForHub]);

  const listLoading =
    packagesEnabled && (hasActiveFilters ? filteredLoading : allLoading);
  const listError = hasActiveFilters ? filteredError : allError;
  const refetchList = hasActiveFilters ? refetchFiltered : refetchAll;

  const updateScrollProgress = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollProgress(max <= 0 ? 1 : el.scrollLeft / max);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollProgress();
    el.addEventListener('scroll', updateScrollProgress, { passive: true });
    const ro = new ResizeObserver(updateScrollProgress);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollProgress);
      ro.disconnect();
    };
  }, [updateScrollProgress, displayPackages.length]);

  const scrollCarousel = useCallback((direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.75, 640);
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  }, []);

  return (
    <section id="packages" suppressHydrationWarning className="section-ambient-warm relative min-h-screen overflow-hidden bg-stitch-background py-32 md:py-48">
      {!mounted ? null : (
        <>
          {/* Cinematic Top Blending */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[30rem] bg-gradient-to-b from-stitch-background via-stitch-background/80 to-transparent" />
          {/* Cinematic Bottom Blending */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-48 bg-gradient-to-t from-stitch-background to-transparent" />
          
          <div suppressHydrationWarning className="relative z-30 mx-auto max-w-[1920px] px-6 md:px-12">
            {/* Editorial Header & Filters Row */}
            <div suppressHydrationWarning className="mb-20 flex flex-col items-end justify-between gap-12 lg:flex-row lg:items-end">
          <Reveal as="div" className="flex flex-col items-start text-left">
            <span className="mb-6 font-headline text-[9px] font-bold uppercase tracking-[0.5em] text-stitch-primary-container/60">
              Signature Journeys
            </span>
            <h2 className="font-headline text-5xl font-bold leading-[1] tracking-[-0.04em] text-white md:text-7xl">
              Handpicked <br /> Escapes
            </h2>
            <p className="mt-8 max-w-lg font-body text-base leading-relaxed text-white/40 md:text-lg">
              A curated anthology of experiences—each framed like a film still, crafted for those who find luxury in the quiet choosing of their own horizon.
            </p>
          </Reveal>

          {/* Luxury Dropdown Filters (Refined) */}
          <Reveal as="div" delay={0.2} className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <select
                value={selectedHubId}
                onChange={(e) => {
                  setSelectedHubId(e.target.value);
                  setSelectedClassCode('');
                  setSelectedDuration('');
                  setSelectedPrice('');
                }}
                className="appearance-none rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-4 pr-12 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 outline-none backdrop-blur-3xl transition-all duration-700 hover:border-white/10 hover:bg-white/[0.06] hover:text-white/70 focus:border-stitch-primary-container/30 focus:text-white"
              >
                <option value={ALL_HUBS} className="bg-stitch-background">All Locations</option>
                {hubs?.map((h) => (
                  <option key={h.id} value={h.id} className="bg-stitch-background">
                    {h.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-hover:text-white/40">
                <svg className="size-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>

            <div className="relative group">
              <select
                value={selectedClassCode}
                onChange={(e) => setSelectedClassCode(e.target.value)}
                className="appearance-none rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-4 pr-12 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 outline-none backdrop-blur-3xl transition-all duration-700 hover:border-white/10 hover:bg-white/[0.06] hover:text-white/70 focus:border-stitch-primary-container/30 focus:text-white"
              >
                <option value="" className="bg-stitch-background">All Classes</option>
                {classOptions.map((code) => (
                  <option key={code} value={code} className="bg-stitch-background">
                    Class {code}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-hover:text-white/40">
                <svg className="size-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>

            <div className="relative group">
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="appearance-none rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-4 pr-12 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 outline-none backdrop-blur-3xl transition-all duration-700 hover:border-white/10 hover:bg-white/[0.06] hover:text-white/70 focus:border-stitch-primary-container/30 focus:text-white"
              >
                {DURATION_RANGES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-stitch-background">
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-hover:text-white/40">
                <svg className="size-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>

            <div className="relative group">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="appearance-none rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-4 pr-12 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 outline-none backdrop-blur-3xl transition-all duration-700 hover:border-white/10 hover:bg-white/[0.06] hover:text-white/70 focus:border-stitch-primary-container/30 focus:text-white"
              >
                {PRICE_RANGES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-stitch-background">
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-hover:text-white/40">
                <svg className="size-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Cinematic Carousel Container */}
        <div className="relative w-full overflow-visible py-8">
          {hubsError && (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center">
              <AlertCircle className="size-10 text-red-400" />
              <p className="font-body text-stitch-on-surface-variant">Could not load hubs.</p>
              <button
                type="button"
                onClick={() => refetchHubs()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors hover:border-stitch-primary hover:text-stitch-primary"
              >
                <RefreshCw className="size-4" />
                Retry
              </button>
            </div>
          )}

          {!hubsLoading && !hubsError && !hubs?.length && (
            <p className="flex min-h-[320px] items-center justify-center text-center font-body text-stitch-on-surface-variant">
              No hubs available yet.
            </p>
          )}

          {listError && packagesEnabled && (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center">
              <AlertCircle className="size-10 text-red-400" />
              <p className="font-body text-stitch-on-surface-variant">Could not load packages.</p>
              <button
                type="button"
                onClick={() => refetchList()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors hover:border-stitch-primary hover:text-stitch-primary"
              >
                <RefreshCw className="size-4" />
                Retry
              </button>
            </div>
          )}

          {listLoading && packagesEnabled && !listError && (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <Loader2 className="size-10 animate-spin text-stitch-primary" />
              <span className="font-body text-sm font-medium text-stitch-on-surface-variant">Curating journeys…</span>
            </div>
          )}

          {!listLoading && !listError && packagesEnabled && displayPackages.length === 0 && (
            <p className="flex min-h-[320px] items-center justify-center px-4 text-center font-body text-stitch-on-surface-variant">
              No packages match these filters.
            </p>
          )}

          {!listLoading && !listError && displayPackages.length > 0 && (
            <div
              ref={scrollerRef}
              className="flex snap-x snap-mandatory items-center gap-10 overflow-x-auto overflow-y-visible pb-12 pt-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollBehavior: 'smooth' }}
            >
              {displayPackages.map((pkg, index) => (
                <PackageShowcaseCard
                  key={pkg.id}
                  href={`/packages/${pkg.id}`}
                  title={pkg.name}
                  duration={`${pkg.duration_days} ${pkg.duration_days === 1 ? 'day' : 'days'}`}
                  location={pkg.home_hub_name}
                  tag={`Class ${pkg.caravan_class_code}`}
                  price={
                    Number.isFinite(Number.parseFloat(pkg.base_price))
                      ? formatCurrency(Number.parseFloat(pkg.base_price))
                      : '—'
                  }
                  image={pkg.thumbnail_url?.trim() ? pkg.thumbnail_url : FALLBACK_PACKAGE_IMAGE}
                  tagline={taglineForIndex(index)}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Floating Navigation Controls */}
          {!listLoading && !listError && displayPackages.length > 0 && (
            <>
              <div className="pointer-events-none absolute left-0 top-1/2 z-40 flex w-full -translate-y-1/2 items-center justify-between px-4 md:px-8">
                <button
                  type="button"
                  aria-label="Previous journeys"
                  onClick={() => scrollCarousel(-1)}
                  className="group pointer-events-auto flex size-14 items-center justify-center rounded-full border border-white/5 bg-black/20 text-white backdrop-blur-xl transition-all duration-500 hover:border-stitch-primary-container/40 hover:bg-black/40 hover:shadow-glow-gold disabled:opacity-0"
                  disabled={scrollProgress <= 0.01}
                >
                  <ChevronLeft className="size-6 transition-transform duration-500 group-hover:-translate-x-1" />
                </button>
                <button
                  type="button"
                  aria-label="Next journeys"
                  onClick={() => scrollCarousel(1)}
                  className="group pointer-events-auto flex size-14 items-center justify-center rounded-full border border-white/5 bg-black/20 text-white backdrop-blur-xl transition-all duration-500 hover:border-stitch-primary-container/40 hover:bg-black/40 hover:shadow-glow-gold disabled:opacity-0"
                  disabled={scrollProgress >= 0.99}
                >
                  <ChevronRight className="size-6 transition-transform duration-500 group-hover:translate-x-1" />
                </button>
              </div>
            </>
          )}

          {/* Interaction Feedback Overlay removed per request */}

          {/* Background Atmospheric Elements */}
          <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 opacity-20 blur-[120px]" aria-hidden>
             <div className="size-[600px] rounded-full bg-stitch-primary-container/10" />
          </div>
          <div className="pointer-events-none absolute right-0 top-1/3 opacity-10 blur-[150px]" aria-hidden>
             <div className="size-[800px] rounded-full bg-stitch-primary-container/15" />
          </div>
        </div>
      </div>
        </>
      )}
    </section>

  );
}
