"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight, Loader2, Users, Dog } from "lucide-react"
import { useFleetCatalog } from "@/hooks/useFleetCatalog"
import { FLEET_SLUG_BY_CODE, type FleetClassCode } from "@/config/fleet-experience"
import { Reveal } from "@/components/shared/Reveal"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=1000&auto=format&fit=crop"

function slugFor(code: string): string {
  return FLEET_SLUG_BY_CODE[code as FleetClassCode] ?? code.toLowerCase()
}

export function FleetLineup() {
  const { classes, isLoading } = useFleetCatalog()
  const lineup = classes.slice(0, 4)

  return (
    <section className="border-t border-white/[0.06] bg-surface-0 py-[clamp(4rem,8vw,8rem)]">
      <div className="mx-auto max-w-screen-2xl px-5 lg:px-8">
        <Reveal as="div" className="mb-10 flex flex-col items-center gap-4 text-center md:mb-14">
          <span className="label-mono text-gold">Our Fleet</span>
          <h2
            style={{ fontFamily: "var(--font-headline)" }}
            className="max-w-2xl text-[clamp(2rem,4.2vw,3.5rem)] font-light leading-[1.05] tracking-[-0.01em] text-ink"
          >
            Built for extraordinary journeys.
          </h2>
          <p className="max-w-xl font-body text-sm leading-relaxed text-ink-muted md:text-base">
            Premium caravans for every kind of traveller, from agile two-berths to flagship suites.
          </p>
        </Reveal>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-gold" />
          </div>
        ) : lineup.length === 0 ? null : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {lineup.map(({ klass, coverImage, unitCount }) => (
              <Link
                key={klass.id}
                href={`/fleet/${slugFor(klass.code)}`}
                className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-colors duration-500 hover:border-gold/25"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage ?? FALLBACK_IMAGE}
                    alt={klass.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-1/80 to-transparent" />
                </div>
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading text-base font-semibold tracking-tight text-ink">
                      {klass.name}
                    </h3>
                    <ArrowUpRight className="size-4 shrink-0 text-ink-faint transition-all duration-500 group-hover:text-gold" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={12} /> {klass.full_capacity} guests
                    </span>
                    {klass.is_pet_friendly && (
                      <span className="inline-flex items-center gap-1.5">
                        <Dog size={12} /> Pet friendly
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/fleet"
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:text-gold"
          >
            Explore the fleet
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
