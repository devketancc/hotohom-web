'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, type UseMutationResult } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Info, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { applyDrfErrorsToForm, extractDrfFieldErrors } from '@/lib/coupons/drfErrors';
import {
  adminCouponToFormValues,
  couponFormSchema,
  couponFormValuesToPayload,
  defaultCouponFormValues,
  type CouponFormValues,
} from '@/lib/coupons/schema';
import { handleApiError } from '@/lib/errorHandler';
import { cn } from '@/lib/utils';
import { adminQueryKeys, listAdminCaravanClasses } from '@/services/admin.service';
import { listAdminCouponLocationOptions } from '@/services/coupon.service';
import type { AdminCoupon, AdminCouponWritePayload } from '@/types/coupon';

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function CouponForm({
  mode,
  couponId,
  coupon,
  createMutation,
  updateMutation,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  couponId?: string;
  coupon: AdminCoupon | null;
  createMutation: UseMutationResult<AdminCoupon, Error, AdminCouponWritePayload>;
  updateMutation: UseMutationResult<
    AdminCoupon,
    Error,
    { id: string; payload: Partial<AdminCouponWritePayload> }
  >;
  onSuccess: () => void;
}) {
  const defaultValues = useMemo(
    () => (mode === 'edit' && coupon ? adminCouponToFormValues(coupon) : defaultCouponFormValues()),
    [mode, coupon]
  );

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset, couponId, mode]);

  const watched = useWatch({ control });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [classSearch, setClassSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: adminQueryKeys.caravanClasses,
    queryFn: listAdminCaravanClasses,
    staleTime: 600_000,
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['admin', 'coupon-dest-options'],
    queryFn: listAdminCouponLocationOptions,
    staleTime: 600_000,
  });

  const filteredClasses = useMemo(() => {
    const q = classSearch.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [classes, classSearch]);

  const filteredLocations = useMemo(() => {
    const q = destSearch.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((l) => l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q));
  }, [locations, destSearch]);

  const now = useMemo(() => new Date(), []);
  const inactiveWindowWarning = useMemo(() => {
    if (watched.is_active) return false;
    const from = watched.valid_from ? new Date(watched.valid_from) : null;
    const until = watched.valid_until ? new Date(watched.valid_until) : null;
    if (!from || !until || Number.isNaN(from.valueOf()) || Number.isNaN(until.valueOf())) return false;
    return from <= now && now <= until;
  }, [watched.is_active, watched.valid_from, watched.valid_until, now]);

  const percentCapHint =
    watched.discount_type === 'percent' && !(watched.max_discount_cap ?? '').trim();

  const pending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();
    const payload = couponFormValuesToPayload(values);
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
      } else if (couponId) {
        await updateMutation.mutateAsync({ id: couponId, payload });
      }
      onSuccess();
    } catch (err) {
      const fieldErrors = extractDrfFieldErrors(err);
      if (fieldErrors) {
        applyDrfErrorsToForm<CouponFormValues>(fieldErrors, setError);
        const codeMsg = fieldErrors.code;
        if (codeMsg && /unique|exists|taken/i.test(codeMsg)) {
          setError('code', { type: 'server', message: 'Code already exists.' });
        }
        toast.error('Please fix the highlighted fields.');
      } else {
        toast.error(handleApiError(err));
      }
    }
  });

  const selectedClasses = watched.applicable_classes ?? [];
  const selectedDests = watched.applicable_destinations ?? [];

  const toggleClass = (code: string, checked: boolean) => {
    const next = checked ? [...selectedClasses, code] : selectedClasses.filter((c) => c !== code);
    setValue('applicable_classes', next, { shouldDirty: true, shouldValidate: true });
  };

  const toggleDest = (id: string, checked: boolean) => {
    const next = checked ? [...selectedDests, id] : selectedDests.filter((d) => d !== id);
    setValue('applicable_destinations', next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-8">
      {errors.root?.message ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.root.message}
        </div>
      ) : null}

      {watched.user?.trim() ? (
        <div className="flex gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-100">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-indigo-300" aria-hidden />
          <p>
            <span className="font-medium">Personal coupon</span> — only this user can redeem it at checkout.
          </p>
        </div>
      ) : null}

      {inactiveWindowWarning ? (
        <div className="flex gap-2 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden />
          <p>
            Dates fall in the valid window, but the coupon is <strong>inactive</strong> — customers cannot redeem it
            until you activate it.
          </p>
        </div>
      ) : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>Code, description, and visibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionTitle title="Identity" />
          <div className="space-y-2">
            <Label htmlFor="coupon-code">Code</Label>
            <Input
              id="coupon-code"
              {...register('code')}
              onBlur={(e) => {
                const v = e.target.value.trim().toUpperCase();
                setValue('code', v, { shouldValidate: true });
              }}
              className="font-mono uppercase"
              maxLength={50}
              aria-invalid={!!errors.code}
            />
            <FieldHint>Shown to customers at checkout. Letters and numbers; stored uppercase.</FieldHint>
            <FieldError message={errors.code?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-desc">Description</Label>
            <Textarea id="coupon-desc" {...register('description')} rows={3} aria-invalid={!!errors.description} />
            <FieldHint>Optional. Internal note or customer-facing description depending on your flows.</FieldHint>
            <FieldError message={errors.description?.message} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <div>
              <p className="text-sm font-medium">Active</p>
              <FieldHint>Inactive coupons never apply, even inside the date window.</FieldHint>
            </div>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Discount</CardTitle>
          <CardDescription>How much to take off, and what cart slice it applies to.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Discount type</Label>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
              {(['percent', 'flat'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('discount_type', t, { shouldValidate: true, shouldDirty: true })}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    watched.discount_type === t
                      ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'percent' ? 'Percentage' : 'Flat ₹'}
                </button>
              ))}
            </div>
            <FieldHint>Percent applies to the applicable cart slice; flat is a fixed rupee amount.</FieldHint>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discount-value">{watched.discount_type === 'percent' ? 'Percent off' : 'Amount (₹)'}</Label>
              <Input
                id="discount-value"
                {...register('discount_value')}
                inputMode="decimal"
                aria-invalid={!!errors.discount_value}
              />
              <FieldError message={errors.discount_value?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-cap">Max discount cap (₹)</Label>
              <Input
                id="max-cap"
                {...register('max_discount_cap')}
                inputMode="decimal"
                placeholder="Optional"
                aria-invalid={!!errors.max_discount_cap}
              />
              {percentCapHint ? (
                <p className="text-xs text-sky-300/90">
                  Recommended: set a max cap for percentage coupons to avoid very large discounts on high carts.
                </p>
              ) : (
                <FieldHint>Caps the discount for percentage coupons. Leave empty for no cap.</FieldHint>
              )}
              <FieldError message={errors.max_discount_cap?.message} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Apply discount to</Label>
              <Controller
                name="applicable_on"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v as CouponFormValues['applicable_on'])}>
                    <SelectTrigger className="w-full min-w-[12rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cart">Entire cart (base + add-ons)</SelectItem>
                      <SelectItem value="addons">Add-ons only</SelectItem>
                      <SelectItem value="base">Base rental only</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldHint>Controls which subtotal the engine uses when calculating the discount.</FieldHint>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-booking">Minimum booking value (₹)</Label>
              <Input id="min-booking" {...register('min_booking_value')} inputMode="decimal" aria-invalid={!!errors.min_booking_value} />
              <FieldHint>Cart must meet this threshold before the coupon can apply.</FieldHint>
              <FieldError message={errors.min_booking_value?.message} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Validity</CardTitle>
          <CardDescription>Local time is converted to ISO for the API.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="valid-from">Valid from</Label>
            <Input id="valid-from" type="datetime-local" {...register('valid_from')} aria-invalid={!!errors.valid_from} />
            <FieldError message={errors.valid_from?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valid-until">Valid until</Label>
            <Input id="valid-until" type="datetime-local" {...register('valid_until')} aria-invalid={!!errors.valid_until} />
            <FieldError message={errors.valid_until?.message} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Usage limits</CardTitle>
          <CardDescription>Global cap and per-customer limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max-uses">Max uses (global)</Label>
              <Input id="max-uses" {...register('max_uses')} inputMode="numeric" placeholder="Unlimited" />
              <FieldHint>Leave empty for unlimited usage across all customers.</FieldHint>
              <FieldError message={errors.max_uses?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="per-user">Per user limit</Label>
              <Input id="per-user" {...register('per_user_limit')} inputMode="numeric" />
              <FieldHint>How many times a single user can redeem this coupon.</FieldHint>
              <FieldError message={errors.per_user_limit?.message} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <div>
              <p className="text-sm font-medium">First booking only</p>
              <FieldHint>Only customers with no prior completed bookings can use this.</FieldHint>
            </div>
            <Controller
              name="is_first_booking_only"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Targeting</CardTitle>
          <CardDescription>Restrict by caravan class and destination. Empty means &quot;all&quot;.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <div>
              <p className="text-sm font-medium">Referral coupon</p>
              <FieldHint>Marks this coupon as part of a referral flow (reporting / ops).</FieldHint>
            </div>
            <Controller
              name="is_referral_coupon"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Applicable classes</Label>
            <Popover>
              <PopoverTrigger render={<Button type="button" variant="outline" className="w-full justify-between" />}>
                <span className="truncate text-left">
                  {selectedClasses.length === 0 ? 'All classes' : `${selectedClasses.length} selected`}
                </span>
                <ChevronDown className="size-4 opacity-60" />
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="border-b border-border p-2">
                  <Input
                    placeholder="Search classes…"
                    value={classSearch}
                    onChange={(e) => setClassSearch(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto p-2">
                  {classesLoading ? (
                    <p className="px-2 py-4 text-xs text-muted-foreground">Loading…</p>
                  ) : (
                    filteredClasses.map((c) => {
                      const checked = selectedClasses.includes(c.code);
                      return (
                        <label
                          key={c.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60"
                        >
                          <Checkbox checked={checked} onCheckedChange={(v) => toggleClass(c.code, Boolean(v))} />
                          <span className="text-sm">
                            <span className="font-mono font-medium">{c.code}</span>
                            <span className="text-muted-foreground"> · {c.name}</span>
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <FieldHint>Pick specific class codes, or leave none selected to allow every class.</FieldHint>
          </div>

          <div className="space-y-2">
            <Label>Applicable destinations</Label>
            <Popover>
              <PopoverTrigger render={<Button type="button" variant="outline" className="w-full justify-between" />}>
                <span className="truncate text-left">
                  {selectedDests.length === 0 ? 'All destinations' : `${selectedDests.length} selected`}
                </span>
                <ChevronDown className="size-4 opacity-60" />
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="start">
                <div className="border-b border-border p-2">
                  <Input
                    placeholder="Search locations…"
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {locationsLoading ? (
                    <p className="px-2 py-4 text-xs text-muted-foreground">Loading…</p>
                  ) : (
                    filteredLocations.map((l) => {
                      const checked = selectedDests.includes(l.id);
                      return (
                        <label
                          key={l.id}
                          className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => toggleDest(l.id, Boolean(v))}
                            className="mt-0.5"
                          />
                          <span className="text-sm leading-snug">
                            {l.name}
                            <span className="mt-0.5 block text-xs text-muted-foreground">{l.location_type}</span>
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <FieldHint>Waypoints from your catalog. None selected = all destinations.</FieldHint>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Advanced</CardTitle>
          <CardDescription>Optional personal assignment.</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-lg border border-dashed border-border/80 bg-muted/15 px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/25"
          >
            <span>Assign to specific user (UUID)</span>
            {advancedOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          {advancedOpen ? (
            <div className="mt-3 space-y-2">
              <Label htmlFor="user-uuid">Customer user ID</Label>
              <Input id="user-uuid" {...register('user')} placeholder="00000000-0000-0000-0000-000000000000" className="font-mono text-sm" />
              <FieldHint>
                Paste a customer user UUID from your systems. Wrong IDs will fail at checkout. Leave empty for a public
                coupon.
              </FieldHint>
              <FieldError message={errors.user?.message} />
              {watched.user?.trim() ? (
                <div className="flex flex-wrap gap-1 pt-1">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {watched.user.trim().slice(0, 8)}…
                  </Badge>
                  <Button type="button" variant="ghost" size="xs" className="h-6 text-xs" onClick={() => setValue('user', '')}>
                    Clear
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={pending} className="min-w-[8rem]">
          {pending ? 'Saving…' : mode === 'create' ? 'Create coupon' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
