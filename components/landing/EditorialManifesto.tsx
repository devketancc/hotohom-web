"use client"

import * as React from "react"
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react"
import { Reveal } from "@/components/shared/Reveal"
import { RevealStagger, RevealItem } from "@/components/shared/RevealStagger"

const MANIFESTO_PARAGRAPHS = [
  "Most travel companies sell access. We build around the moments that happen when you get there, when the road opens up and the world becomes still.",
  "The caravan is the medium, not the message. It is a private world that moves with you, a suite that wakes up somewhere new. What you carry is comfort; what you find is freedom.",
  "This is not convenience travel. This is intentional travel. The kind you return from different.",
]

export function EditorialManifesto() {
  const sectionRef = React.useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [48, -48])

  return (
    <section
      ref={sectionRef}
      className="section-ambient-warm relative overflow-hidden bg-surface-0 py-[clamp(6rem,12vw,14rem)]"
    >
      <div className="container-lux relative">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-[3fr_2fr] lg:gap-0">
          {/* Left - manifesto */}
          <div className="relative lg:pr-16">
            {/* Ghost number */}
            <span
              aria-hidden
              style={{ fontFamily: "var(--font-headline)" }}
              className="pointer-events-none absolute -left-2 -top-16 select-none text-[clamp(8rem,20vw,18rem)] font-light leading-none text-white/[0.025] md:-top-24"
            >
              01
            </span>

            <Reveal as="div" className="relative">
              <span className="font-headline text-[9px] uppercase tracking-[0.45em] text-gold">
                Our Philosophy
              </span>
              <h2
                style={{ fontFamily: "var(--font-headline)" }}
                className="mt-6 text-[clamp(2.75rem,5vw,5rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink"
              >
                The Experience is <span className="italic text-gold/90">the Product.</span>
              </h2>
            </Reveal>

            <RevealStagger className="mt-12 max-w-xl">
              {MANIFESTO_PARAGRAPHS.map((paragraph, index) => (
                <RevealItem key={index}>
                  {index > 0 && (
                    <hr className="my-8 border-t border-white/[0.06]" />
                  )}
                  <p className="font-body text-lg leading-relaxed text-ink-muted">
                    {paragraph}
                  </p>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>

          {/* Right - parallax image */}
          <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border-l border-gold/20 lg:min-h-0 lg:rounded-none lg:rounded-r-[2rem]">
            <motion.div
              style={{ y: imageY }}
              className="absolute inset-x-0 -top-[6%] h-[112%]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/exp-case/mh5.png"
                alt="A MotoHom caravan at rest in a quiet, considered landscape"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-surface-0/40 via-transparent to-gold/5" />
          </div>
        </div>
      </div>
    </section>
  )
}
