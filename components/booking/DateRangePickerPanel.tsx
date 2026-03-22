'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { cn } from '@/lib/utils';
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  isAfter,
  isBefore,
  startOfToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
} from 'date-fns';

export type DateRangePickerPanelProps = {
  /** Called after user picks an end date (complete range). */
  onRangeComplete?: () => void;
  className?: string;
};

export function DateRangePickerPanel({ onRangeComplete, className }: DateRangePickerPanelProps) {
  const { dates, setDates } = useBookingStore();
  const [currentMonth, setCurrentMonth] = useState(() =>
    dates.start ? new Date(dates.start) : new Date()
  );

  const today = startOfToday();
  const maxDate = addMonths(today, 6);

  const handleDateClick = (date: Date) => {
    if (isBefore(date, today) || isAfter(date, maxDate)) return;

    if (!dates.start || (dates.start && dates.end)) {
      setDates(date, null);
    } else if (dates.start && !dates.end) {
      if (isBefore(date, dates.start)) {
        setDates(date, null);
      } else {
        // Same calendar day as start or any later day: completes range (same day = 1 night / 1 day trip)
        setDates(dates.start, date);
        onRangeComplete?.();
      }
    }
  };

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
          disabled={isBefore(startOfMonth(currentMonth), startOfMonth(today))}
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
          const isDisabled = isBefore(date, today) || isAfter(date, maxDate);
          const isStart = dates.start && isSameDay(date, dates.start);
          const isEnd = dates.end && isSameDay(date, dates.end);
          const isRange =
            dates.start && dates.end && isWithinInterval(date, { start: dates.start, end: dates.end });

          return (
            <button
              key={date.toString()}
              type="button"
              disabled={isDisabled}
              onClick={() => handleDateClick(date)}
              className={cn(
                'h-8 w-8 text-[11px] font-bold rounded-lg transition-all relative flex items-center justify-center',
                isDisabled && 'opacity-10 cursor-not-allowed',
                !isDisabled &&
                  !isStart &&
                  !isEnd &&
                  !isRange &&
                  'hover:bg-stitch-primary/10 hover:text-stitch-primary',
                isStart && 'bg-stitch-primary text-stitch-on-primary shadow-lg scale-110 z-10',
                isEnd && 'bg-stitch-primary text-stitch-on-primary shadow-lg scale-110 z-10',
                isRange && !isStart && !isEnd && 'bg-stitch-primary/20 text-stitch-primary rounded-none'
              )}
            >
              {format(date, 'd')}
              {isStart && !isEnd && dates.end && (
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-stitch-primary/20 -z-10" />
              )}
              {isEnd && dates.start && (
                <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-stitch-primary/20 -z-10" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-medium text-stitch-on-surface-variant">
        <span>Min 1 day</span>
        <span>Max 6 months ahead</span>
      </div>
    </div>
  );
}
