'use client';

import Link from 'next/link';
import { Calendar, Car, CircleDot, ExternalLink, Flag, MapPin, Phone, Route, Users } from 'lucide-react';
import { getBookingAssignmentDisplay } from '@/lib/bookingAssignment';
import { sortedStops, statusPillClass } from '@/lib/customerBookingUi';
import { cn } from '@/lib/utils';
import { DetailRow, formatIsoDateTime, MoneyLine } from '@/components/booking/BookingDetailAtoms';
import type { BookingPricingBreakdown, BookingTripEvent } from '@/types/bookingDetail';
import type { AdminBookingDetail } from '@/types/admin';
import type { CustomerBookingDetail } from '@/types/customerBooking';
import { formatDate, formatInr, formatIsoDateRange } from '@/utils/format';

type BookingDetailLike = CustomerBookingDetail | AdminBookingDetail;

function parseMoney(s: string | number): number {
  const n = typeof s === 'number' ? s : Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function pricingModeLabel(pricingMode: string): string {
  if (pricingMode === 'day') return 'Day-wise';
  if (pricingMode === 'km') return 'KM-wise';
  if (pricingMode === 'package') return 'Package';
  return pricingMode ? pricingMode.replace(/_/g, ' ') : 'Unknown';
}

function truncateId(id: string, len = 8): string {
  if (id.length <= len * 2 + 1) return id;
  return `${id.slice(0, len)}…${id.slice(-len)}`;
}

function StopIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === 'pickup') return <MapPin className="size-5 text-stitch-primary-container" aria-hidden />;
  if (t === 'dropoff') return <Flag className="size-5 text-stitch-primary-container" aria-hidden />;
  return <CircleDot className="size-5 text-stitch-primary-container/90" aria-hidden />;
}

function PhoneLink({ phone }: { phone: string }) {
  return (
    <a
      href={`tel:${phone}`}
      className="inline-flex items-center gap-1.5 font-body text-sm text-stitch-primary-container hover:underline"
    >
      <Phone className="size-3.5" aria-hidden />
      {phone}
    </a>
  );
}

function PricingWhyBlock({ breakdown }: { breakdown: BookingPricingBreakdown }) {
  const alt =
    breakdown.chosen === 'day_wise' || breakdown.chosen === 'day'
      ? breakdown.km_wise
      : breakdown.chosen === 'km_wise' || breakdown.chosen === 'km'
        ? breakdown.day_wise
        : null;
  const altLabel =
    breakdown.chosen === 'day_wise' || breakdown.chosen === 'day' ? 'KM-wise (not applied)' : 'Day-wise (not applied)';

  return (
    <div className="space-y-3 rounded-md border border-emerald-500/25 bg-emerald-500/5 p-3">
      <div>
        <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">Why this price</p>
        <p className="mt-1 font-body text-sm font-medium text-stitch-on-background">{breakdown.pricing_mode_label}</p>
        {breakdown.reason ? (
          <p className="mt-1 font-body text-xs leading-relaxed text-stitch-on-surface-variant">{breakdown.reason}</p>
        ) : null}
      </div>
      {alt && (alt.total != null || alt.rate != null) ? (
        <dl className="grid gap-1 border-t border-white/10 pt-2 font-body text-xs text-stitch-on-surface-variant">
          <dt className="font-semibold uppercase tracking-wide text-stitch-on-surface-variant/80">{altLabel}</dt>
          {alt.total != null ? <dd>Total: ₹{formatInr(alt.total)}</dd> : null}
          {alt.rate != null ? <dd>Rate: ₹{formatInr(alt.rate)}</dd> : null}
          {alt.days != null ? <dd>Days: {alt.days}</dd> : null}
          {alt.estimated_km != null ? <dd>Est. km: {alt.estimated_km}</dd> : null}
          {alt.included_km != null ? <dd>Included km: {alt.included_km}</dd> : null}
        </dl>
      ) : null}
    </div>
  );
}

function sortedTripEvents(events: BookingTripEvent[]): BookingTripEvent[] {
  return [...events].sort((a, b) => {
    const ta = a.occurred_at ? Date.parse(a.occurred_at) : 0;
    const tb = b.occurred_at ? Date.parse(b.occurred_at) : 0;
    return tb - ta;
  });
}

export function BookingDetailFullView({
  booking,
  backHref,
  backLabel,
  variant = 'customer',
  showPricing = true,
  showAddonItems,
  showTripCharges,
  hideTripSection = false,
}: {
  booking: BookingDetailLike;
  backHref?: string;
  backLabel?: string;
  variant?: 'admin' | 'customer';
  /** When false, hides rate snapshot, payment summary, and trip charge lines (crew portal). */
  showPricing?: boolean;
  /** When true, shows add-on line items (operational columns only if showPricing is false). Defaults to showPricing. */
  showAddonItems?: boolean;
  /** When false, hides trip charge money lines. Defaults to showPricing. */
  showTripCharges?: boolean;
  /** When true, hides the entire trip execution section (crew uses CrewTripSummary). */
  hideTripSection?: boolean;
}) {
  const displayAddonItems = showAddonItems ?? showPricing;
  const displayTripCharges = showTripCharges ?? showPricing;
  const stops = sortedStops(booking.stops);
  const trip = booking.trip;
  const snap = booking.pricing_snapshot;
  const pb = booking.pricing_breakdown;
  const coupon = parseMoney(pb?.coupon_discount ?? booking.coupon_discount);
  const oneWay = parseMoney(pb?.one_way_surcharge ?? booking.one_way_surcharge);
  const gst = parseMoney(pb?.gst ?? booking.gst);
  const assignment = getBookingAssignmentDisplay(booking);
  const showAssignmentPending = assignment.missingDriver || assignment.missingHelper;
  const showBufferedKm =
    booking.buffered_km > 0 &&
    (showPricing
      ? booking.pricing_mode === 'km' || booking.estimated_km > 0
      : booking.estimated_km > 0);
  const packageHref = booking.package
    ? `/packages/${encodeURIComponent(booking.package)}`
    : null;

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
                  {booking.caravan_class_name
                    ? `${booking.caravan_class_name} (${booking.caravan_class})`
                    : `Class ${booking.caravan_class}`}
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
            {showPricing && booking.pricing_mode ? (
              <DetailRow label="Pricing mode" value={booking.pricing_mode.replace(/_/g, ' ')} />
            ) : null}
            <DetailRow label="Booking type" value={booking.booking_type.replace(/_/g, ' ')} />
            <DetailRow label="Source" value={booking.source} />
            {booking.estimated_km > 0 ? <DetailRow label="Estimated km" value={`${booking.estimated_km} km`} /> : null}
            {showBufferedKm ? <DetailRow label="Buffered km" value={`${booking.buffered_km} km`} /> : null}
            {booking.avg_km_per_day > 0 ? (
              <DetailRow label="Avg km / day" value={booking.avg_km_per_day.toFixed(1)} />
            ) : null}
            {booking.package ? (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-stitch-on-surface-variant">
                  Package
                </span>
                {packageHref ? (
                  <div className="text-right">
                    <Link
                      href={packageHref}
                      className="inline-flex items-center gap-1 font-mono text-xs text-stitch-primary-container hover:underline"
                    >
                      {truncateId(booking.package!, 10)}
                      <ExternalLink className="size-3" aria-hidden />
                    </Link>
                    {variant === 'admin' ? (
                      <p className="mt-0.5 font-body text-[10px] text-stitch-on-surface-variant/70">Public package page</p>
                    ) : null}
                  </div>
                ) : (
                  <span className="font-mono text-xs text-stitch-on-background">{booking.package}</span>
                )}
              </div>
            ) : null}
            {booking.coupon ? (
              <DetailRow label="Coupon" value={truncateId(booking.coupon)} />
            ) : null}
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
              <PhoneLink phone={booking.customer_phone} />
            </div>
            <DetailRow label="Caravan" value={booking.caravan_name} />
            <DetailRow
              label="Class"
              value={
                booking.caravan_class_name
                  ? `${booking.caravan_class_name} (${booking.caravan_class})`
                  : booking.caravan_class
              }
            />
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-stitch-on-surface-variant">Driver</span>
              {assignment.driverName ? (
                <div className="text-right">
                  <p className="font-body text-sm text-stitch-on-background">{assignment.driverName}</p>
                  {assignment.driverPhone ? <PhoneLink phone={assignment.driverPhone} /> : null}
                </div>
              ) : (
                <span className="font-body text-sm text-stitch-on-surface-variant/60">Not assigned</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-stitch-on-surface-variant">Helper</span>
              {assignment.helperName ? (
                <div className="text-right">
                  <p className="font-body text-sm text-stitch-on-background">{assignment.helperName}</p>
                  {assignment.helperPhone ? <PhoneLink phone={assignment.helperPhone} /> : null}
                </div>
              ) : (
                <span className="font-body text-sm text-stitch-on-surface-variant/60">Not assigned</span>
              )}
            </div>
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

      {displayAddonItems && booking.items.length > 0 ? (
        <section className="glass-card space-y-4 rounded-xl p-6">
          <h2 className="font-headline text-lg font-bold text-stitch-on-background">
            {showPricing ? 'Add-on line items' : 'Add-ons'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse font-body text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wide text-stitch-on-surface-variant">
                  <th className="pb-3 pr-4">Add-on</th>
                  <th className="pb-3 pr-4">Category</th>
                  {showPricing ? null : (
                    <th className="pb-3 pr-4">Pricing type</th>
                  )}
                  <th className="pb-3 pr-4 text-right">Qty</th>
                  {showPricing ? (
                    <>
                      <th className="pb-3 pr-4 text-right">Unit</th>
                      <th className="pb-3 text-right">Total</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {booking.items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4 text-stitch-on-background">{item.addon_name}</td>
                    <td className="py-3 pr-4 capitalize text-stitch-on-surface-variant">
                      {item.addon_category.replace(/_/g, ' ')}
                    </td>
                    {showPricing ? null : (
                      <td className="py-3 pr-4 capitalize text-stitch-on-surface-variant">
                        {item.addon_pricing_type.replace(/_/g, ' ') || '—'}
                      </td>
                    )}
                    <td className="py-3 pr-4 text-right tabular-nums">{item.quantity}</td>
                    {showPricing ? (
                      <>
                        <td className="py-3 pr-4 text-right tabular-nums">₹{formatInr(parseMoney(item.unit_price))}</td>
                        <td className="py-3 text-right tabular-nums font-medium">
                          ₹{formatInr(parseMoney(item.total_price))}
                        </td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {showPricing ? (
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
                {pb?.pricing_mode_label || pricingModeLabel(booking.pricing_mode)}
              </span>
            </div>
            {pb ? <PricingWhyBlock breakdown={pb} /> : null}
            {snap.day_rate > 0 ? <DetailRow label="Day rate" value={`₹${formatInr(snap.day_rate)}`} /> : null}
            {snap.km_rate > 0 ? <DetailRow label="KM rate" value={`₹${formatInr(snap.km_rate)}`} /> : null}
            <DetailRow label="Deposit" value={`₹${formatInr(pb?.deposit_amount ?? snap.deposit_amount)}`} />
            <DetailRow label="Days (snapshot)" value={snap.total_days} />
            {snap.included_km != null && snap.included_km > 0 ? (
              <DetailRow label="Included km" value={snap.included_km} />
            ) : null}
            {snap.estimated_km != null && snap.estimated_km > 0 ? (
              <DetailRow label="Est. km (snapshot)" value={snap.estimated_km} />
            ) : null}
            {snap.buffered_km != null && snap.buffered_km > 0 ? (
              <DetailRow label="Buffered km (snapshot)" value={snap.buffered_km} />
            ) : null}
            {snap.hub_id ? <DetailRow label="Hub ID" value={truncateId(snap.hub_id, 12)} /> : null}
          </dl>
        </section>

        <section className="glass-card space-y-4 rounded-xl p-6">
          <h2 className="font-headline text-lg font-bold text-stitch-on-background">Payment summary</h2>
          <div className="space-y-2 border-t border-white/10 pt-4">
            <MoneyLine
              label="Base rental"
              amount={String(pb?.base_price ?? booking.base_price)}
            />
            {parseMoney(booking.pet_cleaning_charge) > 0 || (pb?.pet_cleaning_charge ?? 0) > 0 ? (
              <MoneyLine
                label="Pet cleaning"
                amount={String(pb?.pet_cleaning_charge ?? booking.pet_cleaning_charge)}
              />
            ) : null}
            {oneWay > 0 ? (
              <MoneyLine label="One-way surcharge" amount={String(pb?.one_way_surcharge ?? booking.one_way_surcharge)} />
            ) : null}
            <MoneyLine
              label="Add-ons"
              amount={String(pb?.addons_price ?? booking.addons_price)}
            />
            {coupon > 0 ? (
              <MoneyLine
                label="Coupon discount"
                amount={String(pb?.coupon_discount ?? booking.coupon_discount)}
                negative
              />
            ) : null}
            <MoneyLine label="Subtotal" amount={String(pb?.subtotal ?? booking.subtotal)} />
            {gst > 0 ? (
              <MoneyLine
                label={pb?.gst_rate ? `GST (${pb.gst_rate})` : 'GST'}
                amount={String(pb?.gst ?? booking.gst)}
              />
            ) : null}
            {parseMoney(booking.razorpay_charges) > 0 || (pb?.razorpay_charges ?? 0) > 0 ? (
              <MoneyLine
                label="Payment processing fee"
                amount={String(pb?.razorpay_charges ?? booking.razorpay_charges)}
              />
            ) : null}
            <MoneyLine
              label="Grand total"
              amount={String(pb?.grand_total ?? booking.grand_total)}
              emphasize
            />
          </div>
        </section>
      </div>
      ) : null}

      {trip && !hideTripSection ? (
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
            {trip.hub_return_km != null ? <DetailRow label="Hub return km" value={trip.hub_return_km} /> : null}
          </div>
          {displayTripCharges ? (
            <div>
              <h3 className="mb-3 font-headline text-xs font-bold uppercase tracking-[0.2em] text-stitch-on-surface-variant">Charges</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <MoneyLine label="Extra KM charge" amount={trip.extra_km_charge} />
                <MoneyLine label="AC charge" amount={trip.ac_charge} />
                <MoneyLine label="Generator charge" amount={trip.gen_charge} />
                <MoneyLine label="Late charge" amount={trip.late_charge} />
                <MoneyLine label="Parking" amount={trip.parking_charge} />
                <MoneyLine label="Estimated toll" amount={trip.estimated_toll_charge} />
                <MoneyLine label="Actual toll (EOT)" amount={trip.toll_charge} />
                <MoneyLine label="Fuel (hub return)" amount={trip.fuel_charge} />
                <MoneyLine label="Damage" amount={trip.damage_charge} />
                <MoneyLine label="Other" amount={trip.other_charge} />
                <MoneyLine label="Total extra" amount={trip.total_extra_charge} emphasize />
              </div>
            </div>
          ) : null}
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
          </div>
          {trip.events.length > 0 ? (
            <div className="border-t border-white/10 pt-4">
              <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-[0.2em] text-stitch-on-surface-variant">
                Trip events
              </h3>
              <ul className="space-y-3">
                {sortedTripEvents(trip.events).map((ev) => (
                  <li
                    key={ev.id}
                    className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-headline text-xs font-bold uppercase tracking-wide text-stitch-primary-container">
                        {ev.event_type.replace(/_/g, ' ')}
                      </p>
                      <span className="font-body text-xs text-stitch-on-surface-variant">
                        {formatIsoDateTime(ev.occurred_at)}
                      </span>
                    </div>
                    <p className="mt-1 font-body text-xs text-stitch-on-surface-variant">
                      {ev.source}
                      {ev.recorded_by_name ? ` · ${ev.recorded_by_name}` : ''}
                    </p>
                    {ev.notes?.trim() ? (
                      <p className="mt-2 font-body text-sm text-stitch-on-background">{ev.notes}</p>
                    ) : null}
                    {ev.bill_url ? (
                      <a
                        href={ev.bill_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 font-body text-xs text-stitch-primary-container hover:underline"
                      >
                        View bill
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="border-t border-white/10 pt-4 font-body text-sm text-stitch-on-surface-variant">No trip events yet.</p>
          )}
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
