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
    if (!sessionOk) return 'Log in to continue to travelers.';
    if (!routePreviewShown) return 'Preview your route to continue.';
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
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8 md:py-10 lg:py-14 text-ink">
      <header className="mb-8 lg:mb-12">
        <span className="label-mono text-gold">Step 02 / The Route</span>
        <h1
          style={{ fontFamily: 'var(--font-display)' }}
          className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink"
        >
          Shape the journey.
        </h1>
        <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-ink-muted">
          Set where you begin and end, add the stops worth slowing down for, and preview the route.
          We will handle the distances and the rest.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:gap-8 xl:grid-cols-[1fr_380px] xl:gap-12">
        <section className="space-y-6 md:space-y-8 lg:space-y-10">
          <JourneyPlannerForm
            routePreviewShown={routePreviewShown}
            onRoutePreviewShownChange={setRoutePreviewShown}
          />
        </section>

        <aside className="relative">
          <BookingSummary
            booking={bookingState}
            onContinue={handleContinue}
            showCaravanPricing={false}
            continueUnlocked={continueUnlocked}
            continueLockedHint={continueLockedHint}
          />
        </aside>
      </div>
    </div>
  );
}
