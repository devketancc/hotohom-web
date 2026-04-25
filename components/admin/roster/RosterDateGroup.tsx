'use client';

import { format, parseISO } from 'date-fns';
import type { AdminRosterBooking } from '@/types/admin';
import { RosterBookingCard, rosterEmphasisFlags } from '@/components/admin/roster/RosterBookingCard';

export function RosterDateGroup({
  dayKey,
  bookings,
  now,
  compact = true,
  onSelectBooking,
}: {
  dayKey: string;
  bookings: AdminRosterBooking[];
  now: Date;
  compact?: boolean;
  onSelectBooking?: (booking: AdminRosterBooking) => void;
}) {
  const header = format(parseISO(dayKey), 'EEE, MMM d');

  return (
    <section className="scroll-mt-3">
      <div className="sticky top-0 z-10 -mx-1 border-b border-white/10 bg-zinc-950/85 px-1 py-1 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/75">
        <h3 className="font-heading text-[11px] font-semibold tracking-wide text-zinc-400">{header}</h3>
      </div>
      <ul className="mt-1.5 flex flex-col gap-1.5 pb-1">
        {bookings.map((b) => {
          const { today, soon } = rosterEmphasisFlags(b, now);
          return (
            <li key={b.booking_id}>
              <RosterBookingCard
                booking={b}
                emphasisToday={today}
                emphasisSoon={soon}
                compact={compact}
                onClick={onSelectBooking ? () => onSelectBooking(b) : undefined}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
