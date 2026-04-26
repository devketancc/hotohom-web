import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CouponsHeader({
  onCreate,
  className,
}: {
  onCreate: () => void;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 -mx-4 mb-6 border-b border-border/60 bg-background/90 px-4 py-4 backdrop-blur-md supports-backdrop-filter:bg-background/75 sm:-mx-6 sm:px-6',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">Coupons</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage discount codes, eligibility rules, and usage caps. Create and assign personal or public coupons.
          </p>
        </div>
        <Button type="button" onClick={onCreate} className="shrink-0 gap-1.5 shadow-sm">
          <Plus className="size-4" aria-hidden />
          New coupon
        </Button>
      </div>
    </header>
  );
}
