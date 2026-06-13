"use client"

import * as React from "react"
import {
  animate,
  useInView,
  useReducedMotion,
} from "motion/react"
import { COMMUNITY_STATS, type CommunityStat } from "@/config/community-content"

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Parse "5,000+" → { target: 5000, prefix: '', suffix: '+', decimals: 0 } */
function parseStat(value: string) {
  const match = value.match(/^([^0-9]*)([\d.,]+)(.*)$/)
  if (!match) return { target: 0, prefix: "", suffix: value, decimals: 0 }
  const [, prefix, rawNumber, suffix] = match
  const numeric = Number.parseFloat(rawNumber.replace(/,/g, ""))
  const decimals = rawNumber.includes(".") ? rawNumber.split(".")[1].length : 0
  return {
    target: Number.isFinite(numeric) ? numeric : 0,
    prefix,
    suffix,
    decimals,
  }
}

function formatStat(value: number, decimals: number) {
  if (decimals > 0) return value.toFixed(decimals)
  return Math.round(value).toLocaleString("en-US")
}

function StatCounter({ stat, active }: { stat: CommunityStat; active: boolean }) {
  const reduced = useReducedMotion()
  const { target, prefix, suffix, decimals } = React.useMemo(
    () => parseStat(stat.value),
    [stat.value],
  )
  const [display, setDisplay] = React.useState(reduced ? target : 0)

  React.useEffect(() => {
    if (reduced) {
      setDisplay(target)
      return
    }
    if (!active) return
    const controls = animate(0, target, {
      duration: 1.6,
      ease: LUXURY_EASE,
      onUpdate: (latest) => setDisplay(latest),
    })
    return () => controls.stop()
  }, [active, target, reduced])

  return (
    <dl className="flex flex-col items-center gap-2 px-6 py-5 text-center md:px-8">
      <dt
        style={{ fontFamily: "var(--font-headline)" }}
        className="text-4xl font-light tabular-nums text-gold md:text-5xl"
      >
        {prefix}
        {formatStat(display, decimals)}
        {suffix}
      </dt>
      <dd className="font-headline text-[9px] uppercase tracking-[0.4em] text-ink-faint">
        {stat.label}
      </dd>
    </dl>
  )
}

export function TrustRail() {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <section className="border-y border-white/[0.06] bg-surface-1 py-14 md:py-16">
      <div ref={ref} className="container-lux">
        <div className="grid grid-cols-2 divide-x divide-white/[0.06] md:grid-cols-4">
          {COMMUNITY_STATS.map((stat) => (
            <StatCounter key={stat.label} stat={stat} active={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}
