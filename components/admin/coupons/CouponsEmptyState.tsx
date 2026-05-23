import { TicketPercent } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CouponsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center shadow-inner">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        <TicketPercent className="size-7 text-primary" aria-hidden />
      </div>
      <h2 className="font-heading text-lg font-semibold text-foreground">No coupons yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create your first coupon to offer discounts on bookings, add-ons, or base rental.
      </p>
      <Button type="button" className="mt-6" onClick={onCreate}>
        Create coupon
      </Button>
    </div>
  );
}
