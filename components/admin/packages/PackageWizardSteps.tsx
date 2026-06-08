'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { useFieldArray, useWatch } from 'react-hook-form';
import { PackageLocationCombobox } from '@/components/admin/packages/PackageLocationCombobox';
import { PackageStringListField } from '@/components/admin/packages/PackageStringListField';
import { PackageTagListField } from '@/components/admin/packages/PackageTagListField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  defaultDayFormValues,
  defaultStopFormValues,
  type PackageWizardFormValues,
  type PackageWizardStepId,
} from '@/lib/packages/schema';
import { adminQueryKeys, listAdminCaravanClasses, listAdminHubs } from '@/services/admin.service';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

const STAY_TYPES = [
  { value: 'none', label: 'No overnight stay' },
  { value: 'caravan_park', label: 'Caravan park' },
  { value: 'campsite', label: 'Campsite' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'private_land', label: 'Private land' },
] as const;

const STOP_TYPES = [
  { value: 'hub_start', label: 'Departure (hub start)' },
  { value: 'waypoint', label: 'Waypoint' },
  { value: 'hub_end', label: 'Return (hub end)' },
] as const;

export function PackageWizardSteps({
  stepId,
  register,
  control,
  errors,
  setValue,
}: {
  stepId: PackageWizardStepId;
  register: UseFormRegister<PackageWizardFormValues>;
  control: Control<PackageWizardFormValues>;
  errors: FieldErrors<PackageWizardFormValues>;
  setValue: UseFormSetValue<PackageWizardFormValues>;
}) {
  const { data: hubs = [], isLoading: hubsLoading } = useQuery({
    queryKey: adminQueryKeys.hubs,
    queryFn: listAdminHubs,
    staleTime: 600_000,
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: adminQueryKeys.caravanClasses,
    queryFn: listAdminCaravanClasses,
    staleTime: 600_000,
  });

  const daysField = useFieldArray({ control, name: 'days' });
  const stopsField = useFieldArray({ control, name: 'stops' });
  const watched = useWatch({ control });

  const highlights = watched.highlights ?? [];
  const images = watched.images ?? [];

  if (stepId === 'basics') {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Package basics</CardTitle>
          <CardDescription>Name, hub, class, duration, and pricing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pkg-name">Name</Label>
            <Input id="pkg-name" {...register('name')} />
            <FieldError message={errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pkg-desc">Description</Label>
            <Textarea id="pkg-desc" rows={4} {...register('description')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Caravan class</Label>
              <Select
                value={watched.caravan_class ?? ''}
                onValueChange={(v) => v && setValue('caravan_class', v, { shouldValidate: true })}
                disabled={classesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={classesLoading ? 'Loading…' : 'Select class'} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.caravan_class?.message} />
            </div>
            <div className="space-y-2">
              <Label>Departure hub</Label>
              <Select
                value={watched.home_hub ?? ''}
                onValueChange={(v) => v && setValue('home_hub', v, { shouldValidate: true })}
                disabled={hubsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={hubsLoading ? 'Loading…' : 'Select hub'} />
                </SelectTrigger>
                <SelectContent>
                  {hubs.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.home_hub?.message} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pkg-duration">Duration (days)</Label>
              <Input id="pkg-duration" type="number" min={1} {...register('duration_days')} />
              <FieldError message={errors.duration_days?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-km">Included km</Label>
              <Input id="pkg-km" type="number" min={0} {...register('included_km')} />
              <FieldError message={errors.included_km?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-price">Base price (INR)</Label>
              <Input id="pkg-price" {...register('base_price')} />
              <FieldError message={errors.base_price?.message} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Published (active)</p>
              <p className="text-xs text-muted-foreground">Inactive packages are hidden from the public catalog.</p>
            </div>
            <Switch
              checked={watched.is_active ?? true}
              onCheckedChange={(v) => setValue('is_active', v)}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stepId === 'media') {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Media & highlights</CardTitle>
          <CardDescription>Thumbnail, gallery images, and marketing highlights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pkg-thumb">Thumbnail URL</Label>
            <Input id="pkg-thumb" {...register('thumbnail_url')} placeholder="https://…" />
            <FieldError message={errors.thumbnail_url?.message} />
            {watched.thumbnail_url?.trim() ? (
              <div className="mt-2 overflow-hidden rounded-lg border border-border/80 aspect-video max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={watched.thumbnail_url.trim()} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null}
          </div>
          <PackageStringListField
            label="Gallery images"
            hint="Additional photos shown on the package detail page."
            values={images}
            onChange={(next) => setValue('images', next, { shouldValidate: true })}
          />
          <PackageTagListField
            label="Highlights"
            hint="Short selling points, e.g. “Beachside camping”."
            values={highlights}
            onChange={(next) => setValue('highlights', next)}
          />
        </CardContent>
      </Card>
    );
  }

  if (stepId === 'days') {
    const nextDayNum =
      daysField.fields.length === 0
        ? 1
        : Math.max(...daysField.fields.map((_, i) => Number(watched.days?.[i]?.day_number) || 0)) + 1;

    return (
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Itinerary days</CardTitle>
            <CardDescription>Day-by-day titles, descriptions, and overnight stays.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              daysField.append(defaultDayFormValues(nextDayNum));
              const dur = Number(watched.duration_days) || 0;
              if (nextDayNum > dur) setValue('duration_days', String(nextDayNum));
            }}
          >
            <Plus className="size-3.5 mr-1" aria-hidden />
            Add day
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {daysField.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No itinerary days yet. Add at least one day for your package.</p>
          ) : null}
          {daysField.fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-border/80 p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">Day {watched.days?.[index]?.day_number ?? index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => daysField.remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Day number</Label>
                  <Input {...register(`days.${index}.day_number`)} />
                  <FieldError message={errors.days?.[index]?.day_number?.message} />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input {...register(`days.${index}.title`)} />
                  <FieldError message={errors.days?.[index]?.title?.message} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={2} {...register(`days.${index}.description`)} />
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Stay type</Label>
                  <Select
                    value={watched.days?.[index]?.stay_type ?? 'none'}
                    onValueChange={(v) => {
                      if (!v) return;
                      setValue(`days.${index}.stay_type`, v as PackageWizardFormValues['days'][number]['stay_type']);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAY_TYPES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stay name</Label>
                  <Input {...register(`days.${index}.stay_name`)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stay location (optional)</Label>
                <PackageLocationCombobox
                  value={watched.days?.[index]?.stay_location ?? ''}
                  onChange={(id) => setValue(`days.${index}.stay_location`, id)}
                />
              </div>
              <div className="space-y-2">
                <Label>Stay address</Label>
                <Input {...register(`days.${index}.stay_address`)} />
              </div>
              <PackageTagListField
                label="Amenities"
                values={watched.days?.[index]?.amenities ?? []}
                onChange={(next) => setValue(`days.${index}.amenities`, next)}
                placeholder="e.g. power hookup"
              />
              <div className="space-y-2">
                <Label>Stay notes</Label>
                <Textarea rows={2} {...register(`days.${index}.stay_notes`)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (stepId === 'stops') {
    const dayOptions = (watched.days ?? [])
      .map((d) => Number(d.day_number))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b);

    const nextOrder =
      stopsField.fields.length === 0
        ? 1
        : Math.max(...stopsField.fields.map((_, i) => Number(watched.stops?.[i]?.order) || 0)) + 1;

    const moveStop = (index: number, dir: -1 | 1) => {
      const target = index + dir;
      if (target < 0 || target >= stopsField.fields.length) return;
      stopsField.move(index, target);
    };

    return (
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Route stops</CardTitle>
            <CardDescription>Ordered stops linked to itinerary days.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => stopsField.append(defaultStopFormValues(nextOrder, dayOptions[0]))}
          >
            <Plus className="size-3.5 mr-1" aria-hidden />
            Add stop
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {stopsField.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">Optional route template. Add hub start, waypoints, and return.</p>
          ) : null}
          {stopsField.fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-border/80 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold">Stop #{watched.stops?.[index]?.order ?? index + 1}</p>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveStop(index, -1)} aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveStop(index, 1)} aria-label="Move down">
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => stopsField.remove(index)} aria-label="Remove">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input {...register(`stops.${index}.order`)} />
                  <FieldError message={errors.stops?.[index]?.order?.message} />
                </div>
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select
                    value={watched.stops?.[index]?.day_number || '__none'}
                    onValueChange={(v) => {
                      if (!v) return;
                      setValue(`stops.${index}.day_number`, v === '__none' ? '' : v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Unassigned</SelectItem>
                      {dayOptions.map((dn) => (
                        <SelectItem key={dn} value={String(dn)}>
                          Day {dn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.stops?.[index]?.day_number?.message} />
                </div>
                <div className="space-y-2">
                  <Label>Stop type</Label>
                  <Select
                    value={watched.stops?.[index]?.stop_type ?? 'waypoint'}
                    onValueChange={(v) => {
                      if (!v) return;
                      setValue(`stops.${index}.stop_type`, v as PackageWizardFormValues['stops'][number]['stop_type']);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STOP_TYPES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input {...register(`stops.${index}.title`)} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <PackageLocationCombobox
                  value={watched.stops?.[index]?.location ?? ''}
                  onChange={(id) => setValue(`stops.${index}.location`, id, { shouldValidate: true })}
                />
                <FieldError message={errors.stops?.[index]?.location?.message} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Km from previous</Label>
                  <Input {...register(`stops.${index}.distance_from_prev_km`)} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input {...register(`stops.${index}.notes`)} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return null;
}
