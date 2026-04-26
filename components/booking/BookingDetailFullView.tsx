'use client';

import Link from 'next/link';
import { Calendar, Car, CircleDot, Flag, MapPin, Phone, Route, Users } from 'lucide-react';
import { getBookingAssignmentDisplay } from '@/lib/bookingAssignment';
import { sortedStops, statusPillClass } from '@/lib/customerBookingUi';
import { cn } from '@/lib/utils';
import { DetailRow, formatIsoDateTime, MoneyLine } from '@/components/booking/BookingDetailAtoms';
import type { AdminBookingDetail } from '@/types/admin';
import type { CustomerBookingDetail } from '@/types/customerBooking';
import { formatDate, formatInr, formatIsoDateRange } from '@/utils/format';

type BookingDetailLike = CustomerBookingDetail | AdminBookingDetail;

function parseMoney(s: string): number {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function pricingModeLabel(pricingMode: string): string {
  if (pricingMode === 'day') return 'Day-wise';
  if (pricingMode === 'km') return 'KM-wise';
  return pricingMode ? pricingMode.replace(/_/g, ' ') : 'Unknown';
}

function StopIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === 'pickup') return <MapPin className="size-5 text-stitch-primary-container" aria-hidden />;
  if (t === 'dropoff') return <Flag className="size-5 text-stitch-primary-container" aria-hidden />;
  return <CircleDot className="size-5 text-stitch-primary-container/90" aria-hidden />;
}

export function BookingDetailFullView({
  booking,
  backHref,
  backLabel,
}: {
  booking: BookingDetailLike;
  backHref?: string;
  backLabel?: string;
}) {
  const stops = sortedStops(booking.stops);
  const trip = booking.trip;
  const snap = booking.pricing_snapshot;
  const coupon = parseMoney(booking.coupon_discount);
  const assignment = getBookingAssignmentDisplay(booking);
  const showAssignmentPending = assignment.missingDriver || assignment.missingHelper;

  return (
    <div className="space-y-8">
      {booking.cancelled_at ? (
        <div className="rounded-xl border border-red-500/35 bg-red-950/25 px-4 py-3 font-body text-sm text-red-100">
          <p className="font-headline font-bold uppercase tracking-wide text-red-200">Cancelled</p>
          {booking.cancellation_reason ? <p className="mt-1 text-red-100/90">{booking.cancellation_reason}</p> : null}
          <p className="mt-1 text-xs text-red-200/80">{formatIsoDateTime(booking.cancelled_at)}</p>
        </div>
      ) : null}
      {showAssignmentPending ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-950/20 px-4 py-3 font-body text-sm text-amber-100">
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">
            Assignment pending
          </p>
          <p className="mt-1 text-xs text-amber-100/90">
            {assignment.missingDriver && assignment.missingHelper
              ? 'Driver and helper are not assigned yet.'
              : assignment.missingDriver
                ? 'Driver is not assigned yet.'
                : 'Helper is not assigned yet.'}
          </p>
        </div>
      ) : null}

      <header className="space-y-4 border-b border-white/10 pb-6">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex font-body text-sm text-stitch-on-surface-variant transition-colors hover:text-stitch-primary-container"
          >
            {backLabel ?? 'Back'}
          </Link>
        ) : null}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-primary-container">Booking</p>
            <div className="flex flex-wrap items-center gap-2 gap-y-2">
              <h1 className="font-headline text-2xl font-black uppercase tracking-tight text-stitch-on-background sm:text-3xl">
                {booking.caravan_name}
              </h1>
              {booking.caravan_class ? (
                <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-wider text-stitch-on-surface-variant">
                  Class {booking.caravan_class}
                </span>
              ) : null}
            </div>
            <p className="font-mono text-[11px] text-stitch-on-surface-variant/80">{booking.id}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 font-body text-xs font-semibold capitalize',
                  statusPillClass(booking.status)
                )}
              >
                {booking.status.replace(/_/g, ' ')}
              </span>
              {trip?.status ? (
                <span className="inline-flex rounded-full bg-white/5 px-2.5 py-0.5 font-body text-xs font-medium capitalize text-stitch-on-surface-variant ring-1 ring-white/10">
                  Trip: {String(trip.status).replace(/_/g, ' ')}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card space-y-4 rounded-xl p-6">
          <h2 className="flex items-center gap-2 font-headline text-lg font-bold text-stitch-on-background">
            <Calendar className="size-5 text-stitch-primary-container" aria-hidden />
            Trip overview
          </h2>
          <p className="font-body text-sm leading-relaxed text-stitch-on-surface-variant">
            {formatIsoDateRange(booking.start_datetime, booking.end_datetime, booking.total_days)}
          </p>
          <dl className="grid gap-3 border-t border-white/10 pt-4">
            <DetailRow label="Total days" value={booking.total_days} />
            <DetailRow label="Guests" value={booking.num_humans} />
            <DetailRow label="Pets" value={booking.num_pets} />
            <DetailRow label="One-way" value={booking.is_one_way ? 'Yes' : 'No'} />
            <DetailRow label="Pricing mode" value={booking.pricing_mode.replace(/_/g, ' ')} />
            <DetailRow label="Booking type" value={booking.booking_type.replace(/_/g, ' ')} />
            <DetailRow label="Source" value={booking.source} />
          </dl>
        </section>

        <section className="glass-card space-y-4 rounded-xl p-6">
          <h2 className="flex items-center gap-2 font-headline text-lg font-bold text-stitch-on-background">
            <Users className="size-5 text-stitch-primary-container" aria-hidden />
            Customer &amp; caravan
          </h2>
          <dl className="grid gap-3">
            <DetailRow label="Name" value={booking.customer_name} />
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-stitch-on-surface-variant">Phone</span>
              <a
                href={`tel:${booking.customer_phone}`}
                className="inline-flex items-center gap-1.5 font-body text-sm text-stitch-primary-container hover:underline"
              >
                <Phone className="size-3.5" aria-hidden />
                {booking.customer_phone}
              </a>
            </div>
            <DetailRow label="Caravan" value={booking.caravan_name} />
            <DetailRow label="Class" value={booking.caravan_class} />
            <DetailRow
              label="Driver"
              value={assignment.driverName || null}
              muted={!assignment.driverName}
            />
            <DetailRow
              label="Helper"
              value={assignment.helperName || null}
              muted={!assignment.helperName}
            />
            {booking.is_b2b ? <DetailRow label="B2B partner" value={booking.b2b_partner ?? '—'} /> : null}
          </dl>
        </section>
      </div>

      <section className="glass-card rounded-xl p-6">
        <h2 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold text-stitch-on-background">
          <Route className="size-5 text-stitch-primary-container" aria-hidden />
          Route &amp; stops
        </h2>
        <ol className="relative space-y-0">
          {stops.map((stop, index) => (
            <li key={stop.id} className="relative flex gap-4 pb-8 last:pb-0">
              {index < stops.length - 1 ? (
                <div className="absolute left-[9px] top-8 h-[calc(100%-0.5rem)] w-px bg-white/15" aria-hidden />
              ) : null}
              <div className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-stitch-surface/40">
                <StopIcon type={stop.stop_type} />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="font-headline text-xs font-bold uppercase tracking-widest text-stitch-primary-container">
                  {stop.stop_type.replace(/_/g, ' ')}
                </p>
                <p className="mt-1 font-body text-sm leading-relaxed text-stitch-on-background">{stop.location_name}</p>
                {stop.notes?.trim() ? <p className="mt-2 font-body text-xs text-stitch-on-surface-variant">{stop.notes}</p> : null}
                {stop.estimated_arrival ? (
                  <p className="mt-1 font-body text-xs text-stitch-on-surface-variant/80">Est. {formatIsoDateTime(stop.estimated_arrival)}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card space-y-4 rounded-xl p-6">
          <h2 className="font-headline text-lg font-bold text-stitch-on-background">Rate snapshot</h2>
          <p className="font-body text-xs text-stitch-on-surface-variant">Rates at time of booking</p>
          <dl className="grid gap-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-emerald-200/90">
                Applied pricing model
              </span>
              <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 font-body text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/35">
                {pricingModeLabel(booking.pricing_mode)}
              </span>
            </div>
            <DetailRow label="Day rate" value={`₹${formatInr(snap.day_rate)}`} />
            <DetailRow label="KM rate" value={`₹${formatInr(snap.km_rate)}`} />
            <DetailRow label="Deposit" value={`₹${formatInr(snap.deposit_amount)}`} />
            <DetailRow label="Days (snapshot)" value={snap.total_days} />
          </dl>
        </section>

        <section className="glass-card space-y-4 rounded-xl p-6">
          <h2 className="font-headline text-lg font-bold text-stitch-on-background">Payment summary</h2>
          <div className="space-y-2 border-t border-white/10 pt-4">
            <MoneyLine label="Base price" amount={booking.base_price} />
            <MoneyLine label="Add-ons" amount={booking.addons_price} />
            <MoneyLine label="Pet cleaning" amount={booking.pet_cleaning_charge} />
            <MoneyLine label="Coupon discount" amount={booking.coupon_discount} negative={coupon > 0} />
            <MoneyLine label="Subtotal" amount={booking.subtotal} />
            <MoneyLine label="Razorpay charges" amount={booking.razorpay_charges} />
            <MoneyLine label="Grand total" amount={booking.grand_total} emphasize />
          </div>
        </section>
      </div>

      {trip ? (
        <section className="glass-card space-y-6 rounded-xl p-6">
          <h2 className="flex items-center gap-2 font-headline text-lg font-bold text-stitch-on-background">
            <Car className="size-5 text-stitch-primary-container" aria-hidden />
            Trip execution &amp; extras
          </h2>
          <div className="grid gap-4 border-b border-white/10 pb-6 md:grid-cols-2">
            <DetailRow label="Trip ID" value={trip.id} />
            <DetailRow label="Odometer start" value={trip.odometer_start ?? '—'} muted={trip.odometer_start == null} />
            <DetailRow label="Odometer end" value={trip.odometer_end ?? '—'} muted={trip.odometer_end == null} />
            <DetailRow label="Actual KM" value={trip.actual_km ?? '—'} muted={trip.actual_km == null} />
            <DetailRow label="Actual start" value={formatIsoDateTime(trip.actual_start)} />
            <DetailRow label="Actual end" value={formatIsoDateTime(trip.actual_end)} />
            <DetailRow label="Extra KM" value={trip.extra_km} />
            <DetailRow label="EOT submitted" value={formatIsoDateTime(trip.eot_submitted_at)} />
            <DetailRow label="Trip updated" value={formatIsoDateTime(trip.updated_at)} />
          </div>
          <div>
            <h3 className="mb-3 font-headline text-xs font-bold uppercase tracking-[0.2em] text-stitch-on-surface-variant">Charges</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <MoneyLine label="Extra KM charge" amount={trip.extra_km_charge} />
              <MoneyLine label="AC charge" amount={trip.ac_charge} />
              <MoneyLine label="Generator charge" amount={trip.gen_charge} />
              <MoneyLine label="Late charge" amount={trip.late_charge} />
              <MoneyLine label="Parking" amount={trip.parking_charge} />
              <MoneyLine label="Toll" amount={trip.toll_charge} />
              <MoneyLine label="Damage" amount={trip.damage_charge} />
              <MoneyLine label="Other" amount={trip.other_charge} />
              <MoneyLine label="Total extra" amount={trip.total_extra_charge} emphasize />
            </div>
          </div>
          <div className="grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
            <DetailRow label="AC hours" value={trip.ac_hours} muted={parseMoney(trip.ac_hours) === 0} />
            <DetailRow label="Generator hours" value={trip.gen_hours} muted={parseMoney(trip.gen_hours) === 0} />
            <DetailRow label="Late hours" value={trip.late_hours} muted={parseMoney(trip.late_hours) === 0} />
            <DetailRow
              label="Other charge note"
              value={trip.other_charge_note?.trim() || null}
              muted={!trip.other_charge_note?.trim()}
            />
            <div className="md:col-span-2">
              <DetailRow label="Driver notes" value={trip.driver_notes?.trim() || null} muted={!trip.driver_notes?.trim()} />
            </div>
            <div className="md:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-stitch-on-surface-variant">Events</span>
              <p className="mt-1 font-body text-sm text-stitch-on-background">
                {Array.isArray(trip.events) && trip.events.length > 0 ? `${trip.events.length} recorded` : 'None yet'}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <footer className="glass-card space-y-4 rounded-xl p-6">
        <h2 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-stitch-on-surface-variant">Record</h2>
        <dl className="grid gap-2 font-body text-sm text-stitch-on-surface-variant">
          <div className="flex flex-wrap justify-between gap-2">
            <span>Created</span>
            <span className="text-stitch-on-background">{formatDate(booking.created_at)}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span>Updated</span>
            <span className="text-stitch-on-background">{formatDate(booking.updated_at)}</span>
          </div>
        </dl>
        {booking.notes?.trim() ? (
          <div className="border-t border-white/10 pt-4">
            <p className="font-headline text-xs font-bold uppercase tracking-wide text-stitch-on-surface-variant">Internal notes</p>
            <p className="mt-2 whitespace-pre-wrap font-body text-sm leading-relaxed text-stitch-on-surface-variant">{booking.notes}</p>
          </div>
        ) : null}
      </footer>
    </div>
  );
}
