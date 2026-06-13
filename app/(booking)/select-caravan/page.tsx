'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Bed,
  CalendarCheck,
  CalendarDays,
  Check,
  ChefHat,
  Heart,
  LifeBuoy,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  ShowerHead,
  SlidersHorizontal,
  Sofa,
  Sparkles,
  Star,
  Users,
  Wrench,
} from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { useBooking } from '@/hooks/useBooking';
import { CaravanClass } from '@/types/booking';

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Fallback only when a class has no media in the API response.
const CARAVAN_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200&auto=format&fit=crop';

/** Prefer the real class image from the API (media[].url); fall back to a placeholder. */
function caravanImage(c: CaravanClass): string {
  const media = c.media ?? [];
  const images = media
    .filter((m) => Boolean(m.url) && (!m.media_type || m.media_type === 'image'))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return images[0]?.url ?? media[0]?.url ?? CARAVAN_IMAGE_FALLBACK;
}

function inr(value: string | number): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString('en-IN') : '—';
}

const isCorporateClass = (c: CaravanClass) => c.code === 'U' || /urban/i.test(c.name);

const GUEST_PILLS = [2, 4, 6, 8] as const;

type TripType = 'Family' | 'Couple' | 'Friends' | 'Corporate';
const TRIP_TYPES: { key: TripType; icon: typeof Users }[] = [
  { key: 'Family', icon: Users },
  { key: 'Couple', icon: Heart },
  { key: 'Friends', icon: Users },
  { key: 'Corporate', icon: BadgeCheck },
];

type Preference = 'Pet Friendly' | 'Off-road Capable' | 'Work Friendly' | 'Extra Storage';
const PREFERENCES: { key: Preference; match: (c: CaravanClass) => boolean }[] = [
  { key: 'Pet Friendly', match: (c) => c.is_pet_friendly },
  { key: 'Off-road Capable', match: (c) => c.amenities.some((a) => /off-?road/i.test(a)) },
  { key: 'Work Friendly', match: (c) => c.amenities.some((a) => /work|desk|wifi/i.test(a)) },
  { key: 'Extra Storage', match: (c) => c.amenities.some((a) => /storage/i.test(a)) },
];

function bedsLabel(c: CaravanClass): string | null {
  const found = c.amenities.find((a) => /bed/i.test(a));
  return found ?? null;
}
function hasAmenity(c: CaravanClass, re: RegExp) {
  return c.amenities.some((a) => re.test(a));
}
function highlightTag(c: CaravanClass): string | null {
  const t = c.amenities.find((a) => /off-?road|extra storage|work/i.test(a));
  if (t) return t;
  if (c.is_pet_friendly) return 'Pet Friendly';
  return null;
}

export default function SelectCaravanPage() {
  const router = useRouter();
  const { bookingState } = useBooking();
  const { hub, hubName, dates, passengers, setData } = bookingState;

  const start = dates.start ? format(new Date(dates.start), 'yyyy-MM-dd') : null;
  const end = dates.end ? format(new Date(dates.end), 'yyyy-MM-dd') : null;
  const hasCompleteDateRange = !!start && !!end;
  const days = dates.totalDays || 1;

  // Filters
  const [guests, setGuests] = React.useState<number>(Math.max(2, passengers || 2));
  const [tripType, setTripType] = React.useState<TripType | null>(null);
  const [prefs, setPrefs] = React.useState<Set<Preference>>(new Set());
  const [maxBudget, setMaxBudget] = React.useState<number | null>(null);
  const [sort, setSort] = React.useState<'recommended' | 'price-asc' | 'price-desc'>('recommended');
  const [wishlist, setWishlist] = React.useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['availableCaravans', hub, start, end],
    queryFn: () => bookingService.getAvailableCaravans({ hub: hub!, start: start!, end: end! }),
    enabled: !!hub && hasCompleteDateRange,
  });

  const allClasses = React.useMemo(() => data?.data?.available_classes ?? [], [data]);

  const budgetBounds = React.useMemo(() => {
    if (allClasses.length === 0) return { min: 0, max: 50000 };
    const rates = allClasses.map((c) => Number(c.day_rate) || 0);
    return { min: Math.min(...rates), max: Math.max(...rates) };
  }, [allClasses]);
  const effectiveMax = maxBudget ?? budgetBounds.max;

  const filtered = React.useMemo(() => {
    const list = allClasses.filter((c) => {
      if (c.full_capacity < guests) return false;
      if (tripType === 'Corporate' && !isCorporateClass(c)) return false;
      if (tripType && tripType !== 'Corporate' && isCorporateClass(c)) return false;
      for (const p of prefs) {
        const def = PREFERENCES.find((x) => x.key === p);
        if (def && !def.match(c)) return false;
      }
      if ((Number(c.day_rate) || 0) > effectiveMax) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => Number(a.day_rate) - Number(b.day_rate));
    else if (sort === 'price-desc') sorted.sort((a, b) => Number(b.day_rate) - Number(a.day_rate));
    return sorted;
  }, [allClasses, guests, tripType, prefs, effectiveMax, sort]);

  const selected = bookingState.caravanClass;

  const handleSelect = (caravan: CaravanClass) => {
    setData({ caravanClass: caravan, pets: 0, passengers: Math.min(guests, caravan.full_capacity) });
  };
  const handleContinue = () => {
    if (selected) router.push('/journey');
  };
  const togglePref = (p: Preference) => {
    setPrefs((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };
  const resetFilters = () => {
    setGuests(2);
    setTripType(null);
    setPrefs(new Set());
    setMaxBudget(null);
  };

  if (!hub) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={40} className="mb-5 text-stitch-primary" />
        <h2 style={{ fontFamily: 'var(--font-headline)' }} className="text-2xl font-bold text-ink">
          Let&apos;s start with when and where.
        </h2>
        <p className="mt-3 font-body text-sm text-ink-muted">
          Pick a hub and your travel dates first, and availability will appear here.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-8 rounded-full border border-stitch-primary/30 px-6 py-3 font-headline text-[11px] font-semibold uppercase tracking-[0.18em] text-stitch-primary transition-colors hover:bg-stitch-primary/10"
        >
          Go to home
        </button>
      </div>
    );
  }

  const sidebar = (
    <FilterSidebar
      guests={guests}
      onGuests={setGuests}
      tripType={tripType}
      onTripType={(t) => setTripType((cur) => (cur === t ? null : t))}
      prefs={prefs}
      onTogglePref={togglePref}
      budgetBounds={budgetBounds}
      maxBudget={effectiveMax}
      onBudget={setMaxBudget}
      onReset={resetFilters}
    />
  );

  return (
    <>
      <div className="mx-auto max-w-screen-2xl px-4 pb-28 pt-6 text-ink lg:px-8 lg:pb-12">
        {/* Compact hero band */}
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-[1.15fr_0.85fr]">
            <div className="relative z-10 flex flex-col justify-center p-6 md:p-8">
              <h1
                style={{ fontFamily: 'var(--font-headline)' }}
                className="text-[clamp(1.625rem,2.8vw,2.5rem)] font-light leading-[1.05] tracking-[-0.01em]"
              >
                Choose your <span className="italic text-stitch-primary">home for the road.</span>
              </h1>
              <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-ink-muted">
                Every caravan is a private suite in motion, designed for comfort, built for journeys
                that stay with you.
              </p>
              <div className="mt-4 inline-flex items-center gap-2.5 self-start rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-2">
                <ShieldCheck className="size-3.5 shrink-0 text-stitch-primary" />
                <p className="font-body text-[11px] leading-snug text-ink-muted">
                  Serviced, sanitized &amp; road-ready before every journey.
                </p>
              </div>
            </div>
            <div className="relative h-32 sm:h-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1600&auto=format&fit=crop"
                alt="A caravan beside a lake at dusk"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stitch-background via-stitch-background/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* Feature strip */}
        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] md:grid-cols-4">
          <FeatureItem icon={ShieldCheck} title="Private & Secure" note="Your space, your privacy" />
          <FeatureItem icon={Sofa} title="Premium Interiors" note="Hotel-like comfort" />
          <FeatureItem icon={Wrench} title="Road-Ready" note="Safety & reliability" />
          <FeatureItem icon={LifeBuoy} title="24×7 Support" note="On-trip assistance" />
        </div>

        {/* Body */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_300px] lg:gap-6 xl:grid-cols-[280px_1fr_320px]">
          {/* Filters (mobile toggle) */}
          <div className="lg:hidden">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 py-3 font-headline text-[11px] font-semibold uppercase tracking-[0.16em] text-ink"
            >
              <SlidersHorizontal size={14} /> {filtersOpen ? 'Hide filters' : 'Find your perfect match'}
            </button>
            {filtersOpen && <div className="mt-3">{sidebar}</div>}
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">{sidebar}</div>
          </aside>

          {/* Results */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="font-headline text-sm font-semibold text-ink">
                {isLoading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'caravan' : 'caravans'} available`}
              </span>
              <label className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                <span className="font-headline text-[10px] uppercase tracking-[0.14em] text-ink-faint">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="bg-transparent font-body text-xs text-ink outline-none"
                >
                  <option value="recommended" className="bg-surface-1">Recommended</option>
                  <option value="price-asc" className="bg-surface-1">Price: Low to High</option>
                  <option value="price-desc" className="bg-surface-1">Price: High to Low</option>
                </select>
              </label>
            </div>

            {!hasCompleteDateRange ? (
              <StatePanel icon={<CalendarDays size={34} className="text-stitch-primary/80" />} title="Finish your dates" body="Choose start and end dates above; availability loads after both are set." />
            ) : isLoading ? (
              <StatePanel icon={<Loader2 size={34} className="animate-spin text-stitch-primary" />} title="Scanning the fleet" body="Checking which caravans are free for your window." />
            ) : isError ? (
              <StatePanel
                tone="error"
                icon={<AlertCircle size={34} className="text-red-400" />}
                title="Could not load availability"
                body={(error as Error)?.message || 'Something went wrong connecting to the server.'}
                action={
                  <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-headline text-[11px] uppercase tracking-[0.16em] text-ink hover:border-stitch-primary/40">
                    <RefreshCw size={15} /> Try again
                  </button>
                }
              />
            ) : filtered.length === 0 ? (
              <StatePanel
                icon={<Users size={34} className="text-ink-faint" />}
                title="No caravans match your filters"
                body="Try widening your budget, lowering the guest count, or clearing a preference."
                action={
                  <button onClick={resetFilters} className="rounded-full border border-stitch-primary/30 px-5 py-2.5 font-headline text-[11px] uppercase tracking-[0.16em] text-stitch-primary hover:bg-stitch-primary/10">
                    Reset filters
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {filtered.map((c, i) => (
                  <CaravanRow
                    key={c.id}
                    caravan={c}
                    popular={i === 0 && sort === 'recommended'}
                    selected={selected?.id === c.id}
                    saved={wishlist.has(c.id)}
                    onSelect={() => handleSelect(c)}
                    onToggleSave={() =>
                      setWishlist((prev) => {
                        const next = new Set(prev);
                        if (next.has(c.id)) next.delete(c.id);
                        else next.add(c.id);
                        return next;
                      })
                    }
                  />
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="font-body text-sm text-ink-muted">Can&apos;t find what you&apos;re looking for?</p>
              <button
                onClick={() => router.push('/support')}
                className="rounded-full border border-stitch-primary/30 px-5 py-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.16em] text-stitch-primary transition-colors hover:bg-stitch-primary/10"
              >
                Request a Custom Caravan
              </button>
            </div>
          </div>

          {/* Your Journey panel */}
          <aside>
            <div className="lg:sticky lg:top-24 space-y-4">
              <JourneySummary
                hubName={hubName}
                dates={dates}
                days={days}
                guests={selected ? bookingState.passengers : guests}
                selected={selected}
                onEdit={() => router.push('/')}
                onContinue={handleContinue}
              />
              <WhyBookCard />
            </div>
          </aside>
        </div>

        {/* Trust strip */}
        <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-8 md:grid-cols-4">
          <TrustStat icon={Users} value="10,000+" label="Happy Travellers" />
          <TrustStat icon={MapPin} value="50+" label="Destinations" />
          <TrustStat icon={Star} value="98%" label="5 Star Reviews" />
          <TrustStat icon={BadgeCheck} value="4.9/5" label="Google Rating" />
        </div>
      </div>

      {/* Mobile sticky bar */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ duration: 0.45, ease: LUXURY_EASE }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-surface-1/95 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4 backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-headline text-[9px] uppercase tracking-[0.2em] text-ink-faint">Selected</p>
                <p className="truncate font-headline text-sm font-semibold text-ink">
                  {selected.name}
                  <span className="ml-2 text-xs font-normal text-stitch-primary">₹{inr(selected.day_rate)}/day</span>
                </p>
              </div>
              <button
                onClick={handleContinue}
                className="gradient-cta inline-flex shrink-0 items-center gap-2 rounded-full py-3.5 pl-6 pr-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.16em] text-stitch-on-primary-container"
              >
                Continue
                <span className="flex size-6 items-center justify-center rounded-full bg-gold-ink/25">
                  <ArrowRight className="size-3.5" />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FeatureItem({ icon: Icon, title, note }: { icon: typeof ShieldCheck; title: string; note: string }) {
  return (
    <div className="flex items-center gap-3 bg-stitch-background px-4 py-5">
      <Icon className="size-5 shrink-0 text-stitch-primary" strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="font-headline text-[12px] font-semibold text-ink">{title}</p>
        <p className="font-body text-[11px] text-ink-muted">{note}</p>
      </div>
    </div>
  );
}

function CaravanRow({
  caravan,
  popular,
  selected,
  saved,
  onSelect,
  onToggleSave,
}: {
  caravan: CaravanClass;
  popular: boolean;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onToggleSave: () => void;
}) {
  const beds = bedsLabel(caravan);
  const tag = highlightTag(caravan);
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      className={[
        'group relative grid cursor-pointer grid-cols-1 overflow-hidden rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-56 sm:grid-cols-[40%_1fr]',
        selected ? 'border-stitch-primary/50 shadow-glow-gold' : 'border-white/[0.07] hover:border-white/15',
      ].join(' ')}
    >
      <div className="relative h-44 overflow-hidden sm:h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={caravanImage(caravan)}
          alt={caravan.name}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {popular && (
          <span className="absolute left-4 top-4 rounded-full bg-stitch-primary px-3 py-1.5 font-headline text-[9px] font-bold uppercase tracking-[0.14em] text-stitch-on-primary">
            Most Popular
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          aria-label={saved ? 'Remove from saved' : 'Save caravan'}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-ink/80 backdrop-blur-sm transition-colors hover:text-stitch-primary"
        >
          <Heart size={14} className={saved ? 'fill-stitch-primary text-stitch-primary' : ''} />
        </button>
      </div>

      <div className="flex flex-col overflow-hidden bg-stitch-surface/30 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 style={{ fontFamily: 'var(--font-headline)' }} className="text-xl font-semibold tracking-tight text-ink">
              {caravan.name}
            </h3>
            <p className="mt-1 max-w-sm font-body text-sm leading-relaxed text-ink-muted line-clamp-2">
              {caravan.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-headline text-[10px] uppercase tracking-[0.14em] text-ink-faint">From</p>
            <p className="font-headline text-xl font-semibold text-stitch-primary">₹{inr(caravan.day_rate)}</p>
            <p className="font-headline text-[10px] uppercase tracking-[0.14em] text-ink-faint">/ day</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-[12px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5"><Users size={14} /> {caravan.full_capacity} Guests</span>
          {beds && <span className="inline-flex items-center gap-1.5"><Bed size={14} /> {beds}</span>}
          {hasAmenity(caravan, /kitchen/i) && <span className="inline-flex items-center gap-1.5"><ChefHat size={14} /> Kitchen</span>}
          {hasAmenity(caravan, /toilet|washroom|bath/i) && <span className="inline-flex items-center gap-1.5"><ShowerHead size={14} /> Toilet</span>}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          {tag ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1 font-headline text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              {tag}
            </span>
          ) : (
            <span />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={[
              'inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              selected ? 'gradient-cta text-stitch-on-primary-container' : 'border border-stitch-primary/40 text-stitch-primary hover:bg-stitch-primary/10',
            ].join(' ')}
          >
            {selected ? (<><Check size={14} /> Selected</>) : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}

function JourneySummary({
  hubName,
  dates,
  days,
  guests,
  selected,
  onEdit,
  onContinue,
}: {
  hubName: string | null;
  dates: { start: Date | null; end: Date | null; totalDays: number };
  days: number;
  guests: number;
  selected: CaravanClass | null;
  onEdit: () => void;
  onContinue: () => void;
}) {
  const dateLabel =
    dates.start && dates.end
      ? `${format(new Date(dates.start), 'd MMM')} – ${format(new Date(dates.end), 'd MMM')} (${days} ${days === 1 ? 'day' : 'days'})`
      : 'Not set';

  const dayRate = selected ? Number(selected.day_rate) || 0 : 0;
  const deposit = selected ? Number(selected.deposit_amount) || 0 : 0;
  const subtotal = dayRate * days;
  const total = subtotal + deposit;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-stitch-surface/40 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 style={{ fontFamily: 'var(--font-headline)' }} className="text-lg font-semibold text-ink">
          Your Journey
        </h2>
        <button onClick={onEdit} className="inline-flex items-center gap-1 font-headline text-[10px] uppercase tracking-[0.16em] text-stitch-primary hover:underline">
          Edit
        </button>
      </div>

      <dl className="space-y-4 text-sm">
        <SummaryRow icon={MapPin} label="Location" value={hubName || 'Hub'} />
        <SummaryRow icon={CalendarDays} label="Dates" value={dateLabel} />
        <SummaryRow icon={Users} label="Guests" value={`${guests} ${guests === 1 ? 'Adult' : 'Adults'}`} />
        <SummaryRow
          icon={Sparkles}
          label="Selected Caravan"
          value={selected ? `${selected.name}` : 'None yet'}
          sub={selected ? `${selected.full_capacity} Guests` : 'Pick a caravan below'}
        />
      </dl>

      {selected && (
        <div className="mt-6 space-y-2.5 border-t border-white/[0.08] pt-5 font-body text-sm">
          <div className="flex justify-between text-ink-muted">
            <span>₹{inr(dayRate)} × {days} {days === 1 ? 'day' : 'days'}</span>
            <span className="text-ink">₹{inr(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-muted">
            <span>Security Deposit <span className="text-ink-faint">(Refundable)</span></span>
            <span className="text-ink">₹{inr(deposit)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-white/[0.08] pt-3">
            <span className="font-headline font-semibold text-ink">Estimated Total</span>
            <span className="font-headline text-lg font-semibold text-stitch-primary">₹{inr(total)}</span>
          </div>
        </div>
      )}

      <button
        onClick={onContinue}
        disabled={!selected}
        className="gradient-cta mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.16em] text-stitch-on-primary-container transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to Journey
        <ArrowRight size={15} />
      </button>
      <p className="mt-3 text-center font-body text-[11px] leading-relaxed text-ink-faint">
        Final total confirmed at summary. Free cancellation up to 24 hours before your trip starts.
      </p>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-ink-faint" />
      <div className="min-w-0">
        <dt className="font-headline text-[9px] uppercase tracking-[0.18em] text-ink-faint">{label}</dt>
        <dd className="font-body text-sm font-medium text-ink">{value}</dd>
        {sub && <dd className="font-body text-xs text-ink-muted">{sub}</dd>}
      </div>
    </div>
  );
}

function WhyBookCard() {
  const items = [
    { icon: BadgeCheck, title: 'Best Price Guarantee', note: 'Transparent pricing, no hidden fees.' },
    { icon: CalendarCheck, title: 'Flexible Cancellation', note: 'Plans change, we understand.' },
    { icon: LifeBuoy, title: 'Travel Assistance', note: '24×7 on-trip support, anywhere.' },
    { icon: Star, title: 'Trusted by Travellers', note: 'Loved by 10,000+ adventurers.' },
  ];
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-stitch-surface/40 p-6">
      <h3 style={{ fontFamily: 'var(--font-headline)' }} className="text-base font-semibold text-ink">
        Why book with MotoHom?
      </h3>
      <ul className="mt-5 space-y-4">
        {items.map(({ icon: Icon, title, note }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-stitch-primary" strokeWidth={1.5} />
            <div>
              <p className="font-headline text-[13px] font-semibold text-ink">{title}</p>
              <p className="font-body text-xs text-ink-muted">{note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrustStat({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 text-center">
      <Icon className="size-5 text-stitch-primary" strokeWidth={1.5} />
      <div className="text-left">
        <p className="font-headline text-base font-semibold text-ink">{value}</p>
        <p className="font-body text-[11px] text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

function StatePanel({
  icon,
  title,
  body,
  action,
  tone = 'default',
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
  tone?: 'default' | 'error';
}) {
  return (
    <div className={['flex flex-col items-center justify-center rounded-2xl border px-6 py-20 text-center', tone === 'error' ? 'border-red-500/20 bg-red-950/10' : 'border-white/[0.06] bg-white/[0.02]'].join(' ')}>
      {icon}
      <h3 style={{ fontFamily: 'var(--font-headline)' }} className="mt-5 text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-ink-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function FilterSidebar(props: {
  guests: number;
  onGuests: (g: number) => void;
  tripType: TripType | null;
  onTripType: (t: TripType) => void;
  prefs: Set<Preference>;
  onTogglePref: (p: Preference) => void;
  budgetBounds: { min: number; max: number };
  maxBudget: number;
  onBudget: (v: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-stitch-surface/40 p-6">
      <h2 style={{ fontFamily: 'var(--font-headline)' }} className="mb-6 text-base font-semibold text-ink">
        Find your perfect match
      </h2>

      {/* Guests */}
      <SidebarLabel>Guests</SidebarLabel>
      <div className="grid grid-cols-4 gap-2">
        {GUEST_PILLS.map((g) => (
          <button
            key={g}
            onClick={() => props.onGuests(g)}
            className={[
              'rounded-lg border py-2.5 font-headline text-sm font-semibold transition-colors',
              props.guests === g ? 'border-stitch-primary/50 bg-stitch-primary/10 text-stitch-primary' : 'border-white/[0.08] text-ink-muted hover:border-white/15',
            ].join(' ')}
          >
            {g === 8 ? '8+' : g}
          </button>
        ))}
      </div>

      {/* Trip Type */}
      <SidebarLabel className="mt-6">Trip Type</SidebarLabel>
      <div className="space-y-2">
        {TRIP_TYPES.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => props.onTripType(key)}
            className={[
              'flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 font-body text-sm transition-colors',
              props.tripType === key ? 'border-stitch-primary/50 bg-stitch-primary/[0.07] text-ink' : 'border-white/[0.08] text-ink-muted hover:border-white/15',
            ].join(' ')}
          >
            <Icon size={15} className={props.tripType === key ? 'text-stitch-primary' : 'text-ink-faint'} />
            {key}
          </button>
        ))}
      </div>

      {/* Preferences */}
      <SidebarLabel className="mt-6">Preference</SidebarLabel>
      <div className="space-y-3">
        {PREFERENCES.map(({ key }) => {
          const checked = props.prefs.has(key);
          return (
            <label key={key} className="flex cursor-pointer items-center gap-3">
              <span className={['flex size-4 items-center justify-center rounded border transition-colors', checked ? 'border-stitch-primary bg-stitch-primary' : 'border-white/20'].join(' ')}>
                {checked && (
                  <svg viewBox="0 0 12 12" className="size-3 text-stitch-on-primary" fill="none">
                    <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input type="checkbox" checked={checked} onChange={() => props.onTogglePref(key)} className="sr-only" />
              <span className="font-body text-sm text-ink-muted">{key}</span>
            </label>
          );
        })}
      </div>

      {/* Budget */}
      <SidebarLabel className="mt-6">Budget Range</SidebarLabel>
      <input
        type="range"
        min={props.budgetBounds.min}
        max={props.budgetBounds.max}
        step={1000}
        value={props.maxBudget}
        onChange={(e) => props.onBudget(Number(e.target.value))}
        className="w-full accent-stitch-primary"
      />
      <div className="mt-2 flex justify-center">
        <span className="rounded-full border border-white/[0.08] px-3 py-1 font-headline text-[10px] uppercase tracking-[0.14em] text-ink-muted">
          ₹{inr(props.budgetBounds.min)} – ₹{inr(props.maxBudget)} / day
        </span>
      </div>

      <button
        onClick={props.onReset}
        className="mt-6 w-full rounded-full border border-white/12 py-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted transition-colors hover:border-stitch-primary/40 hover:text-stitch-primary"
      >
        Reset Filters
      </button>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex -space-x-2">
          <span className="size-7 rounded-full border border-stitch-primary/30 bg-stitch-primary/15" />
          <span className="size-7 rounded-full border border-stitch-primary/30 bg-stitch-primary/10" />
        </div>
        <div className="min-w-0">
          <p className="font-headline text-[12px] font-semibold text-ink">Need help choosing?</p>
          <p className="font-body text-[11px] text-ink-muted">Our travel designers are here for you.</p>
        </div>
      </div>
    </div>
  );
}

function SidebarLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mb-3 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint ${className}`}>
      {children}
    </p>
  );
}
