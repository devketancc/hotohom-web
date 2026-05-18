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
import type { AdminAddon } from '@/types/adminAddon';

export function AddonDeleteDialog({
  addon,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  addon: AdminAddon | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (open) setConfirmText('');
  }, [open, addon?.id]);

  const name = addon?.name ?? '';
  const matches = confirmText.trim() === name && name.length > 0;

  const handleClose = (next: boolean) => {
    if (!next) setConfirmText('');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Delete add-on</DialogTitle>
          <DialogDescription>
            This cannot be undone. The add-on will be removed from the catalog and will no longer appear at checkout.
            Existing bookings with this add-on are unaffected.
          </DialogDescription>
        </DialogHeader>
        {addon ? (
          <div className="space-y-3 py-2">
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm font-semibold text-foreground ring-1 ring-border/60">
              {addon.name}
            </p>
            <div className="space-y-2">
              <Label htmlFor="delete-addon-confirm">Type the add-on name to confirm</Label>
              <Input
                id="delete-addon-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={addon.name}
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
            {isDeleting ? 'Deleting…' : 'Delete add-on'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
