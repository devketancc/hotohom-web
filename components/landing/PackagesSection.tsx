'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import {
  PackageShowcaseCard,
  sizeForIndex,
  taglineForIndex,
} from '@/components/landing/PackageShowcaseCard';
import { Reveal } from '@/components/shared/Reveal';
import { locationService } from '@/services/location.service';
import { packageService } from '@/services/package.service';
import { formatCurrency } from '@/utils/format';

const FALLBACK_PACKAGE_IMAGE =
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1600&auto=format&fit=crop';

const ALL_HUBS = '';

const selectClass =
  'rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface-1)]/55 px-4 py-2.5 text-sm font-medium text-stitch-on-background outline-none transition-[border-color,box-shadow] duration-500 focus:border-[color:var(--color-gold)]/50 focus:ring-[3px] focus:ring-[color:var(--color-gold)]/15 disabled:cursor-not-allowed disabled:opacity-50';

export function PackagesSection() {
  const [selectedHubId, setSelectedHubId] = useState<string>(ALL_HUBS);
  const [selectedClassCode, setSelectedClassCode] = useState('');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

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
      ? (['packages', 'all', selectedClassCode, hubIds.join(',')] as const)
      : (['packages', selectedHubId, selectedClassCode] as const),
    queryFn: () =>
      allHubsMode
        ? packageService.listPackagesAcrossHubs(hubIds, { class: selectedClassCode })
        : packageService.listPackages({ hub: selectedHubId, class: selectedClassCode }),
    enabled: packagesEnabled && !!selectedClassCode && !hubsLoading && !!hubs?.length,
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
    if (selectedClassCode) return filtered?.data?.results ?? [];
    return allForHub?.data?.results ?? [];
  }, [packagesEnabled, selectedClassCode, filtered, allForHub]);

  const listLoading =
    packagesEnabled && (selectedClassCode ? filteredLoading : allLoading);
  const listError = selectedClassCode ? filteredError : allError;
  const refetchList = selectedClassCode ? refetchFiltered : refetchAll;

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
    <section id="packages" className="section-ambient-warm bg-stitch-background py-32 md:py-40 overflow-hidden">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Editorial column */}
          <div className="flex flex-col justify-between gap-12 lg:col-span-4 lg:min-h-[min(70vh,600px)]">
            <div>
              <Reveal as="div">
                <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
                  Signature Journeys
                </span>
                <h2 className="mt-5 font-headline text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-stitch-on-background md:text-5xl lg:text-[3.25rem]">
                  Handpicked Escapes
                </h2>
                <p className="mt-8 max-w-md font-body text-base leading-relaxed text-stitch-on-surface-variant/85 md:text-[17px]">
                  A living gallery of journeys—each framed like a travel film still, each route written with room for
                  awe, pause, and the quiet luxury of choosing your own horizon.
                </p>
              </Reveal>

              <Reveal as="div" delay={0.12} className="mt-10">
                <div className="surface-glass rounded-2xl p-4 md:p-5">
                  <p className="font-headline text-[10px] font-semibold uppercase tracking-[0.28em] text-stitch-on-surface-variant/60">
                    Refine
                  </p>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                    <label className="flex min-w-0 flex-1 flex-col gap-2 font-headline text-[10px] font-semibold uppercase tracking-[0.2em] text-stitch-on-surface-variant/75">
                      Hub
                      <select
                        className={selectClass}
                        value={selectedHubId}
                        onChange={(e) => {
                          setSelectedHubId(e.target.value);
                          setSelectedClassCode('');
                        }}
                        disabled={hubsLoading || !!hubsError || !hubs?.length}
                      >
                        <option value={ALL_HUBS}>All hubs</option>
                        {hubs?.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex min-w-0 flex-1 flex-col gap-2 font-headline text-[10px] font-semibold uppercase tracking-[0.2em] text-stitch-on-surface-variant/75">
                      Fleet class
                      <select
                        className={selectClass}
                        value={selectedClassCode}
                        onChange={(e) => setSelectedClassCode(e.target.value)}
                        disabled={!packagesEnabled || listLoading || classOptions.length === 0}
                      >
                        <option value="">All classes</option>
                        {classOptions.map((code) => (
                          <option key={code} value={code}>
                            Class {code}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal as="div" delay={0.2} className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous journeys"
                  onClick={() => scrollCarousel(-1)}
                  className="inline-flex size-12 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface-1)]/40 text-stitch-on-background shadow-luxury-sm transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-stitch-primary-container/35 hover:bg-stitch-primary-container/10 hover:shadow-glow-gold disabled:opacity-35 disabled:hover:translate-y-0"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next journeys"
                  onClick={() => scrollCarousel(1)}
                  className="inline-flex size-12 items-center justify-center rounded-full border border-stitch-primary-container/30 bg-stitch-primary-container/90 font-headline text-[10px] font-semibold uppercase tracking-[0.2em] text-stitch-on-primary-container shadow-[0_12px_40px_-18px_rgba(229,185,92,0.55)] transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] disabled:opacity-35 disabled:hover:translate-y-0"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between font-headline text-[10px] font-medium uppercase tracking-[0.28em] text-stitch-on-surface-variant/55">
                  <span>Scroll</span>
                  <span className="tabular-nums text-stitch-primary-container/80">
                    {displayPackages.length > 0
                      ? `${Math.round(scrollProgress * 100)}%`
                      : '—'}
                  </span>
                </div>
                <div className="h-px w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-stitch-primary-container/25 via-stitch-primary-container to-stitch-primary-container/40 transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(8, scrollProgress * 100)}%` }}
                  />
                </div>
              </div>
            </Reveal>
          </div>

          {/* Cinematic carousel */}
          <div className="relative min-h-[min(68vh,560px)] lg:col-span-8">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-stitch-background via-stitch-background/80 to-transparent md:w-24"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-stitch-background to-transparent"
              aria-hidden
            />

            {hubsError && (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center">
                <AlertCircle className="size-10 text-red-400" />
                <p className="text-stitch-on-surface-variant font-body">Could not load hubs.</p>
                <button
                  type="button"
                  onClick={() => refetchHubs()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wider hover:border-stitch-primary hover:text-stitch-primary transition-colors"
                >
                  <RefreshCw className="size-4" />
                  Retry
                </button>
              </div>
            )}

            {!hubsLoading && !hubsError && !hubs?.length && (
              <p className="flex min-h-[320px] items-center justify-center text-center text-stitch-on-surface-variant font-body">
                No hubs available yet.
              </p>
            )}

            {listError && packagesEnabled && (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center">
                <AlertCircle className="size-10 text-red-400" />
                <p className="text-stitch-on-surface-variant font-body">Could not load packages.</p>
                <button
                  type="button"
                  onClick={() => refetchList()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wider hover:border-stitch-primary hover:text-stitch-primary transition-colors"
                >
                  <RefreshCw className="size-4" />
                  Retry
                </button>
              </div>
            )}

            {listLoading && packagesEnabled && !listError && (
              <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
                <Loader2 className="size-10 animate-spin text-stitch-primary" />
                <span className="text-sm font-medium text-stitch-on-surface-variant font-body">Curating journeys…</span>
              </div>
            )}

            {!listLoading && !listError && packagesEnabled && displayPackages.length === 0 && (
              <p className="flex min-h-[320px] items-center justify-center text-center text-stitch-on-surface-variant font-body px-4">
                No packages match these filters.
              </p>
            )}

            {!listLoading && !listError && displayPackages.length > 0 && (
              <div
                ref={scrollerRef}
                className="flex h-full snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible pb-8 pl-1 pr-6 pt-4 md:gap-7 md:pl-2 md:pr-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
                    size={sizeForIndex(index)}
                    index={index}
                  />
                ))}
                <div className="w-4 shrink-0 snap-none md:w-12" aria-hidden />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
