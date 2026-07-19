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
import { formatInr } from '@/utils/format';
import type { AdminRefundPayload } from '@/types/admin';

const CONFIRM_WORD = 'REFUND';

export function SettlementRefundDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultAmount,
  maxAmount,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Decimal string prefill, e.g. "500.00". */
  defaultAmount: string;
  /** Upper bound in rupees. */
  maxAmount: number;
  pending: boolean;
  onConfirm: (payload: AdminRefundPayload) => Promise<void>;
}) {
  const [amount, setAmount] = useState(defaultAmount);
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(defaultAmount);
      setReason('');
      setConfirmText('');
    }
  }, [open, defaultAmount]);

  const parsed = Number.parseFloat(amount);
  const amountValid = Number.isFinite(parsed) && parsed > 0 && parsed <= maxAmount;
  const reasonValid = reason.trim().length > 0;
  const confirmed = confirmText.trim() === CONFIRM_WORD;
  const canSubmit = amountValid && reasonValid && confirmed && !pending;

  const handleConfirm = async () => {
    if (!canSubmit) return;
    try {
      await onConfirm({ refund_amount: parsed.toFixed(2), refund_reason: reason.trim() });
      onOpenChange(false);
    } catch {
      // toast from mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="settlement-refund-amount">Refund amount (₹)</Label>
            <Input
              id="settlement-refund-amount"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={amount.length > 0 && !amountValid}
            />
            <p className="text-xs text-muted-foreground">Maximum ₹{formatInr(maxAmount)}.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="settlement-refund-reason">Reason for refund</Label>
            <Input
              id="settlement-refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. KM credit settlement"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settlement-refund-confirm">Type {CONFIRM_WORD} to confirm</Label>
            <Input
              id="settlement-refund-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              aria-invalid={confirmText.length > 0 && !confirmed}
            />
          </div>
        </div>
        <DialogFooter showCloseButton={false}>
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={!canSubmit} onClick={() => void handleConfirm()}>
            {pending ? 'Refunding…' : 'Refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
