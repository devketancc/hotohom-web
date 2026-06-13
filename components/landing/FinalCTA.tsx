"use client"

import * as React from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/shared/Reveal'
import { MagneticButton } from '@/components/shared/MagneticButton'

const FINAL_CTA_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBGvK9qkpcWpYop4hVYNUzOzR3zKGRzVnA17MeyW1YQhmAn5QYEvklWWhVyBoXldDspoU8WUgQf9ICzh3I_x6waP1wS4qjXQ7qeS5ID8FU8DhuKxbEWXI1fmG7YRAif16-mHMUCPXsA_cLjLDyaKJlp1kuSk5OddQW8CWFmN48XiqfSGoVZdi5eNud0QiGY6z6s3uspIZQJUwJSPGCZVuFTSo4jVk0JEbCHKimh6dtfswEibqoUt6qFxjOqMbMrgj1aMpi4ZbKXFs'

export const FinalCTA = () => {
  const sectionRef = React.useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-8%', '8%'])

  return (
    <section
      ref={sectionRef}
      className="section-grain-soft relative overflow-hidden py-[clamp(6rem,14vw,16rem)]"
    >
      <motion.div style={{ y: imageY }} className="absolute inset-0 z-0 scale-[1.12]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="A caravan resting under a star-filled night sky"
          className="h-full w-full object-cover"
          src={FINAL_CTA_IMAGE}
        />
      </motion.div>
      {/* Let the image breathe */}
      <div className="absolute inset-0 z-[1] bg-black/50" />
      {/* Page blending top and bottom */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-stitch-background via-stitch-background/30 to-stitch-background/40" />

      <div className="relative z-10 mx-auto max-w-5xl px-8 text-center">
        <Reveal
          as="h2"
          duration={1.0}
          className="mb-10 leading-[1.02] tracking-[-0.02em] text-ink"
        >
          <span
            style={{ fontFamily: 'var(--font-headline)' }}
            className="block text-[clamp(3rem,8vw,7.5rem)] font-light"
          >
            Your next adventure
          </span>
          <span
            style={{ fontFamily: 'var(--font-headline)' }}
            className="block pb-2 text-[clamp(3rem,8vw,7.5rem)] font-light italic text-stitch-primary-container"
          >
            starts here.
          </span>
        </Reveal>

        <Reveal
          as="p"
          delay={0.12}
          duration={0.95}
          className="mx-auto mb-16 max-w-2xl font-body text-lg leading-relaxed text-stitch-on-surface-variant/90 md:text-xl"
        >
          Join a global community of modern nomads. Rediscover the freedom of the road with Motohom&apos;s premium caravan experiences.
        </Reveal>

        <Reveal
          as="div"
          delay={0.24}
          duration={0.95}
          className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-8"
        >
          <MagneticButton strength={0.3}>
            <Link
              href="/select-caravan"
              className="gradient-cta group inline-flex items-center gap-2 rounded-full py-5 pl-8 pr-5 font-headline text-sm font-semibold uppercase tracking-[0.15em] text-stitch-on-primary-container shadow-[0_18px_50px_-18px_rgba(229,185,92,0.6)] transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06]"
            >
              Start Your Journey
              <span className="flex size-7 items-center justify-center rounded-full bg-gold-ink/25">
                <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </MagneticButton>

          <Link
            href="/fleet"
            className="inline-flex items-center rounded-full border border-stitch-primary/40 px-9 py-5 font-headline text-sm font-semibold uppercase tracking-[0.15em] text-stitch-primary transition-[transform,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-stitch-primary hover:bg-stitch-primary/5"
          >
            View Fleet
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
