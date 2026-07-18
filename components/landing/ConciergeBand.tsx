"use client"

import { motion, useReducedMotion } from "motion/react"
import { BookingControl } from "@/components/landing/BookingControl"

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function ConciergeBand() {
  const reduced = useReducedMotion()

  return (
    <section
      id="concierge"
      // No overflow-hidden here: the booking control's date + hub popovers open
      // upward (absolute bottom-full) and must escape the section bounds.
      // z-30 lifts this section above the hero's z-20 foreground (so the popovers
      // aren't painted behind it) while staying below the z-50 navbar.
      className="dawn-glow relative isolate z-30 border-y border-line bg-surface-0 py-[clamp(4rem,8vw,8rem)]"
    >
      <div className="mx-auto max-w-screen-2xl px-6 md:px-16">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 28 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: LUXURY_EASE }}
          className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_auto] lg:gap-16"
        >
          <div>
            <span className="label-mono text-gold">The Concierge</span>
            <h2 className="display-hero mt-5 text-[clamp(2.5rem,5.5vw,5.5rem)] text-ink">
              Where to?
            </h2>
            <p className="mt-5 max-w-md font-body text-base leading-relaxed text-ink-muted">
              Tell us where you start and when. We will shape the rest, from caravan to route to
              the quiet places only locals know.
            </p>
          </div>

          <div className="lg:pb-2">
            <div className="label-mono mb-4 text-ink-faint">Begin a journey</div>
            <div className="w-full lg:min-w-[34rem] xl:min-w-[40rem]">
              <BookingControl />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
