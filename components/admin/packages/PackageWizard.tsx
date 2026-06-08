'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { PackageWizardReview } from '@/components/admin/packages/PackageWizardReview';
import { PackageWizardSteps } from '@/components/admin/packages/PackageWizardSteps';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { applyDrfErrorsToForm, extractDrfFieldErrors } from '@/lib/coupons/drfErrors';
import { handleApiError } from '@/lib/errorHandler';
import {
  adminPackageToFormValues,
  clearPackageDraft,
  defaultPackageFormValues,
  loadPackageDraft,
  PACKAGE_WIZARD_STEPS,
  packageFormValuesToPayload,
  packageWizardSchema,
  savePackageDraft,
  type PackageWizardFormValues,
  type PackageWizardStepId,
} from '@/lib/packages/schema';
import { adminQueryKeys, listAdminCaravanClasses, listAdminHubs } from '@/services/admin.service';
import { getAdminPackage, packageAdminQueryKeys } from '@/services/packageAdmin.service';
import { usePackageMutations } from '@/hooks/usePackageMutations';
export function PackageWizard({ mode, packageId }: { mode: 'create' | 'edit'; packageId?: string }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const { createMutation, updateMutation } = usePackageMutations();

  const detailQuery = useQuery({
    queryKey: packageAdminQueryKeys.detail(packageId ?? ''),
    queryFn: () => getAdminPackage(packageId!),
    enabled: mode === 'edit' && Boolean(packageId),
  });

  const { data: hubs = [] } = useQuery({
    queryKey: adminQueryKeys.hubs,
    queryFn: listAdminHubs,
    staleTime: 600_000,
  });

  const { data: classes = [] } = useQuery({
    queryKey: adminQueryKeys.caravanClasses,
    queryFn: listAdminCaravanClasses,
    staleTime: 600_000,
  });

  const defaultValues = useMemo(() => {
    if (mode === 'edit' && detailQuery.data) return adminPackageToFormValues(detailQuery.data);
    const draft = mode === 'create' ? loadPackageDraft() : null;
    return draft ?? defaultPackageFormValues();
  }, [mode, detailQuery.data]);

  const form = useForm<PackageWizardFormValues>({
    resolver: zodResolver(packageWizardSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setError,
    clearErrors,
    reset,
    watch,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (mode === 'edit' && detailQuery.data) {
      reset(adminPackageToFormValues(detailQuery.data));
    }
  }, [mode, detailQuery.data, reset]);

  useEffect(() => {
    if (mode !== 'create') return;
    const draft = loadPackageDraft();
    if (draft && window.confirm('Restore unsaved package draft?')) {
      reset(draft);
    }
  }, [mode, reset]);

  const step = PACKAGE_WIZARD_STEPS[stepIndex]!;
  const stepId = step.id as PackageWizardStepId;
  const isReview = stepId === 'review';
  const isLast = stepIndex === PACKAGE_WIZARD_STEPS.length - 1;

  const hubName = hubs.find((h) => h.id === watch('home_hub'))?.name;
  const classRow = classes.find((c) => c.id === watch('caravan_class'));
  const classLabel = classRow ? `${classRow.code} — ${classRow.name}` : undefined;

  const goNext = async () => {
    if (isReview) return;
    const fields = [...step.fields] as (keyof PackageWizardFormValues)[];
    const ok = fields.length === 0 || (await trigger(fields));
    if (!ok) return;
    setStepIndex((i) => Math.min(i + 1, PACKAGE_WIZARD_STEPS.length - 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();
    const payload = packageFormValuesToPayload(values);
    try {
      if (mode === 'create') {
        const created = await createMutation.mutateAsync(payload);
        clearPackageDraft();
        toast.success('Package created');
        router.push(`/admin/packages/${created.id}/edit`);
      } else if (packageId) {
        await updateMutation.mutateAsync({ id: packageId, payload });
        clearPackageDraft();
        router.push('/admin/packages');
      }
    } catch (err) {
      const fieldErrors = extractDrfFieldErrors(err);
      if (fieldErrors) {
        applyDrfErrorsToForm(fieldErrors, setError);
        toast.error('Please fix the highlighted fields.');
      } else {
        handleApiError(err);
      }
    }
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  if (mode === 'edit' && detailQuery.isPending) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (mode === 'edit' && detailQuery.isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-muted-foreground mb-4">Package not found.</p>
        <Link href="/admin/packages" className={buttonVariants({ variant: 'outline' })}>
          Back to packages
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/packages"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1 -ml-2 mb-4 inline-flex')}
        >
          <ArrowLeft className="size-4" />
          Packages
        </Link>
        <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          {mode === 'create' ? 'Create package' : `Edit ${detailQuery.data?.name ?? 'package'}`}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Step {stepIndex + 1} of {PACKAGE_WIZARD_STEPS.length}: {step.title}
        </p>
      </div>

      <nav aria-label="Progress" className="mb-8 flex flex-wrap gap-2">
        {PACKAGE_WIZARD_STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => i < stepIndex && setStepIndex(i)}
            disabled={i > stepIndex}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              i === stepIndex
                ? 'bg-primary text-primary-foreground'
                : i < stepIndex
                  ? 'bg-muted text-foreground hover:bg-muted/80 cursor-pointer'
                  : 'bg-muted/40 text-muted-foreground cursor-not-allowed'
            )}
          >
            {i < stepIndex ? <Check className="inline size-3 mr-0.5" aria-hidden /> : null}
            {s.title}
          </button>
        ))}
      </nav>

      {errors.root?.message ? (
        <p className="mb-4 text-sm text-destructive">{errors.root.message}</p>
      ) : null}

      <form onSubmit={onSubmit}>
        {isReview ? (
          <PackageWizardReview
            watch={watch}
            mode={mode}
            packageId={packageId}
            hubName={hubName}
            classLabel={classLabel}
          />
        ) : (
          <PackageWizardSteps
            stepId={stepId}
            register={register}
            control={control}
            errors={errors}
            setValue={form.setValue}
          />
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-6">
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={stepIndex === 0} onClick={goBack}>
              <ChevronLeft className="size-4 mr-1" aria-hidden />
              Back
            </Button>
            {mode === 'create' && !isReview && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  savePackageDraft(watch());
                  toast.message('Draft saved for this session');
                }}
              >
                Save draft
              </Button>
            )}
          </div>
          {isLast ? (
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : mode === 'create' ? (
                'Create package'
              ) : (
                'Save changes'
              )}
            </Button>
          ) : (
            <Button type="button" onClick={goNext}>
              Next
              <ChevronRight className="size-4 ml-1" aria-hidden />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
