"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Reveal } from "@/components/shared/Reveal"

// Wordmark placeholders — swap with official SVG logo assets when available.
const PARTNERS = [
  { name: "MTDC", sub: "Maharashtra Tourism" },
  { name: "Uber", sub: "for Business" },
  { name: "MakeMyTrip", sub: "" },
  { name: "MMT", sub: "Corporate" },
]

export function Partners() {
  return (
    <section className="border-t border-white/[0.06] bg-surface-0 py-[clamp(4rem,7vw,7rem)]">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-10 px-5 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:px-8">
        <Reveal as="div">
          <span className="label-mono text-gold">Trusted By</span>
          <h2
            style={{ fontFamily: "var(--font-headline)" }}
            className="mt-4 text-[clamp(1.875rem,3.4vw,2.75rem)] font-light leading-[1.08] tracking-[-0.01em] text-ink"
          >
            Leaders who travel with us.
          </h2>
          <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-ink-muted">
            Building meaningful journeys for teams and travellers across India.
          </p>
          <Link
            href="/about"
            className="group mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-soft"
          >
            See all partners
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="flex h-24 flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-center transition-colors duration-500 hover:border-white/12"
            >
              <span className="font-heading text-lg font-semibold tracking-tight text-ink/90">
                {p.name}
              </span>
              {p.sub && (
                <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                  {p.sub}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
