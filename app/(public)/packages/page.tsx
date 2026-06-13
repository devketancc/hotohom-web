'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  LayoutGrid,
  List,
  Loader2,
  Moon,
  Search,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { locationService } from '@/services/location.service';
import { packageService } from '@/services/package.service';
import type { TravelPackage } from '@/types/package';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200&auto=format&fit=crop';

const CLASS_NAMES: Record<string, string> = {
  T: 'Traveller',
  U: 'Urbania',
  M: 'Monarch',
  V: 'Viceroy',
};

const PER_PAGE = 9;

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'duration';

function inr(value: string | number): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString('en-IN') : '—';
}

function nightsOf(durationDays: number): number {
  return Math.max(1, durationDays - 1);
}

function durationBucket(durationDays: number): 'short' | 'mid' | 'long' {
  const n = nightsOf(durationDays);
  if (n <= 3) return 'short';
  if (n <= 6) return 'mid';
  return 'long';
}

const DURATION_LABELS: { key: 'short' | 'mid' | 'long'; label: string }[] = [
  { key: 'short', label: 'Up to 3 nights' },
  { key: 'mid', label: '4 – 6 nights' },
  { key: 'long', label: '7+ nights' },
];

export default function PackagesPage() {
  const [search, setSearch] = React.useState('');
  const [hubId, setHubId] = React.useState('');
  const [classes, setClasses] = React.useState<Set<string>>(new Set());
  const [durations, setDurations] = React.useState<Set<string>>(new Set());
  const [maxBudget, setMaxBudget] = React.useState<number | null>(null);
  const [sort, setSort] = React.useState<SortKey>('recommended');
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [page, setPage] = React.useState(1);
  const [mobileFilters, setMobileFilters] = React.useState(false);
  const [wishlist, setWishlist] = React.useState<Set<string>>(new Set());

  const { data: hubs } = useQuery({
    queryKey: ['hubs'],
    queryFn: () => locationService.getHubs(),
  });

  const hubIds = React.useMemo(() => hubs?.map((h) => h.id) ?? [], [hubs]);

  const { data, isLoading } = useQuery({
    queryKey: ['packages', 'catalog', hubIds.join(',')],
    queryFn: () => packageService.listPackagesAcrossHubs(hubIds),
    enabled: hubIds.length > 0,
  });

  const allPackages = React.useMemo<TravelPackage[]>(
    () => data?.data?.results ?? [],
    [data],
  );

  // Budget bounds from real data.
  const budgetBounds = React.useMemo(() => {
    if (allPackages.length === 0) return { min: 0, max: 100000 };
    const prices = allPackages.map((p) => Number(p.base_price) || 0);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allPackages]);

  const effectiveMax = maxBudget ?? budgetBounds.max;

  // Facet counts from full list.
  const classCounts = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const p of allPackages) m.set(p.caravan_class_code, (m.get(p.caravan_class_code) ?? 0) + 1);
    return m;
  }, [allPackages]);

  const durationCounts = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const p of allPackages) {
      const b = durationBucket(p.duration_days);
      m.set(b, (m.get(b) ?? 0) + 1);
    }
    return m;
  }, [allPackages]);

  const hubName = React.useMemo(
    () => hubs?.find((h) => h.id === hubId)?.name ?? '',
    [hubs, hubId],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allPackages.filter((p) => {
      if (q && !`${p.name} ${p.home_hub_name}`.toLowerCase().includes(q)) return false;
      if (hubName && p.home_hub_name !== hubName) return false;
      if (classes.size > 0 && !classes.has(p.caravan_class_code)) return false;
      if (durations.size > 0 && !durations.has(durationBucket(p.duration_days))) return false;
      if ((Number(p.base_price) || 0) > effectiveMax) return false;
      return true;
    });

    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => Number(a.base_price) - Number(b.base_price));
    else if (sort === 'price-desc') sorted.sort((a, b) => Number(b.base_price) - Number(a.base_price));
    else if (sort === 'duration') sorted.sort((a, b) => b.duration_days - a.duration_days);
    return sorted;
  }, [allPackages, search, hubName, classes, durations, effectiveMax, sort]);

  // Reset to page 1 when filters change.
  React.useEffect(() => {
    setPage(1);
  }, [search, hubId, classes, durations, maxBudget, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSet = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const resetFilters = () => {
    setSearch('');
    setHubId('');
    setClasses(new Set());
    setDurations(new Set());
    setMaxBudget(null);
    setSort('recommended');
  };

  const sidebar = (
    <FilterSidebar
      search={search}
      onSearch={setSearch}
      hubId={hubId}
      onHub={setHubId}
      hubs={hubs ?? []}
      classes={classes}
      onToggleClass={(c) => toggleSet(classes, c, setClasses)}
      classCounts={classCounts}
      durations={durations}
      onToggleDuration={(d) => toggleSet(durations, d, setDurations)}
      durationCounts={durationCounts}
      budgetBounds={budgetBounds}
      maxBudget={effectiveMax}
      onBudget={setMaxBudget}
      onApply={() => setMobileFilters(false)}
      onReset={resetFilters}
    />
  );

  return (
    <main className="min-h-screen bg-surface-0 text-ink">
      <Navbar />

      {/* Split hero */}
      <section className="relative grid min-h-[58vh] grid-cols-1 items-center overflow-hidden pt-28 lg:min-h-[62vh] lg:grid-cols-2 lg:pt-0">
        <div className="relative z-10 px-5 py-10 lg:px-16 lg:py-0">
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[1.02] tracking-[-0.01em]" style={{ fontFamily: 'var(--font-headline)' }}>
            Handpicked escapes.
            <br />
            <span className="italic text-gold">Every one unforgettable.</span>
          </h1>
          <p className="mt-6 max-w-md font-body text-sm leading-relaxed text-ink-muted md:text-base">
            Curated journeys across India for those who seek more from the road. Each escape is
            crafted with purpose, passion and attention to every detail.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <HeroProp icon={Sparkles} title="Curated by travel experts" note="Thoughtful, not random" />
            <HeroProp icon={Truck} title="Premium caravans" note="Private. Comfortable. Reliable." />
          </div>
        </div>
        <div className="relative h-64 lg:h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1600&auto=format&fit=crop"
            alt="A caravan beside a campfire under a mountain night sky"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-0 via-surface-0/20 to-transparent lg:bg-gradient-to-r" />
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-0 z-30 border-y border-white/[0.06] bg-surface-0/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileFilters(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-gold/40 lg:hidden"
          >
            <SlidersHorizontal size={14} /> Filter & Refine
          </button>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted lg:inline">
            {isLoading ? 'Loading escapes…' : `${filtered.length} escapes found`}
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="bg-transparent font-body text-xs text-ink outline-none"
              >
                <option value="recommended" className="bg-surface-1">Recommended</option>
                <option value="price-asc" className="bg-surface-1">Price: Low to High</option>
                <option value="price-desc" className="bg-surface-1">Price: High to Low</option>
                <option value="duration" className="bg-surface-1">Longest journeys</option>
              </select>
            </label>
            <div className="hidden items-center rounded-full border border-white/10 p-1 sm:flex">
              <button
                type="button"
                onClick={() => setView('grid')}
                className={`flex size-8 items-center justify-center rounded-full transition-colors ${view === 'grid' ? 'bg-gold text-gold-ink' : 'text-ink-muted'}`}
                aria-label="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className={`flex size-8 items-center justify-center rounded-full transition-colors ${view === 'list' ? 'bg-gold text-gold-ink' : 'text-ink-muted'}`}
                aria-label="List view"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-screen-2xl px-5 py-10 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">{sidebar}</div>
          </aside>

          {/* Results */}
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-28">
                <Loader2 className="size-8 animate-spin text-gold" />
              </div>
            ) : pageItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/[0.06] bg-white/[0.02] py-28 text-center">
                <Search className="size-9 text-ink-faint" />
                <h3 className="mt-5 font-heading text-xl font-semibold text-ink">No escapes match your filters</h3>
                <p className="mt-2 font-body text-sm text-ink-muted">Try widening your budget or clearing a filter.</p>
                <button onClick={resetFilters} className="mt-6 rounded-full border border-gold/30 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold/10">
                  Reset filters
                </button>
              </div>
            ) : (
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'
                    : 'flex flex-col gap-4'
                }
              >
                {pageItems.map((pkg) => (
                  <ExperienceCard
                    key={pkg.id}
                    pkg={pkg}
                    view={view}
                    saved={wishlist.has(pkg.id)}
                    onToggleSave={() => toggleSet(wishlist, pkg.id, setWishlist)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <PagerButton disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ArrowRight className="size-4 rotate-180" />
                </PagerButton>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`size-9 rounded-lg font-mono text-xs transition-colors ${
                      page === i + 1
                        ? 'border border-gold/40 bg-gold/10 text-gold'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <PagerButton disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ArrowRight className="size-4" />
                </PagerButton>
              </div>
            )}

            {/* Custom escape CTA */}
            <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:flex-row md:p-8">
              <div className="flex items-center gap-4">
                <Sparkles className="size-6 shrink-0 text-gold" strokeWidth={1.5} />
                <div>
                  <p className="font-heading text-base font-semibold text-ink">Can&apos;t find what you&apos;re looking for?</p>
                  <p className="mt-1 font-body text-sm text-ink-muted">Let our travel experts curate a custom escape just for you.</p>
                </div>
              </div>
              <Link
                href="/support"
                className="gradient-cta inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 font-heading text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-ink"
              >
                Talk to an expert
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button className="absolute inset-0 bg-black/60" aria-label="Close filters" onClick={() => setMobileFilters(false)} />
          <div className="absolute inset-y-0 left-0 w-[min(22rem,90vw)] overflow-y-auto border-r border-white/10 bg-surface-1 p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Filter &amp; Refine</span>
              <button onClick={() => setMobileFilters(false)} className="text-ink-muted hover:text-ink" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

function HeroProp({ icon: Icon, title, note }: { icon: typeof Sparkles; title: string; note: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-full border border-gold/20 bg-gold/[0.06] text-gold">
        <Icon size={16} strokeWidth={1.5} />
      </span>
      <div>
        <p className="font-heading text-[13px] font-semibold text-ink">{title}</p>
        <p className="font-body text-xs text-ink-muted">{note}</p>
      </div>
    </div>
  );
}

function PagerButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-ink-muted transition-colors hover:border-gold/40 hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function ExperienceCard({
  pkg,
  view,
  saved,
  onToggleSave,
}: {
  pkg: TravelPackage;
  view: 'grid' | 'list';
  saved: boolean;
  onToggleSave: () => void;
}) {
  const tag = CLASS_NAMES[pkg.caravan_class_code] ?? `Class ${pkg.caravan_class_code}`;
  const img = pkg.thumbnail_url?.trim() ? pkg.thumbnail_url : FALLBACK_IMAGE;

  return (
    <div
      className={`group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-colors duration-500 hover:border-gold/25 ${
        view === 'list' ? 'flex flex-col sm:flex-row' : ''
      }`}
    >
      <div className={`relative overflow-hidden ${view === 'list' ? 'sm:w-72 sm:shrink-0' : ''}`}>
        <div className={view === 'list' ? 'aspect-[16/10] sm:h-full' : 'aspect-[16/11]'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={pkg.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="label-mono absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-[9px] text-ink/90 backdrop-blur-sm">
          {tag}
        </span>
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={saved ? 'Remove from saved' : 'Save escape'}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-ink/80 backdrop-blur-sm transition-colors hover:text-gold"
        >
          <Heart size={14} className={saved ? 'fill-gold text-gold' : ''} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-ink">{pkg.name}</h3>
        <p className="mt-1 font-body text-sm text-ink-muted">{pkg.home_hub_name}</p>

        <div className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Moon size={12} /> {nightsOf(pkg.duration_days)} nights
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={12} /> {tag}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-white/[0.06] pt-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">From</p>
            <p className="font-heading text-lg font-semibold text-gold">₹{inr(pkg.base_price)}</p>
          </div>
          <Link
            href={`/packages/${pkg.id}`}
            aria-label={`View ${pkg.name}`}
            className="flex size-11 items-center justify-center rounded-full border border-gold/30 text-gold transition-all duration-500 hover:bg-gold hover:text-gold-ink"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FilterSidebar(props: {
  search: string;
  onSearch: (v: string) => void;
  hubId: string;
  onHub: (v: string) => void;
  hubs: { id: string; name: string }[];
  classes: Set<string>;
  onToggleClass: (c: string) => void;
  classCounts: Map<string, number>;
  durations: Set<string>;
  onToggleDuration: (d: string) => void;
  durationCounts: Map<string, number>;
  budgetBounds: { min: number; max: number };
  maxBudget: number;
  onBudget: (v: number) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      {/* Search */}
      <FieldLabel>Where to?</FieldLabel>
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={props.search}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="Search destination or route"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-3 font-body text-sm text-ink outline-none placeholder:text-ink-faint focus:border-gold/40"
        />
      </div>

      {/* Hub */}
      <FieldLabel className="mt-6">Departure Hub</FieldLabel>
      <select
        value={props.hubId}
        onChange={(e) => props.onHub(e.target.value)}
        className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-gold/40"
      >
        <option value="" className="bg-surface-1">All Hubs</option>
        {props.hubs.map((h) => (
          <option key={h.id} value={h.id} className="bg-surface-1">{h.name}</option>
        ))}
      </select>

      {/* Caravan class */}
      <FieldLabel className="mt-6">Caravan Class</FieldLabel>
      <div className="space-y-2.5">
        {Array.from(props.classCounts.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([code, count]) => (
            <CheckRow
              key={code}
              label={CLASS_NAMES[code] ?? `Class ${code}`}
              count={count}
              checked={props.classes.has(code)}
              onChange={() => props.onToggleClass(code)}
            />
          ))}
      </div>

      {/* Duration */}
      <FieldLabel className="mt-6">Duration</FieldLabel>
      <div className="space-y-2.5">
        {DURATION_LABELS.map(({ key, label }) => (
          <CheckRow
            key={key}
            label={label}
            count={props.durationCounts.get(key) ?? 0}
            checked={props.durations.has(key)}
            onChange={() => props.onToggleDuration(key)}
          />
        ))}
      </div>

      {/* Budget */}
      <FieldLabel className="mt-6">Budget</FieldLabel>
      <input
        type="range"
        min={props.budgetBounds.min}
        max={props.budgetBounds.max}
        step={1000}
        value={props.maxBudget}
        onChange={(e) => props.onBudget(Number(e.target.value))}
        className="w-full accent-gold"
      />
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        <span>₹{inr(props.budgetBounds.min)}</span>
        <span className="text-gold">Up to ₹{inr(props.maxBudget)}</span>
      </div>

      <button
        type="button"
        onClick={props.onApply}
        className="gradient-cta mt-7 w-full rounded-full py-3 font-heading text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-ink"
      >
        Apply Filters
      </button>
      <button
        type="button"
        onClick={props.onReset}
        className="mt-3 w-full text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-gold"
      >
        Reset
      </button>
    </div>
  );
}

function FieldLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mb-3 font-heading text-[13px] font-semibold tracking-tight text-ink ${className}`}>
      {children}
    </p>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="flex items-center gap-2.5">
        <span
          className={`flex size-4 items-center justify-center rounded border transition-colors ${
            checked ? 'border-gold bg-gold' : 'border-white/20'
          }`}
        >
          {checked && (
            <svg viewBox="0 0 12 12" className="size-3 text-gold-ink" fill="none">
              <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <span className="font-body text-sm text-ink-muted">{label}</span>
      </span>
      <span className="font-mono text-[11px] text-ink-faint">{count}</span>
    </label>
  );
}
