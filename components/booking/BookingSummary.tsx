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
  onContinue: () => void;
  isLoading?: boolean;
  /** Golden highlighted caravan card (select-caravan). Journey / map use compact row. */
  emphasizeCaravanSelection?: boolean;
  /** Day rate, pets stepper, total estimate (off on journey steps after caravan is chosen). */
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

  const dayRate = caravanClass ? Number(caravanClass.day_rate) : 0;
  const tripDays = Math.max(dates.totalDays || 1, 1);
  const totalEstimate = caravanClass ? dayRate * tripDays : 0;

  const adjustPets = (next: number) => {
    const clamped = Math.max(0, Math.min(next, maxPets));
    setData({ pets: clamped });
  };

  const fleetSubtitleParts = caravanClass
    ? [
        `${caravanClass.full_capacity} ${
          caravanClass.full_capacity === 1 ? 'Passenger' : 'Passengers'
        }`,
        ...(caravanClass.is_pet_friendly
          ? ['Pet friendly', `${pets} ${pets === 1 ? 'pet' : 'pets'}`]
          : []),
      ]
    : [];

  const showFinancials = showCaravanPricing;

  return (
    <div className="sticky top-24 glass-card rounded-2xl p-8 border border-border/10 shadow-2xl bg-stitch-surface/50 backdrop-blur-xl text-stitch-on-background overflow-hidden relative">
      {/* Accent Glow to match Stitch Design */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-stitch-primary/10 blur-[100px] rounded-full"></div>

      <h2 className="text-2xl font-bold tracking-tight mb-8 font-headline relative z-10">Your Journey</h2>

      <div className="space-y-6 mb-10 relative z-10">
        <div className="flex justify-between items-start pb-6 border-b border-border/10">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Location
            </span>
            <p className="font-bold text-lg">{hubName || 'Select Hub'}</p>
          </div>
          <MapPin size={20} className="text-stitch-primary-container" />
        </div>

        <div className="flex justify-between items-start pb-6 border-b border-border/10">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Schedule
            </span>
            <p className="font-bold text-lg">{formatBookingTravelWindow(dates)}</p>
          </div>
          <Calendar size={20} className="text-stitch-primary-container" />
        </div>

        <div className="flex justify-between items-start pt-2">
          {caravanClass ? (
            <div
              className={cn(
                'w-full',
                emphasizeCaravanSelection &&
                  cn(
                    'rounded-2xl border-2 p-6 bg-stitch-background/40',
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
                      ? 'mb-4'
                      : ''
                    : 'pb-6 border-b border-border/10'
                )}
              >
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block mb-1">
                    {emphasizeCaravanSelection ? 'Selected caravan' : 'Fleet'}
                  </span>
                  <p
                    className={cn(
                      'font-bold text-lg font-headline',
                      emphasizeCaravanSelection ? 'text-stitch-primary' : ''
                    )}
                  >
                    {caravanClass.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{fleetSubtitleParts.join(' • ')}</p>
                </div>
                <Caravan
                  size={emphasizeCaravanSelection ? 22 : 20}
                  className={cn(
                    'shrink-0',
                    emphasizeCaravanSelection ? 'text-stitch-primary' : 'text-stitch-primary-container'
                  )}
                />
              </div>

              {showFinancials && (
                <>
                  <div
                    className={cn(
                      'flex justify-between text-sm',
                      emphasizeCaravanSelection ? 'border-t border-border/10 pt-4' : 'pt-4'
                    )}
                  >
                    <span className="text-muted-foreground">Day rate</span>
                    <span className="font-semibold text-stitch-primary">
                      ₹{Number(caravanClass.day_rate).toLocaleString('en-IN')}/day
                    </span>
                  </div>

                  {caravanClass.is_pet_friendly && maxPets > 0 && (
                    <div className="mt-5 pt-5 border-t border-border/10">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block mb-3">
                        Pets
                      </span>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <PawPrint className="size-4 text-stitch-primary shrink-0" />
                          <span className="text-sm font-medium text-stitch-on-background truncate">
                            Add pet companion
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => adjustPets(pets - 1)}
                            disabled={pets <= 0}
                            className="size-9 rounded-lg border border-border bg-stitch-surface flex items-center justify-center text-stitch-on-background hover:border-stitch-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease pets"
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center tabular-nums">{pets}</span>
                          <button
                            type="button"
                            onClick={() => adjustPets(pets + 1)}
                            disabled={pets >= maxPets}
                            className="size-9 rounded-lg border-2 border-stitch-primary bg-stitch-primary/10 flex items-center justify-center text-stitch-primary hover:bg-stitch-primary/20 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase pets"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 flex items-start gap-2 text-[11px] text-muted-foreground leading-snug">
                        <Info className="size-3.5 shrink-0 mt-0.5 text-stitch-primary/80" />
                        <span>{PET_CLEANING_NOTE}</span>
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-border/10">
                    <span className="text-sm font-medium text-stitch-on-background">Total estimate</span>
                    <span className="text-2xl font-bold text-stitch-primary tabular-nums">
                      ₹{totalEstimate.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-2 text-right">
                    Based on day rate × {tripDays} {tripDays === 1 ? 'day' : 'days'} (excl. add-ons &amp; taxes)
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="w-full text-center py-10 px-4 bg-secondary/30 rounded-2xl border border-dashed border-border">
              <Caravan size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium text-sm">No caravan selected yet</p>
              <p className="text-[10px] text-muted-foreground/60 mt-2 italic px-4">
                Price will be shown after caravan selection
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={continueDisabled}
        className={cn(
          'w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 group transition-all',
          isReady && !continueGated
            ? 'gradient-cta text-stitch-on-primary shadow-lg shadow-stitch-primary/20 active:scale-95'
            : 'bg-stitch-surface-highest/30 text-stitch-on-surface-variant/40 cursor-not-allowed'
        )}
      >
        {isLoading ? 'Processing...' : 'Continue to booking'}
        <ArrowRight
          size={18}
          className={cn(isReady && !continueGated && 'group-hover:translate-x-1 transition-transform')}
        />
      </button>

      {!isReady && (
        <p className="text-[10px] text-center text-muted-foreground/50 mt-4 uppercase tracking-[0.1em]">
          Select a fleet to unlock the next step
        </p>
      )}

      {isReady && (
        <p className="text-[10px] text-center text-muted-foreground/60 mt-4 flex items-center justify-center gap-1.5">
          <Info className="size-3 shrink-0" />
          <span>
            {continueGated && continueLockedHint
              ? continueLockedHint
              : 'Free cancellation up to 24 hours before your trip starts.'}
          </span>
        </p>
      )}
    </div>
  );
};
