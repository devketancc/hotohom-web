'use client';

import type { UseMutationResult } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CouponForm } from '@/components/admin/coupons/CouponForm';
import { cn } from '@/lib/utils';
import type { AdminCoupon, AdminCouponWritePayload } from '@/types/coupon';

export function CouponFormSheet({
  open,
  onOpenChange,
  mode,
  coupon,
  createMutation,
  updateMutation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  coupon: AdminCoupon | null;
  createMutation: UseMutationResult<AdminCoupon, Error, AdminCouponWritePayload>;
  updateMutation: UseMutationResult<
    AdminCoupon,
    Error,
    { id: string; payload: Partial<AdminCouponWritePayload> }
  >;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className={cn(
          'w-full gap-0 overflow-y-auto border-l border-border bg-popover p-0 sm:max-w-xl md:max-w-2xl',
          'data-[side=right]:sm:max-w-xl'
        )}
      >
        <SheetHeader className="border-b border-border/80 bg-muted/20 px-5 py-4">
          <SheetTitle className="font-heading text-lg">
            {mode === 'create' ? 'Create coupon' : `Edit ${coupon?.code ?? 'coupon'}`}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Define how the discount works, who can use it, and when it expires.'
              : 'Update rules and limits. Changes apply to new checkouts immediately.'}
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 py-4">
          <CouponForm
            mode={mode}
            couponId={coupon?.id}
            coupon={coupon}
            createMutation={createMutation}
            updateMutation={updateMutation}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
