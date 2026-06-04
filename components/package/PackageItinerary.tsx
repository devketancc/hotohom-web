'use client';

import { useState } from 'react';
import {
  ChevronDown,
  MapPin,
  Moon,
  Route,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/shared/Reveal';
import type { PackageDay, TravelPackage } from '@/types/package';
import { formatStayType, formatStopType } from '@/utils/packageLabels';

type PackageItineraryProps = {
  days: TravelPackage['days'];
  className?: string;
};

function sortedDays(days: PackageDay[]): PackageDay[] {
  return [...(days ?? [])].sort((a, b) => a.day_number - b.day_number);
}

function DayStayCard({ day }: { day: PackageDay }) {
  const hasStay =
    day.stay_type !== 'none' ||
    day.stay_name?.trim() ||
    day.stay_address?.trim() ||
    day.stay_notes?.trim();

  if (!hasStay) return null;

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-stitch-surface/30 p-4">
      <div className="flex items-start gap-2">
        <Moon className="mt-0.5 size-4 text-stitch-primary shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-stitch-on-surface-variant font-headline">
            {formatStayType(day.stay_type)}
          </p>
          {day.stay_name?.trim() ? (
            <p className="mt-1 font-bold text-stitch-on-background font-body">{day.stay_name}</p>
          ) : null}
          {day.stay_location_detail?.name ? (
            <p className="mt-1 text-sm text-stitch-on-surface-variant font-body">
              {day.stay_location_detail.name}
            </p>
          ) : null}
          {day.stay_address?.trim() ? (
            <p className="mt-1 text-sm text-stitch-on-surface-variant font-body">{day.stay_address}</p>
          ) : null}
          {day.amenities?.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-sm text-stitch-on-surface-variant font-body">
              {day.amenities.map((a, i) => (
                <li key={`${a}-${i}`}>{a}</li>
              ))}
            </ul>
          ) : null}
          {day.stay_notes?.trim() ? (
            <p className="mt-2 text-sm italic text-stitch-on-surface-variant font-body">{day.stay_notes}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DayStops({ day, defaultOpen }: { day: PackageDay; defaultOpen: boolean }) {
  const stops = [...(day.stops ?? [])].sort((a, b) => a.order - b.order);
  const [open, setOpen] = useState(defaultOpen);

  if (stops.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg py-2 text-left text-sm font-bold text-stitch-primary font-headline hover:text-stitch-on-background transition-colors"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <Route className="size-4" aria-hidden />
          Route ({stops.length} {stops.length === 1 ? 'stop' : 'stops'})
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open && (
        <ol className="mt-2 space-y-3 border-l border-stitch-primary/30 pl-4 ml-1">
          {stops.map((stop) => (
            <li key={stop.id} className="relative">
              <span
                className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-stitch-primary ring-4 ring-stitch-background"
                aria-hidden
              />
              <p className="text-[10px] font-black uppercase tracking-wider text-stitch-on-surface-variant font-headline">
                {formatStopType(stop.stop_type)}
              </p>
              {stop.title?.trim() ? (
                <p className="font-bold text-stitch-on-background font-body">{stop.title}</p>
              ) : null}
              <p className="text-sm text-stitch-on-surface-variant font-body inline-flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0 text-stitch-primary" aria-hidden />
                {stop.location_name}
              </p>
              {stop.distance_from_prev_km != null && stop.distance_from_prev_km > 0 ? (
                <p className="text-xs text-stitch-on-surface-variant font-body">
                  {stop.distance_from_prev_km.toLocaleString('en-IN')} km from previous stop
                </p>
              ) : null}
              {stop.notes?.trim() ? (
                <p className="mt-1 text-sm text-stitch-on-surface-variant font-body">{stop.notes}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function DayBlock({ day, index }: { day: PackageDay; index: number }) {
  return (
    <Reveal as="article" delay={index * 0.06} className="relative pl-0 md:pl-2">
      <div className="flex gap-4 md:gap-6">
        <div
          className="hidden md:flex flex-col items-center shrink-0"
          aria-hidden
        >
          <div className="flex size-12 items-center justify-center rounded-2xl border border-stitch-primary/30 bg-stitch-primary/10 font-black text-stitch-primary font-headline">
            {day.day_number}
          </div>
          <div className="mt-2 w-px flex-1 min-h-[40px] bg-gradient-to-b from-stitch-primary/40 to-transparent" />
        </div>
        <div className="min-w-0 flex-1 glass-card rounded-2xl border border-white/10 p-5 md:p-6">
          <p className="md:hidden text-[10px] font-black uppercase tracking-widest text-stitch-primary font-headline mb-1">
            Day {day.day_number}
          </p>
          <h3 className="text-xl font-bold text-stitch-on-background font-headline md:text-2xl">
            {day.title}
          </h3>
          {day.description?.trim() ? (
            <p className="mt-3 text-stitch-on-surface-variant font-body leading-relaxed">
              {day.description}
            </p>
          ) : null}
          <DayStayCard day={day} />
          <DayStops day={day} defaultOpen={index < 2} />
        </div>
      </div>
    </Reveal>
  );
}

export function PackageItinerary({ days, className }: PackageItineraryProps) {
  const sorted = sortedDays(days);

  return (
    <section className={cn(className)}>
      <h2 className="mb-8 text-xs font-black uppercase tracking-widest text-stitch-primary font-headline">
        Day-by-day itinerary
      </h2>
      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-stitch-surface/20 px-6 py-10 text-center text-stitch-on-surface-variant font-body">
          Itinerary coming soon. Contact us for route details.
        </p>
      ) : (
        <div className="space-y-8 md:space-y-10">
          {sorted.map((day, index) => (
            <DayBlock key={day.id} day={day} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
