'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, type UseMutationResult } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
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
  addonFormSchema,
  addonFormValuesToPayload,
  adminAddonToFormValues,
  defaultAddonFormValues,
  type AddonFormValues,
} from '@/lib/addons/schema';
import { handleApiError } from '@/lib/errorHandler';
import { adminQueryKeys, listAdminCaravanClasses } from '@/services/admin.service';
import type { AdminAddon, AdminAddonWritePayload } from '@/types/adminAddon';

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

const CATEGORY_OPTIONS = [
  { value: 'comfort', label: 'Comfort' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'safety', label: 'Safety' },
  { value: 'utility', label: 'Utility' },
  { value: 'other', label: 'Other' },
] as const;

export function AddonForm({
  mode,
  addonId,
  addon,
  createMutation,
  updateMutation,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  addonId?: string;
  addon: AdminAddon | null;
  createMutation: UseMutationResult<AdminAddon, Error, AdminAddonWritePayload>;
  updateMutation: UseMutationResult<
    AdminAddon,
    Error,
    { id: string; payload: Partial<AdminAddonWritePayload> }
  >;
  onSuccess: () => void;
}) {
  const defaultValues = useMemo(
    () => (mode === 'edit' && addon ? adminAddonToFormValues(addon) : defaultAddonFormValues()),
    [mode, addon]
  );

  const form = useForm<AddonFormValues>({
    resolver: zodResolver(addonFormSchema),
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
  }, [defaultValues, reset, addonId, mode]);

  const watched = useWatch({ control });
  const [classSearch, setClassSearch] = useState('');

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: adminQueryKeys.caravanClasses,
    queryFn: listAdminCaravanClasses,
    staleTime: 600_000,
  });

  const filteredClasses = useMemo(() => {
    const q = classSearch.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [classes, classSearch]);

  const pending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();
    const payload = addonFormValuesToPayload(values);
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
      } else if (addonId) {
        await updateMutation.mutateAsync({ id: addonId, payload });
      }
      onSuccess();
    } catch (err) {
      const fieldErrors = extractDrfFieldErrors(err);
      if (fieldErrors) {
        applyDrfErrorsToForm<AddonFormValues>(fieldErrors, setError);
        toast.error('Please fix the highlighted fields.');
      } else {
        toast.error(handleApiError(err));
      }
    }
  });

  const selectedClasses = watched.applicable_classes ?? [];
  const allClasses = watched.all_classes ?? true;

  const toggleClass = (code: string, checked: boolean) => {
    const next = checked ? [...selectedClasses, code] : selectedClasses.filter((c) => c !== code);
    setValue('applicable_classes', next, { shouldDirty: true, shouldValidate: true });
  };

  const handleAllClassesChange = (checked: boolean) => {
    setValue('all_classes', checked, { shouldDirty: true, shouldValidate: true });
    if (checked) {
      setValue('applicable_classes', [], { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-8">
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>Name, description, and visibility at checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="addon-name">Name</Label>
            <Input id="addon-name" {...register('name')} maxLength={255} aria-invalid={!!errors.name} />
            <FieldError message={errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addon-desc">Description</Label>
            <Textarea id="addon-desc" {...register('description')} rows={3} aria-invalid={!!errors.description} />
            <FieldHint>Optional. Shown to customers on the booking summary.</FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="addon-image">Image URL</Label>
            <Input id="addon-image" {...register('image_url')} placeholder="https://…" aria-invalid={!!errors.image_url} />
            <FieldHint>Optional. Public image URL for the add-on card.</FieldHint>
            <FieldError message={errors.image_url?.message} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <div>
              <p className="text-sm font-medium">Active</p>
              <FieldHint>Inactive add-ons are hidden from customer checkout.</FieldHint>
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
          <CardTitle className="text-base">Pricing</CardTitle>
          <CardDescription>How this add-on is billed on the cart.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Pricing type</Label>
              <Controller
                name="pricing_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_day">Per day</SelectItem>
                      <SelectItem value="flat">Per booking (flat)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldHint>
                {watched.pricing_type === 'per_day'
                  ? 'Price is multiplied by rental days × quantity.'
                  : 'Fixed price for the whole booking × quantity.'}
              </FieldHint>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="addon-price">Price (₹)</Label>
              <Input id="addon-price" {...register('price')} inputMode="decimal" aria-invalid={!!errors.price} />
              <FieldError message={errors.price?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addon-max-qty">Max quantity per booking</Label>
              <Input id="addon-max-qty" {...register('max_quantity')} inputMode="numeric" aria-invalid={!!errors.max_quantity} />
              <FieldError message={errors.max_quantity?.message} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Availability</CardTitle>
          <CardDescription>Which caravan classes can purchase this add-on.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <div>
              <p className="text-sm font-medium">All caravan classes</p>
              <FieldHint>When enabled, every class can add this item. Otherwise pick specific classes.</FieldHint>
            </div>
            <Checkbox checked={allClasses} onCheckedChange={(v) => handleAllClassesChange(Boolean(v))} />
          </div>

          {!allClasses ? (
            <div className="space-y-2">
              <Label>Applicable classes</Label>
              <Popover>
                <PopoverTrigger render={<Button type="button" variant="outline" className="w-full justify-between" />}>
                  <span className="truncate text-left">
                    {selectedClasses.length === 0 ? 'Select classes…' : `${selectedClasses.length} selected`}
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
              <FieldError message={errors.applicable_classes?.message} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={pending} className="min-w-[8rem]">
          {pending ? 'Saving…' : mode === 'create' ? 'Create add-on' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
