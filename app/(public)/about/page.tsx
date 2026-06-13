"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/landing/Footer"
import { TrustRail } from "@/components/landing/TrustRail"
import { DestinationsTeaser } from "@/components/landing/DestinationsTeaser"
import { Reveal } from "@/components/shared/Reveal"
import { RevealStagger, RevealItem } from "@/components/shared/RevealStagger"
import { MagneticButton } from "@/components/shared/MagneticButton"

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const PHILOSOPHY = [
  {
    title: "The Road as Home",
    body: "A caravan is not a vehicle you borrow. It is a private world that travels with you, wakes where you wake, and asks nothing of the place you left behind.",
  },
  {
    title: "Freedom with Craft",
    body: "Spontaneity works best when everything beneath it is considered. Hand-finished interiors, concierge routing, and quiet engineering let you improvise without compromise.",
  },
  {
    title: "The Quiet Luxury of Motion",
    body: "True luxury is not noise. It is the calm of a morning you did not plan, a coastline you did not expect, and a home that simply kept up.",
  },
]

const FLEET_TEASER = [
  { code: "T", name: "Traveller", note: "The agile two-berth for the spontaneous escape." },
  { code: "U", name: "Urbania", note: "City-poised comfort that unfolds into the wild." },
  { code: "M", name: "Monarch", note: "Family-scale layouts that flex with the people you love." },
  { code: "V", name: "Viceroy", note: "The flagship suite. Off-grid, uncompromised." },
]

export default function AboutPage() {
  const reduced = useReducedMotion()

  return (
    <main className="min-h-screen bg-stitch-background text-stitch-on-background">
      <Navbar />

      {/* 1. Hero */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/exp-case/mh1.png"
            alt="A MotoHom caravan in an open landscape at golden hour"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stitch-background via-stitch-background/40 to-black/30" />
        </div>

        <div className="container-lux relative z-10 pb-20 md:pb-28">
          <motion.div
            initial={reduced ? false : { opacity: 0, filter: "blur(16px)", y: 24 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.2, ease: LUXURY_EASE }}
          >
            <span className="font-headline text-[9px] uppercase tracking-[0.45em] text-gold">
              Our Story
            </span>
            <h1
              style={{ fontFamily: "var(--font-headline)" }}
              className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,6rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink"
            >
              We believe travel should feel different from the moment you begin.
            </h1>
            <div className="mt-10 h-px w-24 bg-gold" />
          </motion.div>
        </div>
      </section>

      {/* 2. Philosophy - hairline grid */}
      <section className="bg-surface-0 py-[clamp(5rem,10vw,11rem)]">
        <div className="container-lux">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[2rem] bg-white/[0.05] md:grid-cols-3">
            {PHILOSOPHY.map((item) => (
              <div key={item.title} className="bg-surface-0 p-10 md:p-14">
                <h2
                  style={{ fontFamily: "var(--font-headline)" }}
                  className="text-2xl font-light leading-tight text-ink md:text-3xl"
                >
                  {item.title}
                </h2>
                <p className="mt-6 font-body text-base leading-relaxed text-ink-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Story - asymmetric split */}
      <section className="bg-stitch-background py-[clamp(5rem,10vw,11rem)]">
        <div className="container-lux">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[2fr_3fr] lg:gap-20">
            {/* Image - Double-Bezel */}
            <Reveal as="div" className="rounded-[2rem] bg-white/[0.02] p-1.5 ring-1 ring-white/[0.05]">
              <div className="overflow-hidden rounded-[calc(2rem-0.375rem)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/exp-case/mh3.png"
                  alt="The MotoHom interior, finished like a private suite"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>

            <Reveal as="div" delay={0.1}>
              <h2
                style={{ fontFamily: "var(--font-headline)" }}
                className="text-[clamp(2.25rem,4.5vw,4rem)] font-light leading-[1.08] tracking-[-0.02em] text-ink"
              >
                We started with a simple frustration.
              </h2>
              <div className="mt-8 space-y-6 font-body text-base leading-relaxed text-ink-muted md:text-lg">
                <p>
                  Modern travel had become a logistics exercise. Airports, transfers, check-in
                  windows, and the slow erosion of the feeling that drew us out in the first place.
                </p>
                <p>
                  MotoHom is our answer. Not a caravan you rent, but an experience you step into.
                  We obsess over the parts most people never see, so the parts you do see feel
                  effortless.
                </p>
                <p className="text-ink">
                  We are not a marketplace. We are not an aggregator. We are a single, considered
                  way to move through the world.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. Fleet teaser - horizontal scroll-snap */}
      <section className="border-y border-white/[0.04] bg-surface-0 py-[clamp(5rem,10vw,11rem)]">
        <div className="container-lux">
          <Reveal as="div" className="mb-12 max-w-2xl">
            <h2
              style={{ fontFamily: "var(--font-headline)" }}
              className="text-[clamp(2.25rem,4.5vw,4rem)] font-light leading-[1.08] tracking-[-0.02em] text-ink"
            >
              Four silhouettes. <span className="italic text-gold/85">Four ways to travel.</span>
            </h2>
          </Reveal>
        </div>

        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden">
          {FLEET_TEASER.map((cls) => (
            <div
              key={cls.code}
              className="group relative min-w-[280px] shrink-0 snap-start overflow-hidden rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-9 transition-colors duration-500 hover:border-gold/25 md:min-w-[340px]"
            >
              <span
                style={{ fontFamily: "var(--font-headline)" }}
                className="text-6xl font-light text-white/[0.08]"
              >
                {cls.code}
              </span>
              <h3 className="mt-6 font-headline text-2xl font-semibold tracking-tight text-ink">
                {cls.name}
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted">{cls.note}</p>
            </div>
          ))}
          <Link
            href="/fleet"
            className="group flex min-w-[220px] shrink-0 snap-start items-center justify-center rounded-[2rem] border border-gold/20 bg-gold/[0.04] p-9 text-center transition-colors duration-500 hover:bg-gold/[0.08]"
          >
            <span className="font-headline text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              Explore all four
              <ArrowUpRight className="ml-2 inline size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* 5. Numbers */}
      <TrustRail />

      {/* 6. Destinations */}
      <DestinationsTeaser />

      {/* 7. Final CTA */}
      <section className="relative overflow-hidden bg-surface-0 py-[clamp(6rem,12vw,14rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(229,185,92,0.08),transparent_60%)]" />
        <div className="container-lux relative text-center">
          <Reveal as="h2" duration={1.0}>
            <span
              style={{ fontFamily: "var(--font-headline)" }}
              className="block text-[clamp(2.75rem,7vw,6.5rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink"
            >
              The road is ready.
            </span>
            <span
              style={{ fontFamily: "var(--font-headline)" }}
              className="block pb-2 text-[clamp(2.75rem,7vw,6.5rem)] font-light italic text-gold/90"
            >
              Are you?
            </span>
          </Reveal>
          <Reveal as="div" delay={0.18} className="mt-12 flex justify-center">
            <MagneticButton strength={0.3}>
              <Link
                href="/select-caravan"
                className="gradient-cta group inline-flex items-center gap-2 rounded-full py-5 pl-8 pr-5 font-headline text-sm font-semibold uppercase tracking-[0.15em] text-stitch-on-primary-container shadow-[0_18px_50px_-18px_rgba(229,185,92,0.6)] transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06]"
              >
                Start Your Journey
                <span className="flex size-7 items-center justify-center rounded-full bg-gold-ink/25">
                  <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  )
}
