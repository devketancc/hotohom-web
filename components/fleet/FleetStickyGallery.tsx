'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';

export function FleetStickyGallery({
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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);

  const onScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) {
      setProgress(1);
      return;
    }
    setProgress(el.scrollLeft / max);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll, images.length]);

  if (images.length === 0) return null;

  return (
    <section
      id={id}
      className="fleet-gallery-section section-ambient-warm scroll-mt-28 border-t border-[var(--color-line)] bg-stitch-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="md:grid md:grid-cols-[minmax(0,220px)_1fr] md:items-start md:gap-12 lg:gap-16">
          <div className="md:sticky md:top-32 md:self-start">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 18 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1.05, ease: luxuryEase }}
            >
              <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
                {eyebrow}
              </span>
              <h2 className="mt-5 max-w-[14ch] text-balance font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
                {title}
              </h2>
              <div className="mt-8 hidden h-px w-full max-w-[120px] bg-gradient-to-r from-stitch-primary-container/50 to-transparent md:block" />
              <div className="mt-6 hidden md:block">
                <div className="h-0.5 w-full max-w-[180px] overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-stitch-primary-container/80"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                    layout
                  />
                </div>
                <p className="mt-2 font-headline text-[9px] font-semibold uppercase tracking-[0.28em] text-white/35">
                  Scroll gallery
                </p>
              </div>
            </motion.div>
          </div>

          <div
            ref={scrollRef}
            className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.12)_transparent] md:mt-0 md:gap-7"
          >
            {images.map((url, idx) => (
              <motion.div
                key={`gallery-slide-${idx}-${url.slice(-12)}`}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5% 0px' }}
                transition={{ duration: 1, ease: luxuryEase, delay: idx * 0.04 }}
                className="group relative aspect-[4/5] w-[82vw] flex-shrink-0 snap-start overflow-hidden rounded-[2rem] ring-1 ring-[var(--color-line)] shadow-luxury-sm transition-shadow duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-luxury-lg sm:w-[58vw] md:w-[42vw] lg:w-[34vw]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${imageBaseAlt} — ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stitch-background/45 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-br from-stitch-primary-container/12 to-transparent" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
