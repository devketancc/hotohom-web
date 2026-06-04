'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/shared/Reveal';
import type { TravelPackage } from '@/types/package';

type PackageHighlightsProps = {
  highlights: TravelPackage['highlights'];
  className?: string;
};

export function PackageHighlights({ highlights, className }: PackageHighlightsProps) {
  const items = (highlights ?? []).filter((h) => typeof h === 'string' && h.trim());
  if (items.length === 0) return null;

  return (
    <Reveal as="section" className={cn(className)}>
      <h2 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stitch-primary font-headline">
        <Sparkles className="size-4" aria-hidden />
        Trip highlights
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((text, i) => (
          <li
            key={`${text}-${i}`}
            className="glass-card rounded-xl border border-stitch-primary/15 bg-stitch-primary/5 px-4 py-3 text-sm font-medium text-stitch-on-background font-body"
          >
            {text}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
