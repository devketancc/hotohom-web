import Link from 'next/link';
import { MapPinned, Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PackagesEmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
      <MapPinned className="mb-4 size-10 text-muted-foreground/60" aria-hidden />
      <h3 className="font-heading text-lg font-semibold text-foreground">No packages yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create curated tour packages with itineraries and route stops for customers to discover and book.
      </p>
      <Link
        href="/admin/packages/new"
        className={cn(buttonVariants(), 'mt-6 gap-1.5')}
        onClick={onCreate}
      >
        <Plus className="size-4" aria-hidden />
        New package
      </Link>
    </div>
  );
}
