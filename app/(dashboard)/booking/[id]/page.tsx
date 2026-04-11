'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  Car,
  CircleDot,
  Flag,
  Loader2,
  Map,
  MapPin,
  Phone,
  Route,
  Users,
} from 'lucide-react';
import { requestAuthThenNavigate } from '@/lib/authNavigation';
import { sortedStops, statusPillClass } from '@/lib/customerBookingUi';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { bookingService } from '@/services/booking.service';
import type { CustomerBookingDetail } from '@/types/customerBooking';
import { formatDate, formatInr, formatIsoDateRange } from '@/utils/format';

function formatIsoDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'd MMM yyyy, p');
  } catch {
    return iso;
  }
}

function parseMoney(s: string): number {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function MoneyLine({
  label,
  amount,
  emphasize,
  negative,
}: {
  label: string;
  amount: string;
  emphasize?: boolean;
  negative?: boolean;
}) {
  const n = parseMoney(amount);
  const muted = !emphasize && n === 0;
  return (
    <p
      className={cn(
        'flex justify-between gap-4 font-body text-sm',
        muted ? 'text-stitch-on-surface-variant/50' : 'text-stitch-on-surface-variant',
        emphasize && 'border-t border-white/10 pt-2 font-headline font-bold text-stitch-on-background'
      )}
    >
      <span>{label}</span>
      <span className="shrink-0 tabular-nums text-stitch-on-background">
        {negative && n > 0 ? '−₹' : '₹'}
        {formatInr(amount)}
      </span>
    </p>
  );
}

function DetailRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string | number | null | undefined;
  muted?: boolean;
}) {
  const str =
    value === null || value === undefined || value === ''
      ? '—'
      : String(value);
  const isEmpty = str === '—';
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4',
        muted || isEmpty ? 'text-stitch-on-surface-variant/55' : 'text-stitch-on-surface-variant'
      )}
    >
      <span className="font-body text-xs font-semibold uppercase tracking-wide text-stitch-on-surface-variant">
        {label}
      </span>
      <span className="font-body text-sm text-stitch-on-background sm:text-right">{str}</span>
    </div>
  );
}

function StopIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === 'pickup') return <MapPin className="size-5 text-stitch-primary-container" aria-hidden />;
  if (t === 'dropoff') return <Flag className="size-5 text-stitch-primary-container" aria-hidden />;
  return <CircleDot className="size-5 text-stitch-primary-container/90" aria-hidden />;
}

function BookingDetailContent({ b }: { b: CustomerBookingDetail }) {
  const stops = sortedStops(b.stops);
  const trip = b.trip;
  const snap = b.pricing_snapshot;
  const coupon = parseMoney(b.coupon_discount);

  return (
    <div className="space-y-8">
      {b.cancelled_at ? (
        <div className="rounded-xl border border-red-500/35 bg-red-950/25 px-4 py-3 font-body text-sm text-red-100">
          <p className="font-headline font-bold uppercase tracking-wide text-red-200">Cancelled</p>
          {b.cancellation_reason ? (
            <p className="mt-1 text-red-100/90">{b.cancellation_reason}</p>
          ) : null}
          <p className="mt-1 text-xs text-red-200/80">{formatIsoDateTime(b.cancelled_at)}</p>
        </div>
      ) : null}

      <header className="space-y-4 border-b border-white/10 pb-6">
        <Link
          href="/journeys"
          className="inline-flex font-body text-sm text-stitch-on-surface-variant transition-colors hover:text-stitch-primary-container"
        >
          ← Back to journeys
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-primary-container">
              Booking
            </p>
            <div className="flex flex-wrap items-center gap-2 gap-y-2">
              <h1 className="font-headline text-2xl font-black uppercase tracking-tight text-stitch-on-background sm:text-3xl">
                {b.caravan_name}
              </h1>
              {b.caravan_class ? (
                <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-wider text-stitch-on-surface-variant">
                  Class {b.caravan_class}
                </span>
              ) : null}
            </div>
            <p className="font-mono text-[11px] text-stitch-on-surface-variant/80">{b.id}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 font-body text-xs font-semibold capitalize',
                  statusPillClass(b.status)
                )}
              >
                {b.status.replace(/_/g, ' ')}
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
            {formatIsoDateRange(b.start_datetime, b.end_datetime, b.total_days)}
          </p>
          <dl className="grid gap-3 border-t border-white/10 pt-4">
            <DetailRow label="Total days" value={b.total_days} />
            <DetailRow label="Guests" value={b.num_humans} />
            <DetailRow label="Pets" value={b.num_pets} />
            <DetailRow
              label="One-way"
              value={b.is_one_way ? 'Yes' : 'No'}
            />
            <DetailRow label="Pricing mode" value={b.pricing_mode.replace(/_/g, ' ')} />
            <DetailRow label="Booking type" value={b.booking_type.replace(/_/g, ' ')} />
            <DetailRow label="Source" value={b.source} />
          </dl>
        </section>

        <section className="glass-card space-y-4 rounded-xl p-6">
          <h2 className="flex items-center gap-2 font-headline text-lg font-bold text-stitch-on-background">
            <Users className="size-5 text-stitch-primary-container" aria-hidden />
            Customer &amp; caravan
          </h2>
          <dl className="grid gap-3">
            <DetailRow label="Name" value={b.customer_name} />
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-stitch-on-surface-variant">
                Phone
              </span>
              <a
                href={`tel:${b.customer_phone}`}
                className="inline-flex items-center gap-1.5 font-body text-sm text-stitch-primary-container hover:underline"
              >
                <Phone className="size-3.5" aria-hidden />
                {b.customer_phone}
              </a>
            </div>
            <DetailRow label="Caravan" value={b.caravan_name} />
            <DetailRow label="Class" value={b.caravan_class} />
            <DetailRow
              label="Driver"
              value={b.driver_name?.trim() || null}
              muted={!b.driver_name?.trim()}
            />
            {b.is_b2b ? (
              <DetailRow label="B2B partner" value={b.b2b_partner ?? '—'} />
            ) : null}
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
                <div
                  className="absolute left-[9px] top-8 h-[calc(100%-0.5rem)] w-px bg-white/15"
                  aria-hidden
                />
              ) : null}
              <div className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-stitch-surface/40">
                <StopIcon type={stop.stop_type} />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="font-headline text-xs font-bold uppercase tracking-widest text-stitch-primary-container">
                  {stop.stop_type.replace(/_/g, ' ')}
                </p>
                <p className="mt-1 font-body text-sm leading-relaxed text-stitch-on-background">
                  {stop.location_name}
                </p>
                {stop.notes?.trim() ? (
                  <p className="mt-2 font-body text-xs text-stitch-on-surface-variant">{stop.notes}</p>
                ) : null}
                {stop.estimated_arrival ? (
                  <p className="mt-1 font-body text-xs text-stitch-on-surface-variant/80">
                    Est. {formatIsoDateTime(stop.estimated_arrival)}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card space-y-4 rounded-xl p-6">
          <h2 className="font-headline text-lg font-bold text-stitch-on-background">Rate snapshot</h2>
          <p className="font-body text-xs text-stitch-on-surface-variant">
            Rates at time of booking
          </p>
          <dl className="grid gap-3 border-t border-white/10 pt-4">
            <DetailRow label="Day rate" value={`₹${formatInr(snap.day_rate)}`} />
            <DetailRow label="KM rate" value={`₹${formatInr(snap.km_rate)}`} />
            <DetailRow label="Deposit" value={`₹${formatInr(snap.deposit_amount)}`} />
            <DetailRow label="Days (snapshot)" value={snap.total_days} />
          </dl>
        </section>

        <section className="glass-card space-y-4 rounded-xl p-6">
          <h2 className="font-headline text-lg font-bold text-stitch-on-background">Payment summary</h2>
          <div className="space-y-2 border-t border-white/10 pt-4">
            <MoneyLine label="Base price" amount={b.base_price} />
            <MoneyLine label="Add-ons" amount={b.addons_price} />
            <MoneyLine label="Pet cleaning" amount={b.pet_cleaning_charge} />
            <MoneyLine label="Coupon discount" amount={b.coupon_discount} negative={coupon > 0} />
            <MoneyLine label="Subtotal" amount={b.subtotal} />
            <MoneyLine label="Razorpay charges" amount={b.razorpay_charges} />
            <MoneyLine label="Grand total" amount={b.grand_total} emphasize />
          </div>
        </section>
      </div>

      <section className="glass-card space-y-6 rounded-xl p-6">
        <h2 className="flex items-center gap-2 font-headline text-lg font-bold text-stitch-on-background">
          <Car className="size-5 text-stitch-primary-container" aria-hidden />
          Trip execution &amp; extras
        </h2>
        <div className="grid gap-4 border-b border-white/10 pb-6 md:grid-cols-2">
          <DetailRow label="Trip ID" value={trip.id} />
          <DetailRow
            label="Odometer start"
            value={trip.odometer_start ?? '—'}
            muted={trip.odometer_start == null}
          />
          <DetailRow
            label="Odometer end"
            value={trip.odometer_end ?? '—'}
            muted={trip.odometer_end == null}
          />
          <DetailRow
            label="Actual KM"
            value={trip.actual_km ?? '—'}
            muted={trip.actual_km == null}
          />
          <DetailRow label="Actual start" value={formatIsoDateTime(trip.actual_start)} />
          <DetailRow label="Actual end" value={formatIsoDateTime(trip.actual_end)} />
          <DetailRow label="Extra KM" value={trip.extra_km} />
          <DetailRow
            label="EOT submitted"
            value={formatIsoDateTime(trip.eot_submitted_at)}
          />
          <DetailRow label="Trip updated" value={formatIsoDateTime(trip.updated_at)} />
        </div>
        <div>
          <h3 className="mb-3 font-headline text-xs font-bold uppercase tracking-[0.2em] text-stitch-on-surface-variant">
            Charges
          </h3>
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
          <DetailRow
            label="AC hours"
            value={trip.ac_hours}
            muted={parseMoney(trip.ac_hours) === 0}
          />
          <DetailRow
            label="Generator hours"
            value={trip.gen_hours}
            muted={parseMoney(trip.gen_hours) === 0}
          />
          <DetailRow
            label="Late hours"
            value={trip.late_hours}
            muted={parseMoney(trip.late_hours) === 0}
          />
          <DetailRow
            label="Other charge note"
            value={trip.other_charge_note?.trim() || null}
            muted={!trip.other_charge_note?.trim()}
          />
          <div className="md:col-span-2">
            <DetailRow
              label="Driver notes"
              value={trip.driver_notes?.trim() || null}
              muted={!trip.driver_notes?.trim()}
            />
          </div>
          <div className="md:col-span-2">
            <span className="font-body text-xs font-semibold uppercase tracking-wide text-stitch-on-surface-variant">
              Events
            </span>
            <p className="mt-1 font-body text-sm text-stitch-on-background">
              {Array.isArray(trip.events) && trip.events.length > 0
                ? `${trip.events.length} recorded`
                : 'None yet'}
            </p>
          </div>
        </div>
      </section>

      <footer className="glass-card space-y-4 rounded-xl p-6">
        <h2 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-stitch-on-surface-variant">
          Record
        </h2>
        <dl className="grid gap-2 font-body text-sm text-stitch-on-surface-variant">
          <div className="flex flex-wrap justify-between gap-2">
            <span>Created</span>
            <span className="text-stitch-on-background">{formatDate(b.created_at)}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span>Updated</span>
            <span className="text-stitch-on-background">{formatDate(b.updated_at)}</span>
          </div>
        </dl>
        {b.notes?.trim() ? (
          <div className="border-t border-white/10 pt-4">
            <p className="font-headline text-xs font-bold uppercase tracking-wide text-stitch-on-surface-variant">
              Internal notes
            </p>
            <p className="mt-2 whitespace-pre-wrap font-body text-sm leading-relaxed text-stitch-on-surface-variant">
              {b.notes}
            </p>
          </div>
        ) : null}
      </footer>
    </div>
  );
}

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';
  const { isAuthenticated } = useAuth();
  const authPrompted = useRef(false);

  useEffect(() => {
    authPrompted.current = false;
  }, [id]);

  useEffect(() => {
    if (!id || isAuthenticated || authPrompted.current) return;
    authPrompted.current = true;
    requestAuthThenNavigate(`/booking/${id}`);
  }, [id, isAuthenticated]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['bookings', 'detail', id],
    queryFn: () => bookingService.getBooking(id),
    enabled: isAuthenticated && Boolean(id),
  });

  if (!id) {
    return (
      <div className="glass-card rounded-xl p-10 text-center">
        <p className="font-body text-sm text-stitch-on-surface-variant">Invalid booking link.</p>
        <Link
          href="/journeys"
          className="mt-4 inline-block font-body text-sm font-semibold text-stitch-primary-container hover:underline"
        >
          Back to journeys
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <div className="glass-panel-login rounded-xl p-10 text-center shadow-2xl">
          <Map className="mx-auto size-12 text-stitch-primary-container" aria-hidden />
          <h1 className="mt-6 font-headline text-xl font-bold text-stitch-on-background">Sign in to continue</h1>
          <p className="mt-3 font-body text-sm text-stitch-on-surface-variant">
            Sign in to view this booking.
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="glass-card flex items-center justify-center gap-3 rounded-xl py-24 text-stitch-on-surface-variant">
        <Loader2 className="size-6 animate-spin text-stitch-primary-container" aria-hidden />
        <span className="font-body text-sm font-semibold">Loading booking…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-8 text-center">
        <p className="font-body text-sm text-red-200">
          {error instanceof Error ? error.message : 'Something went wrong.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-white/20 px-4 font-body text-sm font-semibold text-stitch-on-background transition-colors hover:bg-white/10"
        >
          Try again
        </button>
        <Link
          href="/journeys"
          className="mt-4 block font-body text-sm text-stitch-primary-container hover:underline"
        >
          Back to journeys
        </Link>
      </div>
    );
  }

  if (!data?.success || !data.data) {
    return (
      <div className="glass-card space-y-4 rounded-xl p-10 text-center">
        <p className="font-body text-sm text-stitch-on-surface-variant">
          This booking could not be loaded.
        </p>
        <Link
          href="/journeys"
          className="inline-block font-body text-sm font-semibold text-stitch-primary-container hover:underline"
        >
          Back to journeys
        </Link>
      </div>
    );
  }

  return <BookingDetailContent b={data.data} />;
}
