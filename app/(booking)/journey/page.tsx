'use client';

import { useEffect, useMemo, useState } from 'react';
import { JourneyPlannerForm } from '@/components/booking/JourneyPlannerForm';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { useBookingStore } from '@/store/bookingStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { isAuthed, requestAuthThenNavigate } from '@/lib/authNavigation';
import { useAuth } from '@/hooks/useAuth';
import { buildCartPayload } from '@/utils/buildCartPayload';
import { cartService } from '@/services/cart.service';

export default function JourneyDetailsPage() {
  const router = useRouter();
  const bookingState = useBookingStore();
  const { isAuthenticated, user } = useAuth();
  const [routePreviewShown, setRoutePreviewShown] = useState(false);
  const [continueLoading, setContinueLoading] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);

  const sessionOk = isAuthenticated && !!user;

  useEffect(() => {
    if (!sessionOk) setRoutePreviewShown(false);
  }, [sessionOk]);

  useEffect(() => {
    setContinueError(null);
  }, [routePreviewShown, bookingState.journey, bookingState.caravanClass, bookingState.hub]);

  const continueUnlocked = sessionOk && routePreviewShown;

  const continueLockedHint = useMemo(() => {
    if (!bookingState.caravanClass) return undefined;
    if (!sessionOk) return 'Log in to continue to booking.';
    if (!routePreviewShown) return 'Click Show route to preview your journey first.';
    return undefined;
  }, [bookingState.caravanClass, sessionOk, routePreviewShown]);

  const handleContinue = async () => {
    if (!isAuthed()) {
      requestAuthThenNavigate('/booking/summary');
      return;
    }
    setContinueError(null);
    setContinueLoading(true);
    try {
      const payload = buildCartPayload(bookingState);
      const cart = await cartService.createCart(payload);
      useCartStore.getState().setCart(cart);
      router.push('/booking/summary');
    } catch {
      setContinueError('Failed to calculate trip cost');
    } finally {
      setContinueLoading(false);
    }
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
          isLoading={continueLoading}
          continueLoadingLabel="Calculating best price..."
          continueError={continueError}
          showCaravanPricing={false}
          continueUnlocked={continueUnlocked}
          continueLockedHint={continueLockedHint}
        />
      </aside>
    </div>
  );
}
