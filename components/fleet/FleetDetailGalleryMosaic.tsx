'use client';

import { motion, useReducedMotion } from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';

/**
 * Asymmetric 5-tile gallery (3 + 2) inspired by luxury fleet marketing pages.
 * Pads with cycling URLs when fewer than five images exist.
 */
export function FleetDetailGalleryMosaic({
  id,
  eyebrow,
  title,
  images,
  imageBaseAlt,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  images: string[];
  imageBaseAlt: string;
}) {
  const reduced = useReducedMotion();
  if (images.length === 0) return null;

  const five: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    five.push(images[i % images.length]);
  }

  const cells: { url: string; idx: number; className: string }[] = [
    { url: five[0], idx: 0, className: 'md:col-span-4 md:row-span-1' },
    { url: five[1], idx: 1, className: 'md:col-span-4 md:row-span-1' },
    { url: five[2], idx: 2, className: 'md:col-span-4 md:row-span-1' },
    { url: five[3], idx: 3, className: 'md:col-span-7 md:row-span-1' },
    { url: five[4], idx: 4, className: 'md:col-span-5 md:row-span-1' },
  ];

  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-[var(--color-line)] bg-stitch-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <motion.header
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.85, ease: luxuryEase }}
          className="max-w-2xl"
        >
          <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
            {eyebrow}
          </span>
          <h2 className="mt-4 font-headline text-3xl font-semibold leading-[1.06] tracking-[-0.028em] text-stitch-on-background md:text-4xl">
            {title}
          </h2>
        </motion.header>

        <div className="mt-12 grid gap-4 md:grid-cols-12 md:grid-rows-2 md:gap-5">
          {cells.map(({ url, idx, className }) => (
            <motion.figure
              key={`mosaic-${idx}-${url.slice(-16)}`}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 0.85, ease: luxuryEase, delay: idx * 0.05 }}
              className={`group relative overflow-hidden rounded-[1.75rem] ring-1 ring-[var(--color-line)] shadow-luxury-sm ${className}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${imageBaseAlt} — gallery ${idx + 1}`}
                className="aspect-[16/11] h-full min-h-[200px] w-full object-cover transition-transform duration-[1.35s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] md:aspect-auto md:min-h-[220px]"
              />
              <figcaption className="sr-only">{`${imageBaseAlt} gallery frame ${idx + 1}`}</figcaption>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stitch-background/40 via-transparent to-transparent opacity-80" />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
