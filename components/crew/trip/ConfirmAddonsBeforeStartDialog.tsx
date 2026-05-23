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
import { CrewAddonsCarryList } from '@/components/crew/trip/CrewAddonsCarryList';
import type { BookingItem } from '@/types/bookingDetail';

export function ConfirmAddonsBeforeStartDialog({
  open,
  onOpenChange,
  items,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BookingItem[];
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left">DID you took all the addons with you?</DialogTitle>
          <DialogDescription className="text-left">
            Confirm you have everything below before starting the trip.
          </DialogDescription>
        </DialogHeader>

        <CrewAddonsCarryList items={items} compact />

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Not yet
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Yes, I have them all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
