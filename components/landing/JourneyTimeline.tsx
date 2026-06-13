"use client"

import { motion, useReducedMotion } from 'motion/react'
import { Reveal } from '@/components/shared/Reveal'

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const STEPS = [
  {
    id: 1,
    title: "Choose When & Where",
    description:
      "Select your travel window and pick one of our strategically located hubs nationwide.",
  },
  {
    id: 2,
    title: "Plan Your Journey",
    description:
      "Use our digital concierge to curate stops, campsites, and local activities tailored to your pace.",
  },
  {
    id: 3,
    title: "Travel & Enjoy",
    description:
      "Pick up your premium caravan and hit the road with 24/7 support and unlimited freedom.",
  },
]

export const JourneyTimeline = () => {
  const reduced = useReducedMotion()

  return (
    <section className="section-ambient-cool relative overflow-hidden border-y border-white/5 bg-zinc-900 py-[clamp(6rem,12vw,14rem)]">
      <div className="container-lux relative z-10">
        <Reveal as="div" className="mb-16 max-w-3xl md:mb-24">
          <h2
            style={{ fontFamily: 'var(--font-headline)' }}
            className="text-[clamp(3rem,7vw,7rem)] font-light leading-[1.02] tracking-[-0.02em] text-ink"
          >
            Three decisions.
            <br />
            <span className="inline-block pb-2 italic text-gold/90">
              One unforgettable journey.
            </span>
          </h2>
        </Reveal>

        <div>
          {STEPS.map((step, index) => (
            <div key={step.id}>
              {index > 0 && <hr className="border-t border-white/[0.04]" />}
              <motion.article
                initial={reduced ? false : { opacity: 0, y: 32 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5% 0px' }}
                transition={{
                  duration: 0.9,
                  ease: LUXURY_EASE,
                  delay: index * 0.12,
                }}
                className="grid grid-cols-[clamp(3.5rem,7vw,6.5rem)_1fr] items-start gap-8 py-12 md:gap-16 md:py-16 lg:gap-24"
              >
                <span
                  aria-hidden
                  style={{ fontFamily: 'var(--font-headline)' }}
                  className="-mt-3 select-none text-[clamp(4.5rem,10vw,9rem)] font-light leading-none text-white/[0.06]"
                >
                  {step.id.toString().padStart(2, '0')}
                </span>

                <div className="pt-2">
                  <motion.div
                    className="mb-7 h-px w-12 bg-gold"
                    style={{ transformOrigin: 'left center' }}
                    initial={reduced ? false : { scaleX: 0 }}
                    whileInView={reduced ? undefined : { scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.7,
                      ease: LUXURY_EASE,
                      delay: index * 0.12 + 0.2,
                    }}
                  />
                  <h3 className="mb-4 font-headline text-2xl font-semibold tracking-[-0.02em] text-ink md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="max-w-md font-body text-base leading-relaxed text-ink-muted md:text-lg">
                    {step.description}
                  </p>
                </div>
              </motion.article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
