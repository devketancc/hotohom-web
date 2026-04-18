'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  addMonths,
  subMonths,
  addDays,
  isSameDay,
  isAfter,
  isBefore,
  startOfToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';

export type PackageStartDateCalendarProps = {
  selected: Date | null;
  onSelect: (date: Date) => void;
  className?: string;
};

/** Min = tomorrow; max = today + 6 months (inclusive). */
export function PackageStartDateCalendar({ selected, onSelect, className }: PackageStartDateCalendarProps) {
  const today = startOfToday();
  const minDate = addDays(today, 1);
  const maxDate = addMonths(today, 6);

  const [currentMonth, setCurrentMonth] = useState(() =>
    selected ? new Date(selected) : new Date(minDate)
  );

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = startOfMonth(currentMonth).getDay();
  const padding = Array.from({ length: startDay }, () => null);

  return (
    <div
      className={cn(
        'w-[340px] max-w-[min(340px,calc(100vw-2rem))] bg-zinc-900 border border-white/10 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-6',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          disabled={isBefore(startOfMonth(currentMonth), startOfMonth(minDate))}
          className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-30"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-bold text-sm tracking-widest uppercase">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          disabled={isAfter(startOfMonth(currentMonth), startOfMonth(maxDate))}
          className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-30"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={i}
            className="text-[10px] font-black text-stitch-on-surface-variant text-center opacity-50"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {padding.map((__, i) => (
          <div key={`p-${i}`} />
        ))}
        {days.map((date) => {
          const isDisabled = isBefore(date, minDate) || isAfter(date, maxDate);
          const isSel = selected != null && isSameDay(date, selected);

          return (
            <button
              key={date.toString()}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(date)}
              className={cn(
                'h-8 w-8 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center',
                isDisabled && 'opacity-10 cursor-not-allowed',
                !isDisabled && !isSel && 'hover:bg-stitch-primary/10 hover:text-stitch-primary',
                isSel && 'bg-stitch-primary text-stitch-on-primary shadow-lg scale-110 z-10'
              )}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 text-[10px] font-medium text-stitch-on-surface-variant text-center">
        Earliest: tomorrow · Latest: 6 months from today
      </div>
    </div>
  );
}
