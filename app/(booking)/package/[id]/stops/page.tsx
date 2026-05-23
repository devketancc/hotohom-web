'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PackagePickupDropPlanner } from '@/components/package/PackagePickupDropPlanner';
import { useBookingStore } from '@/store/bookingStore';

export default function PackageStopsPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const hasHydrated = useBookingStore((s) => s.hasHydrated);
  const bookingFlow = useBookingStore((s) => s.bookingFlow);
  const activePackage = useBookingStore((s) => s.activePackage);
  const flow = bookingFlow ?? 'standard';

  const ok = flow === 'package' && activePackage && activePackage.id === id;

  useEffect(() => {
    if (!hasHydrated || !id) return;
    if (!ok) {
      router.replace(`/packages/${id}`);
    }
  }, [hasHydrated, id, ok, router]);

  if (!hasHydrated || !ok) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-stitch-on-background">
        <Loader2 className="size-10 animate-spin text-stitch-primary" />
        <p className="text-sm text-stitch-on-surface-variant">
          {!hasHydrated ? 'Loading your booking…' : 'Redirecting…'}
        </p>
      </div>
    );
  }

  return <PackagePickupDropPlanner packageId={id} />;
}
