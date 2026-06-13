"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, ArrowUpRight, Loader2 } from "lucide-react"
import { locationService } from "@/services/location.service"
import { packageService } from "@/services/package.service"
import { Reveal } from "@/components/shared/Reveal"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200&auto=format&fit=crop"

function nights(days: number) {
  const n = Math.max(0, days - 1)
  return `${n} ${n === 1 ? "night" : "nights"}`
}

export function ExperiencesShowcase() {
  const { data: hubs } = useQuery({
    queryKey: ["hubs"],
    queryFn: () => locationService.getHubs(),
  })

  const hubIds = useMemo(() => hubs?.map((h) => h.id) ?? [], [hubs])

  const { data, isLoading } = useQuery({
    queryKey: ["packages", "showcase", hubIds.join(",")],
    queryFn: () => packageService.listPackagesAcrossHubs(hubIds),
    enabled: hubIds.length > 0,
  })

  const packages = (data?.data?.results ?? []).slice(0, 3)

  return (
    <section className="bg-surface-0 py-[clamp(4rem,8vw,8rem)]">
      <div className="mx-auto max-w-screen-2xl px-5 lg:px-8">
        {/* Intro */}
        <Reveal as="div" className="mb-10 flex flex-col items-center gap-4 text-center md:mb-14">
          <span className="label-mono text-gold">Curated Experiences</span>
          <h2
            style={{ fontFamily: "var(--font-headline)" }}
            className="max-w-2xl text-[clamp(2rem,4.2vw,3.5rem)] font-light leading-[1.05] tracking-[-0.01em] text-ink"
          >
            Journeys that stay with you.
          </h2>
          <p className="max-w-xl font-body text-sm leading-relaxed text-ink-muted md:text-base">
            Handcrafted itineraries, iconic destinations, and the kind of memories that outlast the trip.
          </p>
        </Reveal>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-gold" />
          </div>
        ) : packages.length === 0 ? null : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.id}`}
                className="group relative block overflow-hidden rounded-2xl border border-white/[0.06]"
              >
                <div className="relative aspect-[5/6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pkg.thumbnail_url?.trim() ? pkg.thumbnail_url : FALLBACK_IMAGE}
                    alt={pkg.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <span className="label-mono text-gold-soft">{pkg.home_hub_name}</span>
                    <h3
                      style={{ fontFamily: "var(--font-headline)" }}
                      className="mt-2 text-2xl font-light leading-tight text-white"
                    >
                      {pkg.name}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/70">
                        {nights(pkg.duration_days)} · {pkg.home_hub_name}
                      </span>
                      <span className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-all duration-500 group-hover:border-gold/40 group-hover:bg-gold group-hover:text-gold-ink">
                        <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/packages"
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:text-gold"
          >
            View all experiences
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
