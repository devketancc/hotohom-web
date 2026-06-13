'use client';

import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';

const BOOKING_STEPS = [
  { label: 'Fleet', paths: ['/select-caravan'] },
  { label: 'Journey', paths: ['/journey', '/journey/map'] },
  { label: 'Details', paths: ['/passenger'] },
  { label: 'Summary', paths: ['/booking/summary', '/summary'] },
  { label: 'Payment', paths: ['/booking/payment'] },
];

function matches(pathname: string | null, paths: string[]) {
  if (!pathname) return false;
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function BookingProgress() {
  const pathname = usePathname();
  const activeIndex = BOOKING_STEPS.findIndex((step) => matches(pathname, step.paths));

  // Hide on routes that are not part of the booking flow.
  if (activeIndex === -1) return null;

  return (
    <div className="border-b border-white/[0.04] bg-stitch-background/80">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-2 overflow-x-auto px-4 py-3 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {BOOKING_STEPS.map((step, index) => {
          const isComplete = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <div key={step.label} className="flex shrink-0 items-center gap-2">
              <span
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors duration-500',
                  isActive
                    ? 'border-stitch-primary/50 bg-white/[0.04] text-ink'
                    : isComplete
                      ? 'border-stitch-primary/30 bg-stitch-primary/10 text-stitch-primary-container'
                      : 'border-white/[0.06] bg-surface-2/60 text-ink-faint',
                ].join(' ')}
              >
                {isComplete ? (
                  <Check className="size-3" />
                ) : (
                  <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                )}
                {step.label}
              </span>
              {index < BOOKING_STEPS.length - 1 && (
                <span
                  className={[
                    'h-px w-5 transition-colors duration-500 md:w-8',
                    index < activeIndex ? 'bg-stitch-primary/40' : 'bg-white/[0.08]',
                  ].join(' ')}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
