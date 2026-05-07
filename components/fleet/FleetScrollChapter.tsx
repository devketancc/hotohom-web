'use client';

import { cn } from '@/lib/utils';
import { useFleetSectionSpy } from '@/components/fleet/useFleetSectionSpy';

export interface FleetChapter {
  id: string;
  label: string;
}

export function FleetScrollChapter({
  chapters,
  className,
}: {
  chapters: FleetChapter[];
  className?: string;
}) {
  const ids = chapters.map((c) => c.id);
  const activeId = useFleetSectionSpy(ids);

  return (
    <nav
      className={cn(
        'pointer-events-auto fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex lg:right-8',
        className
      )}
      aria-label="Section navigation"
    >
      {chapters.map((ch) => {
        const active = activeId === ch.id;
        return (
          <a
            key={ch.id}
            href={`#${ch.id}`}
            className="group flex items-center gap-3 outline-none"
            title={ch.label}
          >
            <span
              className={cn(
                'h-px w-6 origin-right transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                active ? 'w-10 bg-stitch-primary-container' : 'w-6 bg-white/20 group-hover:bg-white/40'
              )}
            />
            <span
              className={cn(
                'font-headline text-[9px] font-semibold uppercase tracking-[0.28em] transition-opacity duration-300',
                active ? 'text-stitch-primary-container' : 'text-white/35 opacity-0 group-hover:opacity-100'
              )}
            >
              {ch.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
