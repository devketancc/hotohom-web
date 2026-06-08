'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PackagesHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 -mx-4 mb-6 border-b border-border/60 bg-background/90 px-4 py-4 backdrop-blur-md supports-backdrop-filter:bg-background/75 sm:-mx-6 sm:px-6',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Packages
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Curated tour packages with day-by-day itineraries, stays, and route templates for customers to book.
          </p>
        </div>
        <Link
          href="/admin/packages/new"
          className={cn(buttonVariants({ size: 'default' }), 'shrink-0 gap-1.5 shadow-sm')}
        >
          <Plus className="size-4" aria-hidden />
          New package
        </Link>
      </div>
    </header>
  );
}
