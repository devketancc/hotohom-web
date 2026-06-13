'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Minus, Plus, Users } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { useCartStore } from '@/store/cartStore';
import { isAuthed, requestAuthThenNavigate } from '@/lib/authNavigation';
import { buildCartPayload } from '@/utils/buildCartPayload';
import { cartService } from '@/services/cart.service';
import { BookingSummary } from '@/components/booking/BookingSummary';

const PASSENGER_STORAGE_KEY = 'motohom-passenger-details';
const ID_TYPES = ['Aadhaar', 'Passport', 'Driving License'] as const;

const travelerSchema = z.object({
  fullName: z.string().min(2, 'Enter the full name'),
  dob: z.string().min(1, 'Select a date of birth'),
  idType: z.enum(ID_TYPES),
  idNumber: z.string().min(4, 'Enter a valid ID number'),
});

const formSchema = z.object({
  travelers: z.array(travelerSchema).min(1),
  pet: z
    .object({
      name: z.string().optional(),
      breed: z.string().optional(),
      vaccinated: z.boolean().optional(),
    })
    .optional(),
  emergencyName: z.string().min(2, 'Enter a contact name'),
  emergencyPhone: z.string().min(7, 'Enter a valid phone number'),
  emergencyRelationship: z.string().min(2, 'Enter a relationship'),
  specialRequests: z.string().optional(),
});

type PassengerFormValues = z.infer<typeof formSchema>;

const FIELD_CLASS =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 font-body text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-gold/40 focus:bg-white/[0.05]';
const LABEL_CLASS =
  'mb-2 block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted';
const ERROR_CLASS = 'mt-1.5 font-body text-xs text-red-400';

function makeTraveler() {
  return { fullName: '', dob: '', idType: 'Aadhaar' as const, idNumber: '' };
}

function readStoredDetails(): PassengerFormValues | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PASSENGER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PassengerFormValues) : null;
  } catch {
    return null;
  }
}

function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <span className="font-body text-sm text-ink">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex size-8 items-center justify-center rounded-full border border-white/12 text-ink transition-colors hover:border-gold/40 disabled:opacity-30"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center font-heading text-base font-semibold tabular-nums text-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex size-8 items-center justify-center rounded-full border border-white/12 text-ink transition-colors hover:border-gold/40 disabled:opacity-30"
          aria-label={`Increase ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function PassengerDetailsPage() {
  const router = useRouter();
  const booking = useBookingStore();
  const { caravanClass, journey, passengers, pets, hasHydrated, setData } = booking;

  const maxGuests = caravanClass?.full_capacity ?? 1;
  const maxPets = caravanClass?.is_pet_friendly ? caravanClass.capacity_pets : 0;

  const [petsCount, setPetsCount] = React.useState(0);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PassengerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      travelers: [makeTraveler()],
      pet: { name: '', breed: '', vaccinated: false },
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelationship: '',
      specialRequests: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'travelers' });

  React.useEffect(() => {
    if (!hasHydrated) return;
    const stored = readStoredDetails();
    if (stored?.travelers?.length) {
      reset(stored);
    } else {
      const target = Math.max(1, Math.min(passengers || 1, maxGuests));
      reset((prev) => ({ ...prev, travelers: Array.from({ length: target }, () => makeTraveler()) }));
    }
    setPetsCount(Math.min(pets || 0, maxPets));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  const guestCount = fields.length;

  const setGuestCount = (next: number) => {
    const target = Math.max(1, Math.min(next, maxGuests));
    if (target > guestCount) {
      for (let i = guestCount; i < target; i += 1) append(makeTraveler());
    } else if (target < guestCount) {
      for (let i = guestCount; i > target; i -= 1) remove(i - 1);
    }
  };

  const incompleteJourney =
    hasHydrated && (!caravanClass || !journey?.stops?.length);

  const onSubmit = async (values: PassengerFormValues) => {
    if (!isAuthed()) {
      requestAuthThenNavigate('/passenger');
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Persist details for the summary view.
      window.localStorage.setItem(PASSENGER_STORAGE_KEY, JSON.stringify(values));

      const numHumans = values.travelers.length;
      // Finalise counts in the store, then create the cart from the merged state.
      setData({ passengers: numHumans, pets: petsCount });
      const merged = { ...booking, passengers: numHumans, pets: petsCount };
      const payload = buildCartPayload(merged);
      const cart = await cartService.createCart(payload);
      useCartStore.getState().setCart(cart);
      router.push('/booking/summary');
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : 'We could not price this journey. Please review your route and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (incompleteJourney) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-3xl font-semibold text-ink"
        >
          Let&apos;s finish the route first.
        </h1>
        <p className="mt-4 font-body text-sm text-ink-muted">
          We need your caravan and route before collecting traveler details.
        </p>
        <Link
          href="/select-caravan"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/30 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold/10"
        >
          Back to caravans
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 lg:px-8 lg:py-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <div>
          <header className="mb-10">
            <span className="label-mono text-gold">Step 03 / Travelers</span>
            <h1
              style={{ fontFamily: 'var(--font-display)' }}
              className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink"
            >
              Who is travelling?
            </h1>
            <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-ink-muted">
              Set your party, then add the details we need for trip documentation and on-road
              safety. Everything stays private to your booking.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Party size */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Stepper
                label="Guests"
                value={guestCount}
                min={1}
                max={maxGuests}
                onChange={setGuestCount}
              />
              {maxPets > 0 && (
                <Stepper
                  label="Pets"
                  value={petsCount}
                  min={0}
                  max={maxPets}
                  onChange={setPetsCount}
                />
              )}
            </section>

            {/* Travelers */}
            <section className="space-y-6">
              <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-[0.18em] text-ink">
                <Users className="size-4 text-gold" />
                Traveler details
              </h2>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
                >
                  <div className="mb-5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-gold/90">
                    {index === 0 ? 'Lead traveler' : `Traveler ${index + 1}`}
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS}>Full name</label>
                      <input className={FIELD_CLASS} placeholder="As printed on ID" {...register(`travelers.${index}.fullName`)} />
                      {errors.travelers?.[index]?.fullName && (
                        <p className={ERROR_CLASS}>{errors.travelers[index]?.fullName?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Date of birth</label>
                      <input type="date" className={`${FIELD_CLASS} [color-scheme:dark]`} {...register(`travelers.${index}.dob`)} />
                      {errors.travelers?.[index]?.dob && (
                        <p className={ERROR_CLASS}>{errors.travelers[index]?.dob?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>ID type</label>
                      <select className={`${FIELD_CLASS} appearance-none`} {...register(`travelers.${index}.idType`)}>
                        {ID_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-surface-1">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>ID number</label>
                      <input className={FIELD_CLASS} placeholder="Document number" {...register(`travelers.${index}.idNumber`)} />
                      {errors.travelers?.[index]?.idNumber && (
                        <p className={ERROR_CLASS}>{errors.travelers[index]?.idNumber?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Pet */}
            {petsCount > 0 && (
              <section className="space-y-5">
                <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-ink">
                  Pet details
                </h2>
                <div className="grid grid-cols-1 gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:grid-cols-3">
                  <div>
                    <label className={LABEL_CLASS}>Pet name</label>
                    <input className={FIELD_CLASS} placeholder="Name" {...register('pet.name')} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Breed</label>
                    <input className={FIELD_CLASS} placeholder="Breed" {...register('pet.breed')} />
                  </div>
                  <div className="flex items-end">
                    <label className="flex cursor-pointer items-center gap-3 pb-3">
                      <input type="checkbox" className="size-4 accent-gold" {...register('pet.vaccinated')} />
                      <span className="font-body text-sm text-ink-muted">Vaccinations up to date</span>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {/* Emergency contact */}
            <section className="space-y-5">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-ink">
                Emergency contact
              </h2>
              <div className="grid grid-cols-1 gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:grid-cols-3">
                <div>
                  <label className={LABEL_CLASS}>Name</label>
                  <input className={FIELD_CLASS} placeholder="Contact name" {...register('emergencyName')} />
                  {errors.emergencyName && <p className={ERROR_CLASS}>{errors.emergencyName.message}</p>}
                </div>
                <div>
                  <label className={LABEL_CLASS}>Phone</label>
                  <input className={FIELD_CLASS} placeholder="Phone number" {...register('emergencyPhone')} />
                  {errors.emergencyPhone && <p className={ERROR_CLASS}>{errors.emergencyPhone.message}</p>}
                </div>
                <div>
                  <label className={LABEL_CLASS}>Relationship</label>
                  <input className={FIELD_CLASS} placeholder="e.g. Spouse" {...register('emergencyRelationship')} />
                  {errors.emergencyRelationship && (
                    <p className={ERROR_CLASS}>{errors.emergencyRelationship.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Special requests */}
            <section className="space-y-5">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-ink">
                Special requests
              </h2>
              <textarea
                rows={4}
                className={`${FIELD_CLASS} resize-none`}
                placeholder="Dietary needs, accessibility, celebration notes, anything we should know."
                {...register('specialRequests')}
              />
            </section>

            {submitError && (
              <p className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 font-body text-sm text-red-200">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="gradient-cta group inline-flex items-center gap-2 rounded-full py-4 pl-8 pr-5 font-heading text-sm font-semibold uppercase tracking-[0.15em] text-gold-ink transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] disabled:opacity-60"
            >
              {submitting ? 'Pricing your journey…' : 'Continue to Summary'}
              <span className="flex size-7 items-center justify-center rounded-full bg-gold-ink/25">
                <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
              </span>
            </button>
          </form>
        </div>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <BookingSummary
            booking={booking}
            onContinue={() => handleSubmit(onSubmit)()}
            isLoading={submitting}
            continueLoadingLabel="Pricing…"
            showCaravanPricing={false}
          />
        </aside>
      </div>
    </div>
  );
}
