import { PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AddonsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center shadow-inner">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        <PackagePlus className="size-7 text-primary" aria-hidden />
      </div>
      <h2 className="font-heading text-lg font-semibold text-foreground">No add-ons in this view</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create an add-on to offer optional extras at checkout, with per-day or flat pricing.
      </p>
      <Button type="button" className="mt-6" onClick={onCreate}>
        Create add-on
      </Button>
    </div>
  );
}
