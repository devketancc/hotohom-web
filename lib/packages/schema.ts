import { z } from 'zod';
import type { AdminPackage, AdminPackageWritePayload } from '@/types/adminPackage';

function flattenStopsFromPackage(pkg: AdminPackage): AdminPackageWritePayload['stops'] {
  const fromDays = (pkg.days ?? []).flatMap((d) =>
    (d.stops ?? []).map((s) => ({
      order: s.order,
      day_number: s.day_number ?? d.day_number,
      stop_type: s.stop_type,
      title: s.title ?? '',
      location: s.location,
      distance_from_prev_km: s.distance_from_prev_km,
      notes: s.notes ?? '',
    }))
  );
  return fromDays;
}

const stayTypeSchema = z.enum(['caravan_park', 'campsite', 'hotel', 'private_land', 'none']);
const stopTypeSchema = z.enum(['hub_start', 'waypoint', 'hub_end']);

const dayFormSchema = z.object({
  day_number: z.string().min(1, 'Required'),
  title: z.string().min(1, 'Day title is required.'),
  description: z.string(),
  stay_type: stayTypeSchema,
  stay_name: z.string(),
  stay_location: z.string(),
  stay_address: z.string(),
  amenities: z.array(z.string()),
  stay_notes: z.string(),
});

const stopFormSchema = z.object({
  order: z.string().min(1, 'Required'),
  day_number: z.string(),
  stop_type: stopTypeSchema,
  title: z.string(),
  location: z.string().min(1, 'Select a location.'),
  distance_from_prev_km: z.string(),
  notes: z.string(),
});

export const packageWizardSchema = z
  .object({
    name: z.string().min(1, 'Name is required.').max(255),
    description: z.string(),
    caravan_class: z.string().min(1, 'Select a caravan class.'),
    home_hub: z.string().min(1, 'Select a departure hub.'),
    duration_days: z.string().min(1, 'Required'),
    included_km: z.string().min(1, 'Required'),
    base_price: z.string().min(1, 'Required'),
    is_active: z.boolean(),
    thumbnail_url: z.string(),
    images: z.array(z.string()),
    highlights: z.array(z.string()),
    days: z.array(dayFormSchema),
    stops: z.array(stopFormSchema),
  })
  .superRefine((val, ctx) => {
    const duration = Number(val.duration_days);
    if (!Number.isFinite(duration) || duration < 1 || !Number.isInteger(duration)) {
      ctx.addIssue({ code: 'custom', message: 'Must be an integer ≥ 1.', path: ['duration_days'] });
    }

    const km = Number(val.included_km);
    if (!Number.isFinite(km) || km < 0) {
      ctx.addIssue({ code: 'custom', message: 'Must be 0 or more.', path: ['included_km'] });
    }

    const price = Number(val.base_price);
    if (!Number.isFinite(price) || price <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Enter a positive amount.', path: ['base_price'] });
    }

    const thumb = val.thumbnail_url.trim();
    if (thumb) {
      try {
        new URL(thumb);
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Invalid thumbnail URL.', path: ['thumbnail_url'] });
      }
    }

    for (let i = 0; i < val.images.length; i++) {
      const url = val.images[i]?.trim();
      if (!url) continue;
      try {
        new URL(url);
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Invalid image URL.', path: ['images', i] });
      }
    }

    const dayNumbers = new Set<number>();
    for (let i = 0; i < val.days.length; i++) {
      const dn = Number(val.days[i]?.day_number);
      if (!Number.isFinite(dn) || dn < 1) {
        ctx.addIssue({ code: 'custom', message: 'Invalid day number.', path: ['days', i, 'day_number'] });
      } else if (dayNumbers.has(dn)) {
        ctx.addIssue({ code: 'custom', message: 'Duplicate day number.', path: ['days', i, 'day_number'] });
      } else {
        dayNumbers.add(dn);
      }
    }

    const orders = new Set<number>();
    for (let i = 0; i < val.stops.length; i++) {
      const ord = Number(val.stops[i]?.order);
      if (!Number.isFinite(ord) || ord < 0) {
        ctx.addIssue({ code: 'custom', message: 'Invalid order.', path: ['stops', i, 'order'] });
      } else if (orders.has(ord)) {
        ctx.addIssue({ code: 'custom', message: 'Duplicate stop order.', path: ['stops', i, 'order'] });
      } else {
        orders.add(ord);
      }

      const dayRef = val.stops[i]?.day_number?.trim();
      if (dayRef) {
        const dn = Number(dayRef);
        if (!dayNumbers.has(dn)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Day not defined in itinerary.',
            path: ['stops', i, 'day_number'],
          });
        }
      }
    }

    if (duration > 0 && val.days.length > 0) {
      const maxDay = Math.max(...val.days.map((d) => Number(d.day_number) || 0));
      if (maxDay > duration) {
        ctx.addIssue({
          code: 'custom',
          message: `Duration (${duration}) is less than highest day (${maxDay}).`,
          path: ['duration_days'],
        });
      }
    }
  });

export type PackageWizardFormValues = z.infer<typeof packageWizardSchema>;

export const PACKAGE_WIZARD_STEPS = [
  { id: 'basics', title: 'Basics', fields: ['name', 'description', 'caravan_class', 'home_hub', 'duration_days', 'included_km', 'base_price', 'is_active'] as const },
  { id: 'media', title: 'Media', fields: ['thumbnail_url', 'images', 'highlights'] as const },
  { id: 'days', title: 'Itinerary', fields: ['days'] as const },
  { id: 'stops', title: 'Route', fields: ['stops'] as const },
  { id: 'review', title: 'Review', fields: [] as const },
] as const;

export type PackageWizardStepId = (typeof PACKAGE_WIZARD_STEPS)[number]['id'];

export function defaultPackageFormValues(): PackageWizardFormValues {
  return {
    name: '',
    description: '',
    caravan_class: '',
    home_hub: '',
    duration_days: '1',
    included_km: '0',
    base_price: '',
    is_active: true,
    thumbnail_url: '',
    images: [],
    highlights: [],
    days: [],
    stops: [],
  };
}

export function defaultDayFormValues(dayNumber: number): PackageWizardFormValues['days'][number] {
  return {
    day_number: String(dayNumber),
    title: `Day ${dayNumber}`,
    description: '',
    stay_type: 'none',
    stay_name: '',
    stay_location: '',
    stay_address: '',
    amenities: [],
    stay_notes: '',
  };
}

export function defaultStopFormValues(order: number, dayNumber?: number): PackageWizardFormValues['stops'][number] {
  return {
    order: String(order),
    day_number: dayNumber != null ? String(dayNumber) : '',
    stop_type: 'waypoint',
    title: '',
    location: '',
    distance_from_prev_km: '',
    notes: '',
  };
}

export function adminPackageToFormValues(pkg: AdminPackage): PackageWizardFormValues {
  const flatStops = flattenStopsFromPackage(pkg).sort((a, b) => a.order - b.order);

  return {
    name: pkg.name,
    description: pkg.description ?? '',
    caravan_class: pkg.caravan_class,
    home_hub: pkg.home_hub,
    duration_days: String(pkg.duration_days || 1),
    included_km: String(pkg.included_km ?? 0),
    base_price: pkg.base_price,
    is_active: pkg.is_active,
    thumbnail_url: pkg.thumbnail_url?.trim() ?? '',
    images: [...(pkg.images ?? [])],
    highlights: [...(pkg.highlights ?? [])],
    days: (pkg.days ?? [])
      .slice()
      .sort((a, b) => a.day_number - b.day_number)
      .map((d) => ({
        day_number: String(d.day_number),
        title: d.title,
        description: d.description ?? '',
        stay_type: (['caravan_park', 'campsite', 'hotel', 'private_land', 'none'].includes(d.stay_type)
          ? d.stay_type
          : 'none') as PackageWizardFormValues['days'][number]['stay_type'],
        stay_name: d.stay_name ?? '',
        stay_location: d.stay_location ?? '',
        stay_address: d.stay_address ?? '',
        amenities: [...(d.amenities ?? [])],
        stay_notes: d.stay_notes ?? '',
      })),
    stops: flatStops.map((s) => ({
      order: String(s.order),
      day_number: s.day_number != null ? String(s.day_number) : '',
      stop_type: (['hub_start', 'waypoint', 'hub_end'].includes(s.stop_type)
        ? s.stop_type
        : 'waypoint') as PackageWizardFormValues['stops'][number]['stop_type'],
      title: s.title ?? '',
      location: s.location,
      distance_from_prev_km:
        s.distance_from_prev_km != null && s.distance_from_prev_km > 0 ? String(s.distance_from_prev_km) : '',
      notes: s.notes ?? '',
    })),
  };
}

export function packageFormValuesToPayload(values: PackageWizardFormValues): AdminPackageWritePayload {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    caravan_class: values.caravan_class,
    home_hub: values.home_hub,
    duration_days: Number(values.duration_days),
    included_km: Number(values.included_km),
    base_price: values.base_price.trim(),
    thumbnail_url: values.thumbnail_url.trim() || undefined,
    highlights: values.highlights.filter((h) => h.trim()),
    images: values.images.map((u) => u.trim()).filter(Boolean),
    is_active: values.is_active,
    days: values.days.map((d) => ({
      day_number: Number(d.day_number),
      title: d.title.trim(),
      description: d.description.trim() || undefined,
      stay_type: d.stay_type,
      stay_name: d.stay_name.trim() || undefined,
      stay_location: d.stay_location.trim() || null,
      stay_address: d.stay_address.trim() || undefined,
      amenities: d.amenities.filter((a) => a.trim()),
      stay_notes: d.stay_notes.trim() || undefined,
    })),
    stops: values.stops.map((s) => {
      const dist = s.distance_from_prev_km.trim();
      return {
        order: Number(s.order),
        day_number: s.day_number.trim() ? Number(s.day_number) : null,
        stop_type: s.stop_type,
        title: s.title.trim() || undefined,
        location: s.location,
        distance_from_prev_km: dist ? Number(dist) : null,
        notes: s.notes.trim() || undefined,
      };
    }),
  };
}

const DRAFT_KEY = 'admin-package-draft';

export function savePackageDraft(values: PackageWizardFormValues): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    /* ignore */
  }
}

export function loadPackageDraft(): PackageWizardFormValues | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PackageWizardFormValues;
    return packageWizardSchema.safeParse(parsed).success ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPackageDraft(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DRAFT_KEY);
}
