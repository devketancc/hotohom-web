"use client"

import { Star } from "lucide-react"
import { FEATURED_STORIES } from "@/config/community-content"
import { TestimonialCard } from "@/components/landing/TestimonialCard"
import { Reveal } from "@/components/shared/Reveal"
import { RevealStagger, RevealItem } from "@/components/shared/RevealStagger"

export function TestimonialsSection() {
  const [featured, ...rest] = FEATURED_STORIES
  const cards = rest.slice(0, 2)

  return (
    <section className="section-ambient-cool relative overflow-hidden bg-zinc-950 py-[clamp(6rem,12vw,14rem)]">
      <div className="container-lux relative z-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[2fr_3fr] lg:gap-24">
          {/* Left - editorial pull-quote */}
          <Reveal as="div" y={32}>
            <span className="font-headline text-[9px] uppercase tracking-[0.45em] text-gold">
              Traveler Stories
            </span>
            <blockquote
              style={{ fontFamily: "var(--font-headline)" }}
              className="mt-8 text-[clamp(1.6rem,3.5vw,2.8rem)] font-light italic leading-[1.35] text-gold-soft"
            >
              &ldquo;{featured.quote}&rdquo;
            </blockquote>
            <footer className="mt-10 border-t border-gold/20 pt-6">
              <div className="mb-3 flex gap-0.5 text-stitch-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <cite className="font-headline text-[10px] not-italic uppercase tracking-[0.38em] text-ink-muted">
                {featured.name}, {featured.location} · {featured.trip}
              </cite>
            </footer>
          </Reveal>

          {/* Right - card stack */}
          <RevealStagger className="flex flex-col gap-8">
            {cards.map((story) => (
              <RevealItem key={story.id}>
                <TestimonialCard
                  name={story.name}
                  location={story.location}
                  stats={story.trip}
                  quote={story.quote}
                  image={story.image}
                />
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </div>
    </section>
  )
}
