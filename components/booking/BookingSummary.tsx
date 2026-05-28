'use client';

import React from 'react';
import {
  MapPin,
  Calendar,
  Caravan,
  ArrowRight,
  Minus,
  Plus,
  PawPrint,
  Info,
} from 'lucide-react';
import { BookingData } from '@/types/booking';
import { formatBookingTravelWindow } from '@/utils/format';
import { useBookingStore } from '@/store/bookingStore';
import { cn } from '@/lib/utils';

const PET_CLEANING_NOTE =
  'Cleaning charges of ₹1,500 may apply for pet-friendly travel.';

interface BookingSummaryProps {
  booking: BookingData;
  onContinue: () => void | Promise<void>;
  isLoading?: boolean;
  /** Overrides default "Processing..." on the CTA while loading */
  continueLoadingLabel?: string;
  /** Error under CTA (e.g. cart API failure) */
  continueError?: string | null;
  /** Golden highlighted caravan card (select-caravan). Journey / map use compact row. */
  emphasizeCaravanSelection?: boolean;
  /** Day rate, km rate, pets stepper (off on journey steps after caravan is chosen). */
  showCaravanPricing?: boolean;
  /** Journey: require logged-in + route preview before Continue (use with continueLockedHint). */
  continueUnlocked?: boolean;
  /** Shown when isReady but continueUnlocked is false */
  continueLockedHint?: string;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  booking,
  onContinue,
  isLoading = false,
  emphasizeCaravanSelection = false,
  showCaravanPricing = true,
  continueUnlocked,
  continueLockedHint,
  continueLoadingLabel = 'Processing...',
  continueError,
}) => {
  const { hubName, dates, caravanClass, pets } = booking;
  const { setData } = useBookingStore();
  const isReady = !!caravanClass;
  const continueGated = continueUnlocked === false;
  const continueDisabled = !isReady || isLoading || continueGated;

  const maxPets =
    caravanClass?.is_pet_friendly && caravanClass.capacity_pets > 0
      ? caravanClass.capacity_pets
      : caravanClass?.is_pet_friendly
        ? 5
        : 0;

  const adjustPets = (next: number) => {
    const clamped = Math.max(0, Math.min(next, maxPets));
    setData({ pets: clamped });
  };

  const fleetSubtitleParts = caravanClass
    ? [
      `${caravanClass.full_capacity} ${caravanClass.full_capacity === 1 ? 'Passenger' : 'Passengers'
      }`,
      ...(caravanClass.is_pet_friendly
        ? ['Pet friendly', `${pets} ${pets === 1 ? 'pet' : 'pets'}`]
        : []),
    ]
    : [];

  const showFinancials = showCaravanPricing;

  return (
    <div className="sticky top-[150px] glass-card rounded-2xl p-5 lg:p-5 xl:p-6 border border-border/10 shadow-2xl bg-stitch-surface/50 backdrop-blur-xl text-stitch-on-background overflow-hidden lg:max-h-[calc(100vh-180px)] flex flex-col relative">
      {/* Accent Glow to match Stitch Design */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-stitch-primary/10 blur-[100px] rounded-full"></div>

      <h2 className="text-lg xl:text-xl font-bold tracking-tight mb-2 lg:mb-3 xl:mb-4 font-headline relative z-10">Your Journey</h2>

      <div className="space-y-2.5 lg:space-y-3 xl:space-y-4 flex-grow overflow-y-auto overflow-x-hidden pr-2 scrollbar-custom mb-4 relative z-10">
        <div className="flex justify-between items-start pb-2 lg:pb-2.5 xl:pb-3 border-b border-border/10">
          <div>
            <span className="text-[8px] uppercase tracking-wider text-muted-foreground/80 font-semibold">
              Location
            </span>
            <p className="font-bold text-sm xl:text-base leading-tight mt-0.5">{hubName || 'Select Hub'}</p>
          </div>
          <MapPin size={14} className="text-stitch-primary-container shrink-0 mt-1" />
        </div>

        <div className="flex justify-between items-start pb-2 lg:pb-2.5 xl:pb-3 border-b border-border/10">
          <div>
            <span className="text-[8px] uppercase tracking-wider text-muted-foreground/80 font-semibold">
              Schedule
            </span>
            <p className="font-bold text-sm xl:text-base leading-tight mt-0.5">{formatBookingTravelWindow(dates)}</p>
          </div>
          <Calendar size={14} className="text-stitch-primary-container shrink-0 mt-1" />
        </div>

        <div className="flex justify-between items-start pt-2">
          {caravanClass ? (
            <div
              className={cn(
                'w-full',
                emphasizeCaravanSelection &&
                cn(
                  'rounded-xl border-2 p-2.5 lg:p-3 xl:p-3.5 bg-stitch-background/40',
                  'border-stitch-primary shadow-[0_0_0_1px_rgba(212,175,55,0.15)]'
                ),
                !emphasizeCaravanSelection && 'space-y-0'
              )}
            >
              <div
                className={cn(
                  'flex items-start justify-between gap-3',
                  emphasizeCaravanSelection
                    ? showFinancials
                      ? 'mb-2'
                      : ''
                    : 'pb-2 lg:pb-2.5 xl:pb-3 border-b border-border/10'
                )}
              >
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-muted-foreground/80 font-semibold block mb-0.5">
                    {emphasizeCaravanSelection ? 'Selected caravan' : 'Fleet'}
                  </span>
                  <p
                    className={cn(
                      'font-bold text-sm xl:text-base font-headline leading-tight',
                      emphasizeCaravanSelection ? 'text-stitch-primary' : ''
                    )}
                  >
                    {caravanClass.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{fleetSubtitleParts.join(' • ')}</p>
                </div>
                <Caravan
                  size={emphasizeCaravanSelection ? 16 : 14}
                  className={cn(
                    'shrink-0 mt-0.5',
                    emphasizeCaravanSelection ? 'text-stitch-primary' : 'text-stitch-primary-container'
                  )}
                />
              </div>

              {showFinancials && (
                <>
                  <div
                    className={cn(
                      'space-y-0.5 lg:space-y-1',
                      emphasizeCaravanSelection ? 'border-t border-border/10 pt-2' : 'pt-2'
                    )}
                  >
                    <div className="flex justify-between gap-3 text-[11px] xl:text-xs">
                      <span className="text-muted-foreground">Price per day</span>
                      <span className="font-semibold text-stitch-primary tabular-nums text-right">
                        ₹
                        {Number.isFinite(Number(caravanClass.day_rate))
                          ? Number(caravanClass.day_rate).toLocaleString('en-IN')
                          : '—'}
                      </span>
                    </div>
                    <p className="text-center text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/60 my-0.5">
                      or
                    </p>
                    <div className="flex justify-between gap-3 text-[11px] xl:text-xs">
                      <span className="text-muted-foreground">Price per km</span>
                      <span className="font-semibold text-stitch-primary tabular-nums text-right">
                        ₹
                        {Number.isFinite(Number(caravanClass.km_rate))
                          ? Number(caravanClass.km_rate).toLocaleString('en-IN')
                          : '—'}
                      </span>
                    </div>
                    <div className="pt-1">
                      <div className="inline-flex items-center gap-1.5 text-[9px] text-muted-foreground leading-tight">
                        <span>We automatically charge the lower price.</span>
                        <span className="relative inline-flex group">
                          <Info className="size-2.5 shrink-0 text-stitch-primary/80 cursor-help" />
                          <span className="pointer-events-none absolute left-1/2 top-[130%] z-20 hidden w-72 -translate-x-1/2 rounded-md border border-border/30 bg-stitch-surface px-3 py-2 text-[11px] font-normal text-stitch-on-background shadow-xl group-hover:block">
                            Depending on distance, duration, and itinerary, we calculate both pricing methods and apply whichever is cheaper.
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {caravanClass.is_pet_friendly && maxPets > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/10">
                      <span className="text-[8px] uppercase tracking-wider text-muted-foreground/80 font-semibold block mb-1">
                        Pets
                      </span>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <PawPrint className="size-3 text-stitch-primary shrink-0" />
                          <span className="text-[11px] xl:text-xs font-medium text-stitch-on-background truncate">
                            Add pet companion
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => adjustPets(pets - 1)}
                            disabled={pets <= 0}
                            className="size-6 rounded border border-border bg-stitch-surface flex items-center justify-center text-stitch-on-background hover:border-stitch-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease pets"
                          >
                            <Minus className="size-2.5" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center tabular-nums">{pets}</span>
                          <button
                            type="button"
                            onClick={() => adjustPets(pets + 1)}
                            disabled={pets >= maxPets}
                            className="size-6 rounded border-2 border-stitch-primary bg-stitch-primary/10 flex items-center justify-center text-stitch-primary hover:bg-stitch-primary/20 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase pets"
                          >
                            <Plus className="size-2.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1.5 flex items-start gap-1.5 text-[9px] text-muted-foreground leading-tight">
                        <Info className="size-2.5 shrink-0 mt-0.5 text-stitch-primary/80" />
                        <span>{PET_CLEANING_NOTE}</span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="w-full text-center py-10 px-4 bg-secondary/30 rounded-2xl border border-dashed border-border">
              <Caravan size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium text-sm">No caravan selected yet</p>
              <p className="text-[10px] text-muted-foreground/60 mt-2 italic px-4">
                Price will be shown after actual route planning
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-2 border-t border-border/10">
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className={cn(
            'w-full py-2 lg:py-2.5 xl:py-3 font-bold rounded-xl flex items-center justify-center gap-2 group transition-all',
            isReady && !continueGated
              ? 'gradient-cta text-stitch-on-primary shadow-lg shadow-stitch-primary/20 active:scale-95'
              : 'bg-stitch-surface-highest/30 text-stitch-on-surface-variant/40 cursor-not-allowed'
          )}
        >
          {isLoading ? continueLoadingLabel : 'Continue to booking'}
          <ArrowRight
            size={16}
            className={cn(isReady && !continueGated && 'group-hover:translate-x-1 transition-transform')}
          />
        </button>

        {!isReady && (
          <p className="text-[9px] text-center text-muted-foreground/50 mt-2 uppercase tracking-[0.1em]">
            Select a fleet to unlock the next step
          </p>
        )}

        {continueError ? (
          <p className="text-center text-xs text-destructive mt-2" role="alert">
            {continueError}
          </p>
        ) : null}

        {isReady && (
          <p className="text-[9px] text-center text-muted-foreground/60 mt-2 flex items-center justify-center gap-1.5 mb-1">
            <Info className="size-2.5 shrink-0" />
            <span>
              {continueGated && continueLockedHint
                ? continueLockedHint
                : 'Free cancellation up to 24 hours before your trip starts.'}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
