'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { MagneticButton } from '@/components/shared/MagneticButton';

/**
 * Cinematic fleet hero. Real MotoHom film plays behind a warm grade; the
 * background drifts on scroll (parallax) and collapses to a static poster under
 * reduced motion. Frames the four-tier idea without listing it (the ladder and
 * chapters below do that).
 */
export function FleetProgressionHero({ classCount = 4 }: { classCount?: number }) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLElement>(null);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  // Background drifts up + fades as the hero scrolls away.
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.45]);

  const countWord = classCount === 4 ? 'Four' : String(classCount);

  return (
    <section
      ref={ref}
      className="hero-grain relative isolate min-h-[100dvh] w-full overflow-hidden bg-surface-0"
    >
      {/* Background film + grade */}
      <motion.div
        className="absolute inset-0 z-0"
        style={reduced ? undefined : { y: bgY, scale: bgScale }}
      >
        {mounted && !reduced ? (
          <video
            aria-hidden
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            preload="metadata"
            poster="/exp-case/mh5.png"
            className="h-full w-full object-cover object-[55%_40%]"
          >
            <source src="/videos/hero-scene-3.mp4" type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="A MotoHom caravan resting at dusk"
            src="/exp-case/mh5.png"
            className="h-full w-full object-cover object-[55%_40%]"
          />
        )}
      </motion.div>

      {/* Cinematic grade: warm floor + readability scrim */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-surface-0 via-surface-0/45 to-surface-0/75" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_118%,rgba(229,185,92,0.16),transparent_58%)]" />
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1] bg-surface-0"
        style={reduced ? { opacity: 0.18 } : { opacity: veil }}
      />

      {/* Foreground */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-screen-2xl flex-col justify-end px-6 pb-16 pt-28 md:px-12 md:pb-20 md:pt-32">
        <motion.span
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: luxuryEase }}
          className="hero-eyebrow-rule label-mono text-gold"
        >
          The MotoHom Fleet
        </motion.span>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 22, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: luxuryEase, delay: 0.08 }}
          className="display-hero mt-6 max-w-[15ch] text-[clamp(2.75rem,8vw,7rem)] text-ink"
        >
          {countWord} classes.
          <br />
          <span className="text-gold">One rising standard.</span>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: luxuryEase, delay: 0.24 }}
          className="mt-7 max-w-xl font-body text-base leading-relaxed text-ink-muted md:text-lg"
        >
          From the most-booked Traveller to the by-invitation Viceroy, every
          class is a deliberate step up.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: luxuryEase, delay: 0.36 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton strength={0.3}>
            <Link
              href="#compare"
              className="group inline-flex items-center gap-3 rounded-full bg-gold px-7 py-3.5 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-ink shadow-glow-gold transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
            >
              Compare the classes
              <ArrowDown className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0.5" />
            </Link>
          </MagneticButton>
          <Link
            href="#class-T"
            className="inline-flex items-center gap-2 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-surface-0"
          >
            Start with the Traveller
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
