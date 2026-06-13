"use client"

import { Compass, Sparkles, MapPin, Leaf } from "lucide-react"
import { Reveal } from "@/components/shared/Reveal"

const REASONS = [
  {
    icon: Compass,
    title: "End-to-End Planning",
    note: "We plan every detail, so you simply travel.",
  },
  {
    icon: Sparkles,
    title: "Premium Comfort",
    note: "Hotel-grade living that moves with you.",
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    note: "Hidden gems and real stories from the road.",
  },
  {
    icon: Leaf,
    title: "Responsible Travel",
    note: "Journeys that give back to communities.",
  },
]

export function WhyMotohom() {
  return (
    <section className="border-t border-white/[0.06] bg-surface-0 py-[clamp(4rem,8vw,8rem)]">
      <div className="mx-auto max-w-screen-2xl px-5 lg:px-8">
        <Reveal as="div" className="mb-10 flex flex-col items-center gap-4 text-center md:mb-14">
          <span className="label-mono text-gold">Why MotoHom</span>
          <h2
            style={{ fontFamily: "var(--font-headline)" }}
            className="max-w-2xl text-[clamp(2rem,4.2vw,3.5rem)] font-light leading-[1.05] tracking-[-0.01em] text-ink"
          >
            The journey, entirely taken care of.
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, note }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-7"
            >
              <Icon className="size-6 text-gold" strokeWidth={1.5} />
              <h3 className="mt-5 font-heading text-base font-semibold tracking-tight text-ink">
                {title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
