"use client"

import { Map, Truck, ShieldCheck, LifeBuoy } from "lucide-react"

const ITEMS = [
  { icon: Map, title: "Curated Journeys", note: "Handpicked routes & stays" },
  { icon: Truck, title: "Premium Caravans", note: "Luxury on wheels" },
  { icon: ShieldCheck, title: "All-Inclusive Comfort", note: "Everything taken care of" },
  { icon: LifeBuoy, title: "On-Ground Support", note: "24/7 assistance, anywhere" },
]

export function ValueStrip() {
  return (
    <section className="border-b border-white/[0.06] bg-surface-0">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-px md:grid-cols-4 lg:px-8">
        {ITEMS.map(({ icon: Icon, title, note }) => (
          <div
            key={title}
            className="flex items-center gap-3 px-5 py-6 md:px-7 md:py-7"
          >
            <Icon className="size-5 shrink-0 text-gold" strokeWidth={1.5} />
            <div className="min-w-0">
              <p className="font-heading text-[13px] font-semibold tracking-tight text-ink">
                {title}
              </p>
              <p className="font-body text-xs text-ink-muted">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
