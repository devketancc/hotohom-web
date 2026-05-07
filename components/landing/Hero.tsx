"use client"

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { BookingControl } from './BookingControl'

export const Hero = () => {
  return (
    <section className="hero-grain hero-ambient-shift relative min-h-[100svh] w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Cinematic luxury caravan driving through scenic mountains at sunset"
          className="h-full w-full object-cover object-[60%_35%] scale-[1.05] transition-transform duration-[1400ms] ease-out"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXibFzxuZ03QkcW1_fZb8YjVJNoIXMg_C3O5AeV2QckYgDaEizJEa9Ky95eSAwbpC1NSpfvDpHFeQNPaVidtWzXOVZFBFxpteaDcsqELw9BomMGHTm6Lo6w3CzrS7m2g29i_K-yZc9J5qC_QGMUsZf8YTqnM5vVDTDvce07NGB8fYQUn4XWLdvSo_FLJXZ2vKazfTFCQaHVNEpGssm9eS2N_dw1GAGCYewYCuc5JTPHcwxzvXJjCAee5pbAZTq3EQG-Clizgt3EUM"
        />
        {/* Layered atmosphere */}
        <div className="hero-vignette absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_18%,rgba(255,208,120,0.2),transparent_54%)] opacity-80 blur-3xl" />
      </div>

      {/* Editorial 12-col grid */}
      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-screen-2xl grid-cols-12 gap-x-6 px-10 pb-20 pt-44 md:pt-52">
        {/* Top-right eyebrow */}
        <div className="col-span-12 md:col-start-9 md:col-span-4 flex items-start justify-end animate-in fade-in duration-1000">
          <div className="hero-eyebrow-rule font-headline text-[10px] font-medium uppercase tracking-[0.4em] text-stitch-primary-container/90">
            Est. 2024 — Curated Caravan Travel
          </div>
        </div>

        {/* Spacer pushes content toward lower portion for editorial weight */}
        <div className="col-span-12 grow" />

        {/* Headline block */}
        <div className="col-span-12 md:col-span-8 mt-auto pt-24 md:pt-32">
          <h1 className="font-headline font-semibold text-stitch-on-background leading-[0.95] tracking-[-0.04em] text-6xl md:text-8xl xl:text-[9.5rem] animate-in fade-in slide-in-from-bottom-3 duration-1000">
            <span className="block">The Road</span>
            <span className="block">
              Becomes <span className="font-light italic text-stitch-primary-container/95">Home</span>
            </span>
          </h1>

          <p className="mt-10 max-w-xl font-body text-base md:text-lg leading-relaxed text-stitch-on-surface-variant/80 animate-in fade-in slide-in-from-bottom-3 duration-1000 delay-150">
            Curated caravan journeys and immersive travel experiences designed for modern explorers.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-bottom-3 duration-1000 delay-300">
            <Link
              href="/journeys"
              className="group inline-flex items-center gap-3 rounded-full bg-stitch-primary-container px-8 py-4 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container shadow-[0_10px_30px_-15px_rgba(229,185,92,0.5)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-15px_rgba(229,185,92,0.65)] hover:brightness-105"
            >
              Explore Journeys
              <ArrowUpRight className="size-4 transition-transform duration-500 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/fleet"
              className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-8 py-4 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-background/90 transition-all duration-500 ease-out hover:border-white/30 hover:bg-white/[0.04] hover:text-stitch-on-background"
            >
              View Fleet
              <span
                aria-hidden
                className="inline-block transition-transform duration-500 ease-out group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Booking widget — integrated floating concierge panel */}
        <div className="col-span-12 lg:col-span-11 mt-14 md:mt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 motion-safe:hover:-translate-y-0.5 transition-transform">
          <BookingControl />
        </div>
      </div>
    </section>
  )
}
