'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { FleetSplitReveal } from '@/components/fleet/FleetSplitReveal';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import type { FleetExperienceTier } from '@/config/fleet-experience';
import { cn } from '@/lib/utils';

export function FleetEditorialBand({
  id,
  imageUrl,
  imageAlt,
  alignImage = 'left',
  eyebrow,
  headline,
  bodyParagraphs,
  href,
  linkLabel,
  tier,
}: {
  id?: string;
  imageUrl: string;
  imageAlt: string;
  alignImage?: 'left' | 'right';
  eyebrow: string;
  headline: string;
  bodyParagraphs: string[];
  href?: string;
  linkLabel?: string;
  tier: FleetExperienceTier;
}) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, tier === 'flagship' ? -(22 * (reduced ? 0 : 1)) : tier === 'family' ? -(10 * (reduced ? 0 : 1)) : -(16 * (reduced ? 0 : 1))]
  );

  const imageBlock = (
    <motion.div
      style={{ y }}
      className={cn(
        'relative isolate min-h-[48vw] overflow-hidden rounded-[2rem] ring-1 ring-[var(--color-line)] md:min-h-[320px] lg:min-h-[380px]'
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={imageAlt} className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-stitch-background/65 via-transparent to-stitch-primary-container/15" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-stitch-background/65 to-transparent" />
    </motion.div>
  );

  const copy = (
    <div className={cn('flex flex-col justify-center gap-8 py-10 md:py-14 lg:py-16', alignImage === 'right' ? '' : '')}>
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-8% 0px' }}
        transition={{ duration: 1.05, ease: luxuryEase }}
      >
        <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
          {eyebrow}
        </span>
        <FleetSplitReveal
          as="h2"
          text={headline}
          className="mt-5 max-w-xl text-balance font-headline text-3xl font-semibold leading-[1.08] tracking-[-0.028em] text-stitch-on-background md:text-4xl lg:text-[2.75rem]"
        />
        <div className="mt-8 space-y-5">
          {bodyParagraphs.map((p) => (
            <p key={p.slice(0, 24)} className="max-w-prose font-body text-base leading-relaxed text-stitch-on-surface-variant/88 md:text-lg">
              {p}
            </p>
          ))}
        </div>
        {href && linkLabel && (
          <Link
            href={href}
            className="mt-10 inline-flex items-center gap-2 font-headline text-[11px] font-semibold uppercase tracking-[0.22em] text-stitch-primary-container transition-[gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:gap-3"
          >
            {linkLabel}
            <span aria-hidden>→</span>
          </Link>
        )}
      </motion.div>
    </div>
  );

  return (
    <section ref={sectionRef} id={id} className="fleet-editorial-section scroll-mt-28">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div
          className={cn(
            'grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-20',
            alignImage === 'right' && 'md:[&>*:first-child]:order-2'
          )}
        >
          {imageBlock}
          {copy}
        </div>
      </div>
    </section>
  );
}
