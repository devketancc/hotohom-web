"use client"

import * as React from "react"
import Link from "next/link"
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  AnimatePresence,
  type MotionValue,
} from "motion/react"
import {
  ArrowUpRight,
  Compass,
  MoonStar,
  Mountain,
  Sparkles,
  Tent,
  type LucideIcon,
} from "lucide-react"
import { MagneticButton } from "@/components/shared/MagneticButton"

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type Scene = {
  id: string
  index: string
  eyebrow: string
  title: string
  paragraph: string
  features: string[]
  image: string
  imageAlt: string
  /** Inline radial-gradient string used for scene-tinted ambient layer. */
  ambient: string
  /** Used as accent color for the active progress segment. */
  accent: string
  Icon: LucideIcon
}

const SCENES: Scene[] = [
  {
    id: "luxury-interiors",
    index: "01",
    eyebrow: "Luxury Interiors",
    title: "Crafted like a private suite, designed to move.",
    paragraph:
      "Soft ambient lighting, hand-finished materials, and considered ergonomics turn every kilometer into a calm, hotel-grade retreat.",
    features: ["Hand-finished cabinetry", "Climate-tuned lounge", "Hush-quiet sleep zones"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2400&auto=format&fit=crop",
    imageAlt: "Cinematic luxury caravan interior with warm ambient lighting",
    ambient:
      "radial-gradient(ellipse at 20% 30%, rgba(229,185,92,0.22), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(184,146,63,0.18), transparent 60%)",
    accent: "rgba(229, 185, 92, 0.95)",
    Icon: Sparkles,
  },
  {
    id: "open-road-freedom",
    index: "02",
    eyebrow: "Open-Road Freedom",
    title: "Sunrise drives. No fixed itinerary.",
    paragraph:
      "Take the long way. Pause at lookouts. Let the route bend to your mood while precision navigation quietly keeps the path within reach.",
    features: ["Live route concierge", "Off-the-grid waypoints", "Fuel + range planning"],
    image:
      "https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=2400&auto=format&fit=crop",
    imageAlt: "Mountain highway during a soft cinematic sunrise",
    ambient:
      "radial-gradient(ellipse at 18% 24%, rgba(120,153,214,0.22), transparent 56%), radial-gradient(ellipse at 86% 78%, rgba(229,185,92,0.10), transparent 60%)",
    accent: "rgba(170, 196, 240, 0.95)",
    Icon: Compass,
  },
  {
    id: "family-experiences",
    index: "03",
    eyebrow: "Family Experiences",
    title: "The road becomes the dinner table.",
    paragraph:
      "Layouts that flex with the people you love most. Cook together, sleep close, and let the journey itself become the memory.",
    features: ["Modular family layouts", "Pet-ready cabin", "Shared galley + dining"],
    image:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=2400&auto=format&fit=crop",
    imageAlt: "Family enjoying a scenic moment beside their caravan",
    ambient:
      "radial-gradient(ellipse at 22% 32%, rgba(255,176,90,0.22), transparent 54%), radial-gradient(ellipse at 82% 76%, rgba(229,143,74,0.15), transparent 60%)",
    accent: "rgba(255, 196, 132, 0.95)",
    Icon: Tent,
  },
  {
    id: "off-grid-comfort",
    index: "04",
    eyebrow: "Off-Grid Comfort",
    title: "Stay remote without giving anything up.",
    paragraph:
      "Solar-tuned power, deep water reserves, and satellite-aware connectivity keep the cabin civilised long after the road runs out.",
    features: ["Solar + lithium reserves", "Satellite uplink ready", "Multi-day water capacity"],
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2400&auto=format&fit=crop",
    imageAlt: "Caravan parked under a starlit night sky in the wilderness",
    ambient:
      "radial-gradient(ellipse at 18% 28%, rgba(70,140,150,0.24), transparent 56%), radial-gradient(ellipse at 84% 80%, rgba(40,80,120,0.22), transparent 62%)",
    accent: "rgba(140, 220, 220, 0.95)",
    Icon: MoonStar,
  },
  {
    id: "modern-travel-lifestyle",
    index: "05",
    eyebrow: "Modern Travel Lifestyle",
    title: "A new shape of slow, intentional travel.",
    paragraph:
      "An editorial way to move through the world: less itinerary, more atmosphere. The caravan as a quiet, connected, considered home.",
    features: ["App-controlled cabin", "Concierge add-ons", "Lifestyle integrations"],
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2400&auto=format&fit=crop",
    imageAlt: "Cinematic editorial caravan lifestyle moment in soft light",
    ambient:
      "radial-gradient(ellipse at 22% 24%, rgba(240,220,190,0.22), transparent 54%), radial-gradient(ellipse at 80% 80%, rgba(229,185,92,0.18), transparent 60%)",
    accent: "rgba(245, 222, 179, 0.95)",
    Icon: Mountain,
  },
]

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

type SceneLayerProps = {
  scene: Scene
  index: number
  total: number
  scrollYProgress: MotionValue<number>
  isFirst: boolean
}

function SceneImageLayer({
  scene,
  index,
  total,
  scrollYProgress,
  isFirst,
}: SceneLayerProps) {
  const step = 1 / total
  const start = index * step
  const end = start + step

  const opacity = useTransform(
    scrollYProgress,
    [start - 0.04, start + 0.06, end - 0.06, end + 0.04].map(clamp01),
    [0, 1, 1, 0]
  )
  const scale = useTransform(
    scrollYProgress,
    [start - 0.04, end + 0.04].map(clamp01),
    [1.04, 1.1]
  )
  const y = useTransform(
    scrollYProgress,
    [start, end].map(clamp01),
    [40, -40]
  )

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 will-change-[opacity,transform]"
      style={{ opacity, scale, y }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scene.image}
        alt=""
        loading={isFirst ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </motion.div>
  )
}

function AmbientTintLayer({
  scene,
  index,
  total,
  scrollYProgress,
}: SceneLayerProps) {
  const step = 1 / total
  const start = index * step
  const end = start + step
  const opacity = useTransform(
    scrollYProgress,
    [start - 0.06, start + 0.08, end - 0.08, end + 0.06].map(clamp01),
    [0, 1, 1, 0]
  )

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ opacity, background: scene.ambient }}
    />
  )
}

type SceneCopyProps = {
  scene: Scene
  index: number
  total: number
  scrollYProgress: MotionValue<number>
}

function SceneCopy({
  scene,
  index,
  total,
  scrollYProgress,
}: SceneCopyProps) {
  const step = 1 / total
  const start = index * step
  const end = start + step

  const opacity = useTransform(
    scrollYProgress,
    [start - 0.02, start + 0.08, end - 0.08, end + 0.02].map(clamp01),
    [0, 1, 1, 0]
  )
  const titleClip = useTransform(
    scrollYProgress,
    [start - 0.02, start + 0.12].map(clamp01),
    ["inset(0 0 100% 0)", "inset(0 0 0% 0)"]
  )
  const paragraphY = useTransform(
    scrollYProgress,
    [start + 0.02, start + 0.14].map(clamp01),
    [18, 0]
  )
  const featureY = useTransform(
    scrollYProgress,
    [start + 0.06, start + 0.18].map(clamp01),
    [22, 0]
  )

  return (
    <motion.div
      className="pointer-events-auto absolute inset-x-0 bottom-10 z-20 flex justify-center px-5 md:bottom-16 md:px-10 lg:inset-y-0 lg:right-10 lg:left-auto lg:items-center lg:justify-end lg:px-0"
      style={{ opacity }}
    >
      <div className="surface-glass card-lift w-full max-w-xl rounded-3xl p-7 md:p-10">
        <div className="flex items-center gap-3 font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/95">
          <scene.Icon className="size-4" />
          {scene.eyebrow}
        </div>

        <motion.h3
          className="mt-6 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-stitch-on-background md:text-4xl lg:text-[2.6rem]"
          style={{ clipPath: titleClip }}
        >
          {scene.title}
        </motion.h3>

        <motion.p
          className="mt-6 max-w-md font-body text-base leading-relaxed text-stitch-on-surface-variant/85"
          style={{ y: paragraphY }}
        >
          {scene.paragraph}
        </motion.p>

        <motion.ul
          className="mt-8 flex flex-wrap gap-2"
          style={{ y: featureY }}
        >
          {scene.features.map((feature) => (
            <li
              key={feature}
              className="inline-flex items-center rounded-full border border-stitch-primary-container/25 bg-stitch-primary-container/10 px-3.5 py-1.5 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] text-stitch-primary-container"
            >
              {feature}
            </li>
          ))}
        </motion.ul>

        <div className="mt-9 flex items-center justify-between gap-4 border-t border-[var(--color-line)] pt-6">
          <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.28em] text-stitch-on-surface-variant/65">
            Chapter {scene.index} / {String(total).padStart(2, "0")}
          </span>
          <MagneticButton strength={0.32}>
            <Link
              href="/fleet"
              className="group inline-flex items-center gap-2 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-5 py-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.2em] text-stitch-on-primary-container transition-[transform,box-shadow,filter,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] hover:shadow-[0_18px_50px_-18px_rgba(229,185,92,0.65)]"
            >
              Explore the fleet
              <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </motion.div>
  )
}

function ProgressTick({
  index,
  total,
  scrollYProgress,
}: {
  index: number
  total: number
  scrollYProgress: MotionValue<number>
}) {
  const step = 1 / total
  const start = index * step
  const end = start + step
  const fill = useTransform(
    scrollYProgress,
    [start - 0.02, start + 0.04, end - 0.04, end + 0.02].map(clamp01),
    ["0%", "100%", "100%", "100%"]
  )

  return (
    <div className="relative h-[3px] w-10 overflow-hidden rounded-full bg-white/10 md:w-14">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-stitch-primary-container"
        style={{ width: fill }}
      />
    </div>
  )
}

function ProgressRail({
  scrollYProgress,
  total,
}: {
  scrollYProgress: MotionValue<number>
  total: number
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center px-6 md:bottom-10">
      <div className="surface-glass flex items-center gap-3 rounded-full px-5 py-3">
        {Array.from({ length: total }).map((_, i) => (
          <ProgressTick
            key={i}
            index={i}
            total={total}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  )
}

function StaticFallback() {
  return (
    <section
      id="fleet-experience"
      className="section-ambient-warm bg-stitch-background py-32"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-24 px-6 md:px-10">
        <header className="max-w-2xl">
          <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
            The Fleet Experience
          </span>
          <h2 className="mt-5 font-headline text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-stitch-on-background md:text-5xl">
            Five chapters of how the road feels.
          </h2>
        </header>

        <div className="flex flex-col gap-16">
          {SCENES.map((scene, index) => (
            <article
              key={scene.id}
              className="grid gap-10 lg:grid-cols-12 lg:items-center"
            >
              <div
                className={`relative overflow-hidden rounded-[2rem] ring-1 ring-[var(--color-line)] shadow-luxury-lg lg:col-span-7 ${
                  index % 2 ? "lg:order-2" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scene.image}
                  alt={scene.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="h-[28rem] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-stitch-background/45 via-transparent to-stitch-primary-container/10" />
              </div>
              <div
                className={`flex flex-col gap-6 lg:col-span-5 ${
                  index % 2 ? "lg:order-1" : ""
                }`}
              >
                <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/95">
                  {scene.index} / {scene.eyebrow}
                </span>
                <h3 className="font-headline text-2xl font-semibold leading-[1.1] tracking-[-0.02em] text-stitch-on-background md:text-3xl">
                  {scene.title}
                </h3>
                <p className="font-body text-base leading-relaxed text-stitch-on-surface-variant/85">
                  {scene.paragraph}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {scene.features.map((feature) => (
                    <li
                      key={feature}
                      className="inline-flex items-center rounded-full border border-stitch-primary-container/25 bg-stitch-primary-container/10 px-3.5 py-1.5 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] text-stitch-primary-container"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FleetExperienceScroll() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const [activeIndex, setActiveIndex] = React.useState(0)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const total = SCENES.length
    const next = Math.min(total - 1, Math.max(0, Math.floor(latest * total)))
    setActiveIndex((prev) => (next !== prev ? next : prev))
  })

  return (
    <section
      id="fleet-experience"
      className="relative bg-stitch-background"
      aria-label="Fleet experience"
    >
      <div ref={containerRef} className="relative" style={{ height: "420vh" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Layer 0: ambient warm backdrop (always on) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(229,185,92,0.10),transparent_55%),radial-gradient(ellipse_at_50%_100%,rgba(11,15,20,0.6),transparent_60%)]" />

          {/* Layer 1: stacked scene images */}
          {SCENES.map((scene, i) => (
            <SceneImageLayer
              key={scene.id}
              scene={scene}
              index={i}
              total={SCENES.length}
              scrollYProgress={scrollYProgress}
              isFirst={i === 0}
            />
          ))}

          {/* Layer 2: vignette + bottom darkening */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(11,15,20,0.55)_85%,rgba(11,15,20,0.85)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stitch-background via-stitch-background/55 to-transparent" />

          {/* Layer 3: scene-tinted ambient */}
          {SCENES.map((scene, i) => (
            <AmbientTintLayer
              key={`tint-${scene.id}`}
              scene={scene}
              index={i}
              total={SCENES.length}
              scrollYProgress={scrollYProgress}
              isFirst={i === 0}
            />
          ))}

          {/* Layer 4: copy panels (one per scene, opacity-driven) */}
          {SCENES.map((scene, i) => (
            <SceneCopy
              key={`copy-${scene.id}`}
              scene={scene}
              index={i}
              total={SCENES.length}
              scrollYProgress={scrollYProgress}
            />
          ))}

          {/* Layer 5: top eyebrow + counter */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-6 md:px-10 md:pt-10">
            <div className="flex items-center gap-3 font-headline text-[10px] font-semibold uppercase tracking-[0.4em] text-stitch-on-background/85">
              <span className="size-1.5 rounded-full bg-stitch-primary-container" />
              The Fleet Experience
            </div>
            <div className="flex items-baseline gap-2 font-headline tabular-nums">
              <div className="relative h-9 overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={SCENES[activeIndex].index}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.55, ease: LUXURY_EASE }}
                    className="block text-3xl font-semibold text-stitch-on-background md:text-4xl"
                  >
                    {SCENES[activeIndex].index}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-stitch-on-surface-variant/70">
                / {String(SCENES.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Layer 6: progress rail */}
          <ProgressRail scrollYProgress={scrollYProgress} total={SCENES.length} />
        </div>
      </div>
    </section>
  )
}

export function FleetExperience() {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])
  const animate = mounted && !reduced

  if (!animate) {
    return <StaticFallback />
  }

  return <FleetExperienceScroll />
}
