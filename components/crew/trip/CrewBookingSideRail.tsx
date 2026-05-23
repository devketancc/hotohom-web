'use client';

import { Phone } from 'lucide-react';
import { CrewRouteStopsCard } from '@/components/crew/trip/CrewRouteStopsCard';
import { CrewCollapsibleSection } from '@/components/crew/trip/CrewCollapsibleSection';
import { CrewAddonsCarryList } from '@/components/crew/trip/CrewAddonsCarryList';
import { pricingModeLabel } from '@/lib/crewBookingUi';
import type { CrewBookingDetail } from '@/types/crew';

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground break-words">{value}</dd>
    </div>
  );
}

function PhoneRow({ label, phone }: { label: string; phone: string | null | undefined }) {
  if (!phone?.trim()) {
    return (
      <div className="flex justify-between gap-3 py-1.5 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground/70">—</span>
      </div>
    );
  }
  return (
    <div className="flex justify-between gap-3 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <a
        href={`tel:${phone.replace(/\s/g, '')}`}
        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
      >
        <Phone className="size-3.5 shrink-0" aria-hidden />
        {phone}
      </a>
    </div>
  );
}

export function CrewBookingSideRail({
  booking,
  hideAddons = false,
  tripStarted = false,
}: {
  booking: CrewBookingDetail;
  hideAddons?: boolean;
  /** When true, side sections default collapsed on mobile to save space. */
  tripStarted?: boolean;
}) {
  const assignment = booking.assignment;
  const items = booking.items ?? [];
  const customerSubtitle = [booking.customer_name, booking.caravan_name].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-col gap-4">
      <CrewCollapsibleSection
        title="Customer & caravan"
        subtitle={customerSubtitle || 'Contact details'}
        defaultCollapsed={tripStarted}
      >
        <dl className="space-y-0">
          <DetailRow label="Customer" value={booking.customer_name || '—'} />
          <PhoneRow label="Customer phone" phone={booking.customer_phone} />
          <DetailRow label="Caravan" value={booking.caravan_name || '—'} />
          <DetailRow label="Class" value={booking.caravan_class_name || booking.caravan_class || '—'} />
          <PhoneRow label="Driver" phone={assignment?.driver_phone} />
          <PhoneRow label="Helper" phone={assignment?.helper_phone} />
        </dl>
      </CrewCollapsibleSection>

      <CrewRouteStopsCard stops={booking.stops} />

      <CrewCollapsibleSection
        title="Trip overview"
        subtitle={`${booking.total_days} days · ${booking.num_humans} guests`}
        defaultCollapsed={tripStarted}
      >
        <dl>
          <DetailRow label="Total days" value={booking.total_days} />
          <DetailRow label="Guests" value={booking.num_humans} />
          <DetailRow label="Pets" value={booking.num_pets} />
          <DetailRow label="One-way" value={booking.is_one_way ? 'Yes' : 'No'} />
          <DetailRow label="Booking type" value={booking.booking_type || '—'} />
          <DetailRow label="Source" value={booking.source || '—'} />
          <DetailRow label="Pricing" value={pricingModeLabel(booking.pricing_mode)} />
          <DetailRow label="Estimated km" value={booking.estimated_km?.toLocaleString() ?? '—'} />
          <DetailRow label="Buffered km" value={booking.buffered_km?.toLocaleString() ?? '—'} />
          <DetailRow label="Avg km / day" value={booking.avg_km_per_day?.toLocaleString() ?? '—'} />
        </dl>
      </CrewCollapsibleSection>

      {!hideAddons && items.length > 0 ? (
        <CrewCollapsibleSection
          title="Add-ons"
          subtitle={`${items.length} ${items.length === 1 ? 'item' : 'items'}`}
          defaultCollapsed={tripStarted}
        >
          <CrewAddonsCarryList items={items} compact />
        </CrewCollapsibleSection>
      ) : null}
    </div>
  );
}
