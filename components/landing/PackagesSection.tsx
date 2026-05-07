'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { PackageCard } from '@/components/landing/PackageCard';
import { Reveal } from '@/components/shared/Reveal';
import { RevealStagger, RevealItem } from '@/components/shared/RevealStagger';
import { locationService } from '@/services/location.service';
import { packageService } from '@/services/package.service';
import { formatCurrency } from '@/utils/format';

const FALLBACK_PACKAGE_IMAGE =
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200&auto=format&fit=crop';

const ALL_HUBS = '';

const selectClass =
  'rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm font-medium text-stitch-on-background outline-none transition-colors focus:border-stitch-primary focus:ring-1 focus:ring-stitch-primary disabled:cursor-not-allowed disabled:opacity-50';

export function PackagesSection() {
  /** Empty string = all hubs (default). */
  const [selectedHubId, setSelectedHubId] = useState<string>(ALL_HUBS);
  const [selectedClassCode, setSelectedClassCode] = useState('');

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

  return (
    <section id="packages" className="section-ambient-warm py-40 bg-stitch-background overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between mb-16 lg:mb-24">
          <Reveal as="div" className="max-w-2xl">
            <span className="text-stitch-primary uppercase tracking-[0.4em] text-xs font-black mb-6 block font-headline">
              Signature Journeys
            </span>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight font-headline">Handpicked Escapes</h2>
            <p className="mt-6 text-stitch-on-surface-variant text-lg font-body">
              Each package is designed by travel experts to ensure you see the hidden gems of every region.
            </p>
          </Reveal>

          <Reveal as="div" delay={0.1} className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-widest text-stitch-on-surface-variant font-headline">
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
            <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-widest text-stitch-on-surface-variant font-headline">
              Caravan class
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
          </Reveal>
        </div>

        {hubsError && (
          <div className="mb-12 flex flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center">
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
          <p className="text-center text-stitch-on-surface-variant font-body py-16">No hubs available yet.</p>
        )}

        {listError && packagesEnabled && (
          <div className="mb-12 flex flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center">
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
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <Loader2 className="size-10 animate-spin text-stitch-primary" />
            <span className="text-sm font-medium text-stitch-on-surface-variant font-body">Loading packages…</span>
          </div>
        )}

        {!listLoading && !listError && packagesEnabled && displayPackages.length === 0 && (
          <p className="text-center text-stitch-on-surface-variant font-body py-16">
            No packages match these filters.
          </p>
        )}

        {!listLoading && !listError && displayPackages.length > 0 && (
          <RevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {displayPackages.map((pkg) => (
              <RevealItem key={pkg.id}>
                <PackageCard
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
                />
              </RevealItem>
            ))}
          </RevealStagger>
        )}
      </div>
    </section>
  );
}
