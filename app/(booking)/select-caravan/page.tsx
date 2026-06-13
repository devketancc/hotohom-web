'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { bookingService } from '@/services/booking.service';
import { useBooking } from '@/hooks/useBooking';
import { CaravanCard } from '@/components/booking/CaravanCard';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { format } from 'date-fns';
import { CaravanClass } from '@/types/booking';
import { Loader2, AlertCircle, RefreshCw, Caravan, Calendar, ArrowRight } from 'lucide-react';

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function inr(value?: string): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString('en-IN') : '—';
}

export default function SelectCaravanPage() {
  const router = useRouter();
  const { bookingState } = useBooking();
  const { hub, dates, setData } = bookingState;

  const start = dates.start ? format(new Date(dates.start), 'yyyy-MM-dd') : null;
  const end = dates.end ? format(new Date(dates.end), 'yyyy-MM-dd') : null;
  const hasCompleteDateRange = !!start && !!end;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['availableCaravans', hub, start, end],
    queryFn: () => bookingService.getAvailableCaravans({ hub: hub!, start: start!, end: end! }),
    enabled: !!hub && hasCompleteDateRange,
  });

  const handleSelect = (caravan: CaravanClass) => {
    setData({ caravanClass: caravan, pets: 0, passengers: caravan.full_capacity });
  };

  const handleContinue = () => {
    if (bookingState.caravanClass) router.push('/journey');
  };

  const selected = bookingState.caravanClass;
  const classes = data?.data?.available_classes ?? [];

  if (!hub) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={40} className="mb-5 text-gold" />
        <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-ink">
          Let&apos;s start with when and where.
        </h2>
        <p className="mt-3 font-body text-sm text-ink-muted">
          Pick a hub and your travel dates first, and availability will appear here.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-8 rounded-full border border-gold/30 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold/10"
        >
          Go to home
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-screen-2xl px-4 py-8 text-ink md:py-10 lg:px-8 lg:py-14">
        <header className="mb-8 lg:mb-12">
          <span className="label-mono text-gold">Step 01 / The Caravan</span>
          <h1
            style={{ fontFamily: 'var(--font-display)' }}
            className="mt-4 text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-ink"
          >
            Choose your home for the road.
          </h1>
          <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-ink-muted md:text-base">
            Each caravan is a private suite in motion, engineered for the journey and finished for the
            stay. Availability is live for your dates.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:gap-8 xl:grid-cols-[1fr_380px] xl:gap-12">
          {/* List */}
          <div className="min-w-0">
            {!hasCompleteDateRange ? (
              <StatePanel
                icon={<Calendar size={36} className="text-gold/80" />}
                title="Finish your dates"
                body="Choose a start and end date in the bar above. Availability loads once both are set."
              />
            ) : isLoading ? (
              <StatePanel
                icon={<Loader2 size={36} className="animate-spin text-gold" />}
                title="Scanning the fleet"
                body="Checking which caravans are free for your window."
              />
            ) : isError ? (
              <StatePanel
                tone="error"
                icon={<AlertCircle size={36} className="text-red-400" />}
                title="Could not load availability"
                body={(error as Error)?.message || 'Something went wrong connecting to the server.'}
                action={
                  <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-gold/40"
                  >
                    <RefreshCw size={15} /> Try again
                  </button>
                }
              />
            ) : classes.length === 0 ? (
              <StatePanel
                icon={<Caravan size={36} className="text-ink-faint" />}
                title="No caravans for these dates"
                body="Nothing is free for this hub and window. Try different dates or another hub."
                action={
                  <button
                    onClick={() => router.push('/')}
                    className="rounded-full border border-gold/30 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold/10"
                  >
                    Change search
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 pb-28 md:grid-cols-2 lg:pb-0">
                {classes.map((caravan, index) => (
                  <CaravanCard
                    key={caravan.id}
                    caravan={caravan}
                    isSelected={selected?.id === caravan.id}
                    onSelect={handleSelect}
                    isPopular={index === 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop sidebar only */}
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-28">
              <BookingSummary
                booking={bookingState}
                onContinue={handleContinue}
                emphasizeCaravanSelection
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky action bar */}
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
                <p className="label-mono text-ink-faint">Selected</p>
                <p className="truncate font-heading text-sm font-semibold text-ink">
                  {selected.name}
                  <span className="ml-2 font-mono text-xs font-normal text-gold">
                    ₹{inr(selected.day_rate)}/day
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleContinue}
                className="gradient-cta group inline-flex shrink-0 items-center gap-2 rounded-full py-3.5 pl-6 pr-3.5 font-heading text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-ink"
              >
                Continue
                <span className="flex size-6 items-center justify-center rounded-full bg-gold-ink/25">
                  <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-0.5" />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
    <div
      className={[
        'flex flex-col items-center justify-center rounded-[2rem] border px-6 py-20 text-center',
        tone === 'error'
          ? 'border-red-500/20 bg-red-950/10'
          : 'border-white/[0.06] bg-white/[0.02]',
      ].join(' ')}
    >
      {icon}
      <h3
        style={{ fontFamily: 'var(--font-display)' }}
        className="mt-5 text-xl font-semibold text-ink"
      >
        {title}
      </h3>
      <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-ink-muted">{body}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
