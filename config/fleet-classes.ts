/**
 * Fleet redesign content model — the marketing/editorial layer for the /fleet
 * overview and detail pages. Keeps the existing marketing names and URL slugs
 * (Traveller / Monarch / Urbania / Viceroy) but re-frames every class around the
 * confirmed T -> M -> U -> V tier progression.
 *
 * SOURCE OF TRUTH SPLIT:
 *   - Real, API-backed values (guest capacity, amenities, pet policy, unit count,
 *     media) come from `FleetClassSummary` at render time. Do NOT duplicate them
 *     here.
 *   - Positioning, differentiators and CTA behaviour below are confirmed by the
 *     brand brief.
 *   - Anything in `placeholderSpecs` is NOT confirmed and is rendered with a
 *     visible "to confirm" marker. Search `PLACEHOLDER` to find every slot that
 *     needs real numbers before launch.
 *
 * Backend is read-only for this work. If per-class specs (berths, length, water,
 * battery, etc.) should become real, they are a backend dependency — add fields
 * to the caravan-class API and replace `placeholderSpecs` with API data.
 */

import { FLEET_SLUG_BY_CODE, type FleetClassCode } from '@/config/fleet-experience';

export type { FleetClassCode };

/** Confirmed ascending tier order. Drives every "progression" UI. */
export const FLEET_TIER_ORDER: FleetClassCode[] = ['T', 'M', 'U', 'V'];

export type FleetCtaKind = 'book' | 'enquiry';
export type FleetAccentTone = 'warm' | 'cool' | 'champagne';

export interface FleetPlaceholderSpec {
  label: string;
  /** Unconfirmed value, shown with a "to confirm" marker. */
  value: string;
  /** Always true here — these are not API-backed numbers. */
  placeholder: true;
}

export interface FleetClassContent {
  code: FleetClassCode;
  /** 1-4, ascending. */
  tier: number;
  /** Marketing name (kept for site + slug consistency). */
  name: string;
  /** e.g. "Class T". */
  classLabel: string;
  slug: string;
  /** Who this class is for, in plain language. */
  audience: string;
  /** Short hero tagline. */
  tagline: string;
  /** One line that separates this class from the other three. */
  differentiator: string;
  /** 1-2 short paragraphs of positioning. */
  positioning: string[];
  /** Signature things this tier adds over the one below it. */
  signatures: string[];
  ctaKind: FleetCtaKind;
  ctaLabel: string;
  ctaHref: string;
  /** Secondary action label/href (omitted for discretion-first V). */
  secondaryLabel?: string;
  secondaryHref?: string;
  accentTone: FleetAccentTone;
  /**
   * Local brand photo used until per-class marketing media is delivered.
   * These are real MotoHom frames from /public/exp-case, used as a tasteful
   * stand-in — swap for class-specific hero art when available.
   */
  fallbackImage: string;
  /** PLACEHOLDER spec rows — not API-backed. Replace before launch. */
  placeholderSpecs: FleetPlaceholderSpec[];
}

const ph = (label: string, value: string): FleetPlaceholderSpec => ({
  label,
  value,
  placeholder: true,
});

/**
 * Features every class shares (brand brief). Rendered once as a "standard across
 * the fleet" band so the per-class sections can focus on what differs.
 */
export const FLEET_SHARED_FEATURES: { label: string; note: string }[] = [
  { label: 'Trained crew', note: 'Driver + helper on every trip. No self-drive.' },
  { label: 'Real beds', note: 'Proper sleeping berths, made up on arrival.' },
  { label: 'Lounge & sofa', note: 'A living room that travels with you.' },
  { label: 'Private washroom', note: 'Onboard toilet and shower.' },
  { label: 'Kitchen', note: 'Compact galley for cooking on the road.' },
  { label: 'Sun deck', note: 'Step out and take in wherever you stopped.' },
  { label: 'Air conditioning', note: 'Climate comfort in every season.' },
  { label: 'Pet-friendly option', note: 'Bring the dog. Available across classes.' },
];

export const FLEET_CLASS_CONTENT: Record<FleetClassCode, FleetClassContent> = {
  T: {
    code: 'T',
    tier: 1,
    name: 'Traveller',
    classLabel: 'Class T',
    slug: FLEET_SLUG_BY_CODE.T,
    audience: 'Families, friend groups & camper crews',
    tagline: 'The whole road, the easiest yes.',
    differentiator: 'Our most-booked class with the widest hub availability.',
    positioning: [
      'The Traveller is where most MotoHom journeys begin. It carries a full group in genuine comfort without the price climbing, which is exactly why it is the class we book the most.',
      'Available at more hubs than any other silhouette, so the dates you want are the dates you usually get.',
    ],
    signatures: [
      'Widest availability across hubs',
      'Best value per guest',
      'Quick to confirm, easy to plan',
    ],
    ctaKind: 'book',
    ctaLabel: 'Check availability',
    ctaHref: '/select-caravan',
    secondaryLabel: 'See the Traveller',
    secondaryHref: `/fleet/${FLEET_SLUG_BY_CODE.T}`,
    accentTone: 'warm',
    fallbackImage: '/exp-case/mh1.png',
    // PLACEHOLDER — not confirmed. Replace with real spec data before launch.
    placeholderSpecs: [
      ph('Sleeps', 'up to 6'),
      ph('Ride & finish', 'Core comfort'),
      ph('Best for', 'Group road trips'),
    ],
  },
  M: {
    code: 'M',
    tier: 2,
    name: 'Monarch',
    classLabel: 'Class M',
    slug: FLEET_SLUG_BY_CODE.M,
    audience: 'Premium leisure travellers',
    tagline: 'Traveller comfort, with a concierge layer.',
    differentiator: 'A measurable step up in finish, quietness and curated add-ons.',
    positioning: [
      'The Monarch is the natural upgrade from the Traveller. The cabin is finished to a higher standard and the ride is noticeably quieter, so the miles between stops feel like part of the holiday.',
      'It is also where curated add-ons begin: a deck BBQ, a private cook, the small touches that turn a trip into an occasion.',
    ],
    signatures: [
      'Finer materials and a quieter ride',
      'Curated add-ons: BBQ, private cook',
      'Same easy booking as the Traveller',
    ],
    ctaKind: 'book',
    ctaLabel: 'Check availability',
    ctaHref: '/select-caravan',
    secondaryLabel: 'See the Monarch',
    secondaryHref: `/fleet/${FLEET_SLUG_BY_CODE.M}`,
    accentTone: 'warm',
    fallbackImage: '/exp-case/mh2.png',
    // PLACEHOLDER — not confirmed.
    placeholderSpecs: [
      ph('Sleeps', 'up to 6'),
      ph('Ride & finish', 'Elevated, quieter'),
      ph('Best for', 'Premium leisure'),
    ],
  },
  U: {
    code: 'U',
    tier: 3,
    name: 'Urbania',
    classLabel: 'Class U',
    slug: FLEET_SLUG_BY_CODE.U,
    audience: 'Executives & corporate travel',
    tagline: 'The class you can work from.',
    differentiator: 'The only class built around a soundproofed quiet workspace.',
    positioning: [
      'The Urbania is tuned for people who travel for work. A soundproofed cabin and a dedicated quiet workspace mean calls, focus and meetings hold up while the country moves past the window.',
      'Priority crew keep the schedule yours: punctual, briefed, and used to executive timetables.',
    ],
    signatures: [
      'Soundproofed quiet workspace',
      'Priority, schedule-aware crew',
      'Built for working on the move',
    ],
    ctaKind: 'book',
    ctaLabel: 'Check availability',
    ctaHref: '/select-caravan',
    secondaryLabel: 'See the Urbania',
    secondaryHref: `/fleet/${FLEET_SLUG_BY_CODE.U}`,
    accentTone: 'cool',
    fallbackImage: '/exp-case/mh3.png',
    // PLACEHOLDER — not confirmed.
    placeholderSpecs: [
      ph('Sleeps', 'up to 4'),
      ph('Ride & finish', 'Soundproofed'),
      ph('Best for', 'Working travel'),
    ],
  },
  V: {
    code: 'V',
    tier: 4,
    name: 'Viceroy',
    classLabel: 'Class V',
    slug: FLEET_SLUG_BY_CODE.V,
    audience: 'Reserved for a private few',
    tagline: 'By invitation, never listed.',
    differentiator: 'Discretion-first: vetted crew, no public visibility, request only.',
    positioning: [
      'The Viceroy sits at the top of the lineage and is handled differently from everything below it. It is not openly booked. Guests are received by request, on terms set around privacy.',
      'Vetted crew, no public visibility, and a single point of contact. If discretion is the requirement, this is the class built for it.',
    ],
    signatures: [
      'Vetted, discretion-bound crew',
      'No public visibility, ever',
      'A single private point of contact',
    ],
    // Discretion positioning — request/enquiry flow, never "book now". The
    // secondary link leads to the bespoke Viceroy showcase page (still no
    // public booking, just a way to see its beauty before requesting).
    ctaKind: 'enquiry',
    ctaLabel: 'Request an invitation',
    ctaHref: '/about#concierge',
    secondaryLabel: 'Explore the Viceroy',
    secondaryHref: `/fleet/${FLEET_SLUG_BY_CODE.V}`,
    accentTone: 'champagne',
    fallbackImage: '/exp-case/mh4.png',
    // PLACEHOLDER — not confirmed.
    placeholderSpecs: [
      ph('Sleeps', 'by arrangement'),
      ph('Ride & finish', 'Flagship'),
      ph('Best for', 'Private travel'),
    ],
  },
};

/** Content in confirmed tier order. */
export function getFleetClassesInOrder(): FleetClassContent[] {
  return FLEET_TIER_ORDER.map((code) => FLEET_CLASS_CONTENT[code]);
}

export function getFleetClassContent(code: string | undefined): FleetClassContent | null {
  if (!code) return null;
  const upper = code.toUpperCase() as FleetClassCode;
  return FLEET_CLASS_CONTENT[upper] ?? null;
}
