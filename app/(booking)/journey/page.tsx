'use client';

import { useEffect, useMemo, useState } from 'react';
import { JourneyPlannerForm } from '@/components/booking/JourneyPlannerForm';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { useBookingStore } from '@/store/bookingStore';
import { useRouter } from 'next/navigation';
import { isAuthed, requestAuthThenNavigate } from '@/lib/authNavigation';
import { useAuth } from '@/hooks/useAuth';

export default function JourneyDetailsPage() {
  const router = useRouter();
  const bookingState = useBookingStore();
  const { isAuthenticated, user } = useAuth();
  const [routePreviewShown, setRoutePreviewShown] = useState(false);

  const sessionOk = isAuthenticated && !!user;

  useEffect(() => {
    if (!sessionOk) setRoutePreviewShown(false);
  }, [sessionOk]);

  const continueUnlocked = sessionOk && routePreviewShown;

  const continueLockedHint = useMemo(() => {
    if (!bookingState.caravanClass) return undefined;
    if (!sessionOk) return 'Log in to continue to booking.';
    if (!routePreviewShown) return 'Click Show route to preview your journey first.';
    return undefined;
  }, [bookingState.caravanClass, sessionOk, routePreviewShown]);

  const handleContinue = () => {
    if (!isAuthed()) {
      requestAuthThenNavigate('/passenger');
      return;
    }
    router.push('/passenger');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-10 w-full grid grid-cols-1 md:grid-cols-[1fr_380px] gap-12 text-stitch-on-background">
      <section className="space-y-10">
        <JourneyPlannerForm
          routePreviewShown={routePreviewShown}
          onRoutePreviewShownChange={setRoutePreviewShown}
        />
      </section>

      <aside className="relative">
        <BookingSummary
          booking={bookingState}
          onContinue={handleContinue}
          isLoading={false}
          showCaravanPricing={false}
          continueUnlocked={continueUnlocked}
          continueLockedHint={continueLockedHint}
        />
      </aside>
    </div>
  );
}
