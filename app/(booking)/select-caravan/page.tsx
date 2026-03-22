'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { bookingService } from '@/services/booking.service';
import { useBooking } from '@/hooks/useBooking';
import { CaravanCard } from '@/components/booking/CaravanCard';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { format } from 'date-fns';
import { CaravanClass } from '@/types/booking';
import { Loader2, AlertCircle, RefreshCw, Caravan, Calendar } from 'lucide-react';

export default function SelectCaravanPage() {
  const router = useRouter();
  const { bookingState } = useBooking();
  const { hub, dates, setData } = bookingState;

  // Prepare parameters for the API
  const start = dates.start ? format(new Date(dates.start), 'yyyy-MM-dd') : null;
  const end = dates.end ? format(new Date(dates.end), 'yyyy-MM-dd') : null;
  const hasCompleteDateRange = !!start && !!end;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['availableCaravans', hub, start, end],
    queryFn: () => bookingService.getAvailableCaravans({ 
      hub: hub!, 
      start: start!, 
      end: end! 
    }),
    enabled: !!hub && hasCompleteDateRange,
  });

  const handleSelect = (caravan: CaravanClass) => {
    setData({
      caravanClass: caravan,
      pets: 0,
      passengers: caravan.full_capacity,
    });
  };

  const handleContinue = () => {
    if (bookingState.caravanClass) {
      router.push('/journey');
    }
  };

  if (!hub) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-card rounded-3xl border border-dashed border-border/50">
        <AlertCircle size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Booking details missing</h2>
        <p className="text-muted-foreground mb-6">Please select a hub and dates on the home screen first.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-10 lg:px-8 text-stitch-on-background">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Caravan Selection List */}
        <div className="flex-grow lg:w-[70%]">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 font-headline">Select Your Fleet</h1>
            <p className="text-stitch-on-surface-variant max-w-2xl font-body">
              Tailored for the modern nomad. Each caravan is a masterpiece of engineering and luxury, designed for your ultimate comfort on the open road.
            </p>
          </header>

          {!hasCompleteDateRange ? (
            <div className="flex flex-col items-center justify-center py-20 bg-stitch-surface/30 rounded-3xl border border-border/10 text-center px-6">
              <Calendar size={40} className="text-stitch-primary/80" />
              <h3 className="text-xl font-bold mb-2 mt-4 font-headline">Finish your dates</h3>
              <p className="text-stitch-on-surface-variant max-w-md">
                Choose a start and end date in the <span className="font-semibold text-stitch-on-background">Dates</span> control above. Availability loads after both dates are selected.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-stitch-surface/30 rounded-3xl border border-border/10">
              <Loader2 className="animate-spin text-stitch-primary mb-4" size={40} />
              <p className="text-stitch-on-surface-variant font-medium">Scanning the fleet for availability...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20 text-center px-6">
              <AlertCircle className="text-destructive mb-4" size={40} />
              <h3 className="text-xl font-bold mb-2 font-headline">Failed to fetch available caravans</h3>
              <p className="text-stitch-on-surface-variant mb-6">{(error as any)?.message || 'Something went wrong while connecting to the server.'}</p>
              <button 
                onClick={() => refetch()}
                className="flex items-center gap-2 px-6 py-2 border border-border rounded-xl hover:bg-stitch-surface transition-all"
              >
                <RefreshCw size={18} /> Try Again
              </button>
            </div>
          ) : data?.data?.available_classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-stitch-surface rounded-3xl border border-dashed border-border/50 text-center px-6">
              <Caravan size={48} className="text-stitch-on-surface-variant/30 mb-4" />
              <h3 className="text-xl font-bold mb-2 font-headline">No Caravans Available</h3>
              <p className="text-stitch-on-surface-variant mb-6">We couldn't find any available caravans for your selected dates and hub. Please try different dates or another hub.</p>
              <button 
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-stitch-primary text-stitch-on-primary font-bold rounded-xl"
              >
                Change Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data?.data?.available_classes.map((caravan, index) => (
                <CaravanCard 
                  key={caravan.id}
                  caravan={caravan}
                  isSelected={bookingState.caravanClass?.id === caravan.id}
                  onSelect={handleSelect}
                  isPopular={index === 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Journey Summary Sidebar */}
        <aside className="lg:w-[30%]">
          <BookingSummary
            booking={bookingState}
            onContinue={handleContinue}
            isLoading={false}
            emphasizeCaravanSelection
          />
        </aside>
      </div>
    </div>
  );
}
