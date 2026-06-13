"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { Reveal } from "@/components/shared/Reveal"

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type Destination = {
  id: string
  name: string
  tagline: string
  image: string
  duration: string
  href: string
}

const DESTINATIONS: Destination[] = [
  {
    id: "goa",
    name: "Goa Coastal",
    tagline: "Salt air. Sunrise drives. The Arabian Sea on your left.",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600&auto=format&fit=crop",
    duration: "3-7 days",
    href: "/packages",
  },
  {
    id: "himalayan",
    name: "Himalayan Circuit",
    tagline: "Above the treeline. Below the stars.",
    image:
      "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=1200&auto=format&fit=crop",
    duration: "7-14 days",
    href: "/packages",
  },
  {
    id: "kerala",
    name: "Kerala Backwaters",
    tagline: "Slow roads through the greenest silence.",
    image:
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop",
    duration: "4-8 days",
    href: "/packages",
  },
]

function DestinationCard({
  destination,
  index,
  className,
}: {
  destination: Destination
  index: number
  className?: string
}) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { clipPath: "inset(0 0 100% 0)", opacity: 0 }}
      whileInView={
        reduced ? undefined : { clipPath: "inset(0 0 0% 0)", opacity: 1 }
      }
      viewport={{ once: true, margin: "-4% 0px" }}
      transition={{ duration: 1.2, ease: LUXURY_EASE, delay: index * 0.14 }}
      className={className}
    >
      <Link
        href={destination.href}
        className="group block h-full rounded-[2rem] bg-white/[0.02] p-1.5 ring-1 ring-white/[0.05] transition-shadow duration-500 hover:ring-gold/25"
      >
        {/* Inner core */}
        <div className="relative h-full overflow-hidden rounded-[calc(2rem-0.375rem)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={destination.image}
            alt={destination.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 md:p-9">
            <div className="min-w-0">
              <h3
                style={{ fontFamily: "var(--font-headline)" }}
                className="text-3xl font-light leading-tight text-white md:text-4xl"
              >
                {destination.name}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                {destination.tagline}
              </p>
              <span className="mt-4 inline-flex items-center rounded-full border border-white/15 px-3 py-1 font-headline text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
                {destination.duration}
              </span>
            </div>
            {/* Button-in-Button arrow */}
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-gold/40 group-hover:bg-gold group-hover:text-gold-ink">
              <ArrowUpRight className="size-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function DestinationsTeaser() {
  const [primary, ...secondary] = DESTINATIONS

  return (
    <section className="relative overflow-hidden bg-stitch-background py-[clamp(6rem,12vw,14rem)]">
      <div className="container-lux">
        <Reveal as="div" className="mb-14 max-w-2xl md:mb-20">
          <span className="font-headline text-[9px] uppercase tracking-[0.45em] text-gold">
            Where You Could Wake Up
          </span>
          <h2
            style={{ fontFamily: "var(--font-headline)" }}
            className="mt-6 text-[clamp(2.75rem,6vw,6rem)] font-light leading-[1.02] tracking-[-0.02em] text-ink"
          >
            Three coasts. <span className="italic text-gold/90">One open road.</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[3fr_2fr]">
          <DestinationCard
            destination={primary}
            index={0}
            className="min-h-[60vh] lg:min-h-[78vh]"
          />
          <div className="grid grid-cols-1 grid-rows-2 gap-3">
            {secondary.map((destination, i) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                index={i + 1}
                className="min-h-[36vh] lg:min-h-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
