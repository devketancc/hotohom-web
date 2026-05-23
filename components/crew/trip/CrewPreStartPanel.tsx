'use client';

import type { ReactNode } from 'react';
import {
  Bell,
  Car,
  CheckCircle2,
  MessageCircle,
  Receipt,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { CrewAddonsCarryHeader, CrewAddonsCarryList } from '@/components/crew/trip/CrewAddonsCarryList';
import { sortedStops } from '@/lib/customerBookingUi';
import { telUrl } from '@/lib/crewBookingUi';
import type { CrewBookingDetail } from '@/types/crew';

function formatPickupTime(booking: CrewBookingDetail): string {
  const pickup = sortedStops(booking.stops).find((s) => s.stop_type === 'pickup');
  const iso = pickup?.estimated_arrival || booking.start_datetime;
  if (!iso) return 'scheduled time';
  try {
    return format(parseISO(iso), 'hh:mm a');
  } catch {
    try {
      return format(new Date(iso), 'hh:mm a');
    } catch {
      return 'scheduled time';
    }
  }
}

function PreStartStep({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  action,
}: {
  icon: typeof Car;
  iconClassName: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <li className="flex gap-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-3">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </li>
  );
}

export function CrewPreStartPanel({ booking }: { booking: CrewBookingDetail }) {
  const items = booking.items ?? [];
  const pickupTime = formatPickupTime(booking);
  const customerPhone = booking.customer_phone?.trim();
  const hasAddons = items.length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden />
          </span>
          <h2 className="text-base font-bold tracking-tight">What to do before start</h2>
        </div>

        <ul className="space-y-2">
          <PreStartStep
            icon={Car}
            iconClassName="bg-emerald-500/20 text-emerald-400"
            title={`Reach pickup location by ${pickupTime}`}
            subtitle="Be on time at the pickup point."
          />
          <PreStartStep
            icon={Briefcase}
            iconClassName="bg-blue-500/20 text-blue-300"
            title={hasAddons ? 'Carry all add-ons listed on the right' : 'Review trip details on the right'}
            subtitle={hasAddons ? "Don't forget anything important." : 'Check route, customer, and caravan info.'}
          />
          <PreStartStep
            icon={MessageCircle}
            iconClassName="bg-violet-500/20 text-violet-300"
            title="Call customer 30 mins before pickup"
            subtitle="Confirm pickup and timing."
            action={
              customerPhone ? (
                <a
                  href={telUrl(customerPhone)}
                  className="inline-flex text-xs font-semibold text-primary hover:underline"
                >
                  Call {booking.customer_name || 'customer'}
                </a>
              ) : null
            }
          />
          <PreStartStep
            icon={Receipt}
            iconClassName="bg-red-500/20 text-red-300"
            title="Keep toll receipts & expenses"
            subtitle="You will need them during the trip."
          />
        </ul>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5">
          <Sparkles className="size-4 shrink-0 text-emerald-400" aria-hidden />
          <p className="text-sm font-medium text-emerald-100/90">Drive safe and have a great trip!</p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-5">
        <CrewAddonsCarryHeader count={items.length} />
        <CrewAddonsCarryList items={items} />
        {hasAddons ? (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5">
            <Bell className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
            <p className="text-xs font-medium text-amber-100/90">
              Make sure to carry all add-ons before starting.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
