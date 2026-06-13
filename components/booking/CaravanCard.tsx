import React from 'react';
import { CaravanClass } from '@/types/booking';
import { Users, Dog, Check, ArrowRight } from 'lucide-react';

interface CaravanCardProps {
  caravan: CaravanClass;
  onSelect: (caravan: CaravanClass) => void;
  isSelected: boolean;
  isPopular?: boolean;
}

const CARAVAN_IMAGES = [
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?q=80&w=1200&auto=format&fit=crop',
];

function imageFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CARAVAN_IMAGES[hash % CARAVAN_IMAGES.length];
}

function inr(value: string): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString('en-IN') : '—';
}

export const CaravanCard: React.FC<CaravanCardProps> = ({
  caravan,
  onSelect,
  isSelected,
  isPopular = false,
}) => {
  return (
    // Double-Bezel outer shell
    <div
      className={[
        'group relative rounded-[2rem] p-1.5 ring-1 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isSelected
          ? 'bg-gold/[0.06] ring-gold/40 shadow-glow-gold'
          : 'bg-white/[0.02] ring-white/[0.06] hover:ring-white/15',
      ].join(' ')}
    >
      <div className="overflow-hidden rounded-[calc(2rem-0.375rem)] bg-surface-1">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageFor(caravan.id)}
            alt={caravan.name}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent" />

          {isPopular && (
            <span className="label-mono absolute left-5 top-5 rounded-full bg-gold px-3 py-1.5 text-[9px] text-gold-ink">
              Most Chosen
            </span>
          )}
          {caravan.available_count > 0 && (
            <span className="label-mono absolute right-5 top-5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[9px] text-ink/80 backdrop-blur-sm">
              {caravan.available_count} available
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-2xl font-semibold tracking-[-0.02em] text-ink"
              >
                {caravan.name}
              </h3>
              <p className="mt-1 max-w-xs font-body text-sm leading-relaxed text-ink-muted line-clamp-2">
                {caravan.description}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="label-mono text-ink-faint">From</p>
              <p
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-2xl font-semibold text-gold"
              >
                ₹{inr(caravan.day_rate)}
              </p>
              <p className="label-mono text-ink-faint">/ day</p>
            </div>
          </div>

          {/* Spec row */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
              <Users size={13} /> {caravan.full_capacity} guests
            </span>
            {caravan.is_pet_friendly && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                <Dog size={13} /> Pet friendly
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
              ₹{inr(caravan.km_rate)} / km
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(caravan)}
            className={[
              'mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]',
              isSelected
                ? 'gradient-cta text-gold-ink'
                : 'border border-white/12 text-ink hover:border-gold/40 hover:text-gold',
            ].join(' ')}
          >
            {isSelected ? (
              <>
                <Check size={16} /> Selected
              </>
            ) : (
              <>
                Choose this caravan
                <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
