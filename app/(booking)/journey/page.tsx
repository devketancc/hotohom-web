'use client';

import { JourneyPlannerForm } from '@/components/booking/JourneyPlannerForm';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { useBookingStore } from '@/store/bookingStore';
import { useRouter } from 'next/navigation';
import { isAuthed, requestAuthThenNavigate } from '@/lib/authNavigation';

export default function JourneyDetailsPage() {
  const router = useRouter();
  const bookingState = useBookingStore();

  const handleContinue = () => {
    if (!isAuthed()) {
      requestAuthThenNavigate('/passenger');
      return;
    }
    router.push('/passenger');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-10 w-full grid grid-cols-1 md:grid-cols-[1fr_380px] gap-12 text-stitch-on-background">
      {/* LEFT PANEL: Journey Planning Inputs (70%) */}
      <section className="space-y-10">
        <JourneyPlannerForm />
      </section>

      {/* RIGHT PANEL: Sticky Summary (30%) */}
      <aside className="relative">
        <BookingSummary
          booking={bookingState}
          onContinue={handleContinue}
          isLoading={false}
          showCaravanPricing={false}
        />
      </aside>
    </div>
  );
}
