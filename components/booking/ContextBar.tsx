'use client';

import React from 'react';
import { useBooking } from '@/hooks/useBooking';
import { format } from 'date-fns';
import { Edit2, CheckCircle } from 'lucide-react';

export const ContextBar: React.FC = () => {
  const { bookingState } = useBooking();
  const { hubName, dates } = bookingState;

  const dateRange = dates.start && dates.end 
    ? `${format(new Date(dates.start), 'dd MMM')} - ${format(new Date(dates.end), 'dd MMM')}`
    : 'Select Dates';

  return (
    <div className="bg-stitch-surface/50 border-b border-border/10 sticky top-[73px] z-40 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between text-stitch-on-background">
        <div className="flex items-center gap-8 md:gap-12">
          {/* Hub Selection */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Hub</span>
            <div className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors">
              <span className="font-bold text-primary">{hubName || 'Select Hub'}</span>
              <Edit2 size={12} className="text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* Date Selection */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Dates</span>
            <div className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors">
              <span className="font-bold text-primary">{dateRange}</span>
              <Edit2 size={12} className="text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* Duration Selection */}
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Duration</span>
            <div className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors">
              <span className="font-bold text-primary">{dates.totalDays} Days</span>
              <Edit2 size={12} className="text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5 py-1.5 px-3 bg-primary/5 rounded-full border border-primary/10">
            <CheckCircle size={14} className="text-primary" /> Elite Tier Concierge Active
          </span>
        </div>
      </div>
    </div>
  );
};
