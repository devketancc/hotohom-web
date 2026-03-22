import React from 'react';
import { MapPin, Calendar, Caravan, ArrowRight } from 'lucide-react';
import { BookingData } from '@/types/booking';
import { format } from 'date-fns';

interface BookingSummaryProps {
  booking: BookingData;
  onContinue: () => void;
  isLoading?: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({ 
  booking, 
  onContinue,
  isLoading = false 
}) => {
  const { hubName, dates, caravanClass } = booking;
  const isReady = !!caravanClass;

  return (
    <div className="sticky top-24 glass-card rounded-2xl p-8 border border-border/10 shadow-2xl bg-stitch-surface/50 backdrop-blur-xl text-stitch-on-background">
      <h2 className="text-2xl font-bold tracking-tight mb-8 font-headline">Your Journey</h2>
      
      <div className="space-y-6 mb-10">
        <div className="flex justify-between items-start pb-6 border-b border-border/10">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Location</span>
            <p className="font-bold text-lg">{hubName || 'Select Hub'}</p>
          </div>
          <MapPin size={20} className="text-primary" />
        </div>

        <div className="flex justify-between items-start pb-6 border-b border-border/10">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Schedule</span>
            <p className="font-bold text-lg">
              {dates.start ? format(new Date(dates.start), 'dd MMM') : 'Start'} - {dates.end ? format(new Date(dates.end), 'dd MMM') : 'End'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{dates.totalDays} Full Days Selection</p>
          </div>
          <Calendar size={20} className="text-primary" />
        </div>

        <div className="flex justify-between items-start pt-2">
          {caravanClass ? (
            <div className="w-full p-6 bg-primary/5 rounded-2xl border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Caravan size={20} className="text-primary" />
                <p className="font-bold">{caravanClass.name}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span className="font-semibold text-primary">₹{Number(caravanClass.day_rate).toLocaleString()}/day</span>
              </div>
            </div>
          ) : (
            <div className="w-full text-center py-10 px-4 bg-secondary/30 rounded-2xl border border-dashed border-border">
              <Caravan size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium text-sm">No caravan selected yet</p>
              <p className="text-[10px] text-muted-foreground/60 mt-2 italic px-4">Price will be shown after caravan selection</p>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={onContinue}
        disabled={!isReady || isLoading}
        className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 group transition-all ${
          isReady 
            ? 'gradient-cta text-stitch-on-primary shadow-lg shadow-stitch-primary/20 active:scale-95' 
            : 'bg-stitch-surface-highest/30 text-stitch-on-surface-variant/40 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Processing...' : 'Continue'}
        <ArrowRight size={18} className={`transition-transform ${isReady ? 'group-hover:translate-x-1' : ''}`} />
      </button>
      
      {!isReady && (
        <p className="text-[10px] text-center text-muted-foreground/50 mt-4 uppercase tracking-[0.1em]">
          Select a fleet to unlock the next step
        </p>
      )}
    </div>
  );
};
