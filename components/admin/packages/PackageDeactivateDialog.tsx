'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AdminPackage } from '@/types/adminPackage';

export function PackageDeactivateDialog({
  pkg,
  open,
  onOpenChange,
  onConfirm,
  isDeactivating,
}: {
  pkg: AdminPackage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeactivating?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Deactivate package?</DialogTitle>
          <DialogDescription>
            {pkg ? (
              <>
                <span className="font-semibold text-foreground">{pkg.name}</span> will be hidden from the public
                packages list. Existing bookings are not affected.
              </>
            ) : (
              'This package will be hidden from customers.'
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton={false}>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeactivating}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={isDeactivating} onClick={onConfirm}>
            {isDeactivating ? 'Deactivating…' : 'Deactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
