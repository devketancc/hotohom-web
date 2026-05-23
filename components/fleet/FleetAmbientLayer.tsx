'use client';

import { cn } from '@/lib/utils';
import type { FleetExperienceTier } from '@/config/fleet-experience';

export type FleetAmbientTone = 'warm' | 'cool' | 'champagne';

const toneSurfaces: Record<FleetAmbientTone, string> = {
  warm: 'fleet-glow-warm',
  cool: 'fleet-glow-cool',
  champagne: 'fleet-glow-champagne',
};

export function FleetAmbientLayer({
  tone,
  tier,
  className,
}: {
  tone: FleetAmbientTone;
  tier: FleetExperienceTier;
  /** Optional extra wrappers */
  className?: string;
}) {
  const intensity =
    tier === 'flagship' ? 'opacity-[0.55]' : tier === 'family' ? 'opacity-[0.4]' : 'opacity-[0.45]';

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 -z-[1]', toneSurfaces[tone], intensity, className)}
      aria-hidden
    />
  );
}
