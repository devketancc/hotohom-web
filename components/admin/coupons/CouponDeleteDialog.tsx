'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminCoupon } from '@/types/coupon';

export function CouponDeleteDialog({
  coupon,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  coupon: AdminCoupon | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (open) setConfirmText('');
  }, [open, coupon?.id]);

  const code = coupon?.code ?? '';
  const matches = confirmText.trim().toUpperCase() === code.toUpperCase() && code.length > 0;

  const handleClose = (next: boolean) => {
    if (!next) setConfirmText('');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Delete coupon</DialogTitle>
          <DialogDescription>
            This cannot be undone. Existing bookings that already captured this coupon are unaffected, but the code
            will stop working for new checkouts.
          </DialogDescription>
        </DialogHeader>
        {coupon ? (
          <div className="space-y-3 py-2">
            <p className="rounded-lg bg-muted/50 px-3 py-2 font-mono text-sm font-semibold text-foreground ring-1 ring-border/60">
              {coupon.code}
            </p>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Type the code to confirm</Label>
              <Input
                id="delete-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={coupon.code}
                className="font-mono uppercase"
                autoComplete="off"
                aria-invalid={confirmText.length > 0 && !matches}
              />
            </div>
          </div>
        ) : null}
        <DialogFooter showCloseButton={false}>
          <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={!matches || isDeleting} onClick={onConfirm}>
            {isDeleting ? 'Deleting…' : 'Delete coupon'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
