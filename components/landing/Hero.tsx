"use client"

import * as React from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { AmbientSpotlight } from '@/components/shared/AmbientSpotlight'

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface HeroClipDef {
  src: string
  hour: string
  moment: string
  line1: string
  line2: React.ReactNode
}

const HERO_CLIP_DEFS: HeroClipDef[] = [
  {
    src: '/videos/hero-home.mp4',
    hour: '05:42',
    moment: 'First Light',
    line1: 'Not just travel.',
    line2: <span className="text-gold">A way of living.</span>,
  },
  {
    src: '/videos/hero-scene-2.mp4',
    hour: '07:18',
    moment: 'Morning Drive',
    line1: 'Wake up',
    line2: <span className="text-gold">somewhere new.</span>,
  },
  {
    src: '/videos/hero-scene-3.mp4',
    hour: '19:04',
    moment: 'Last Light',
    line1: 'The road',
    line2: <span className="text-gold">becomes home.</span>,
  },
]

const HERO_POSTER_SRC =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCXibFzxuZ03QkcW1_fZb8YjVJNoIXMg_C3O5AeV2QckYgDaEizJEa9Ky95eSAwbpC1NSpfvDpHFeQNPaVidtWzXOVZFBFxpteaDcsqELw9BomMGHTm6Lo6w3CzrS7m2g29i_K-yZc9J5qC_QGMUsZf8YTqnM5vVDTDvce07NGB8fYQUn4XWLdvSo_FLJXZ2vKazfTFCQaHVNEpGssm9eS2N_dw1GAGCYewYCuc5JTPHcwxzvXJjCAee5pbAZTq3EQG-Clizgt3EUM'

function shuffleClips(clips: HeroClipDef[]): HeroClipDef[] {
  const a = [...clips]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function HeroBackgroundVideos({
  poster,
  onActiveClip,
}: {
  poster: string
  onActiveClip: (clip: HeroClipDef) => void
}) {
  const [playlist, setPlaylist] = React.useState<HeroClipDef[]>([])
  const [clipIndex, setClipIndex] = React.useState(0)
  const [videoReady, setVideoReady] = React.useState(false)

  React.useEffect(() => {
    setPlaylist(shuffleClips(HERO_CLIP_DEFS))
  }, [])

  React.useEffect(() => {
    if (playlist.length === 0) return
    const clip = playlist[clipIndex]
    if (clip) onActiveClip(clip)
    setVideoReady(false)
  }, [clipIndex, playlist, onActiveClip])

  const handleEnded = React.useCallback(() => {
    setClipIndex((prev) => {
      const next = prev + 1
      if (next >= playlist.length) {
        setPlaylist(shuffleClips(HERO_CLIP_DEFS))
        return 0
      }
      return next
    })
  }, [playlist.length])

  const handleCanPlay = React.useCallback(() => setVideoReady(true), [])
  const src = playlist[clipIndex]?.src ?? playlist[0]?.src

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={poster}
        className={`absolute inset-0 h-full w-full object-cover object-[60%_35%] transition-opacity duration-1000 ${
          videoReady ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {playlist.length > 0 && (
        <video
          key={`${clipIndex}-${src}`}
          aria-hidden
          autoPlay
          muted
          playsInline
          loop={false}
          className={`h-full w-full object-cover object-[60%_35%] transition-opacity duration-1000 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          disablePictureInPicture
          poster={poster}
          preload="metadata"
          onEnded={handleEnded}
          onCanPlay={handleCanPlay}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  )
}

function scrollToConcierge() {
  const el = document.getElementById('concierge')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export const Hero = () => {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = React.useState(false)
  const [clip, setClip] = React.useState<HeroClipDef>(HERO_CLIP_DEFS[0])

  React.useEffect(() => setMounted(true), [])
  const onActiveClip = React.useCallback((c: HeroClipDef) => setClip(c), [])

  return (
    <section
      id="top"
      className="relative min-h-[100dvh] w-full overflow-hidden bg-surface-0"
    >
      {/* Background film */}
      <div className="absolute inset-0 z-0">
        {!mounted || reduced ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Cinematic luxury caravan travelling through scenic landscape at dawn"
            className="h-full w-full object-cover object-[60%_35%]"
            src={HERO_POSTER_SRC}
          />
        ) : (
          <HeroBackgroundVideos poster={HERO_POSTER_SRC} onActiveClip={onActiveClip} />
        )}
        {/* Cinematic grade: warm black floor + top fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/35 to-surface-0/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_115%,rgba(210,168,95,0.16),transparent_58%)]" />
        <AmbientSpotlight />
      </div>

      {/* Journey line — left edge motif */}
      <div className="pointer-events-none absolute left-6 top-0 z-10 hidden h-full md:left-10 md:block">
        <div className="journey-line h-full">
          {!reduced && (
            <motion.span
              className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(210,168,95,0.8)]"
              initial={{ top: '8%' }}
              animate={{ top: ['8%', '82%', '8%'] }}
              transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Foreground */}
      <div className="relative z-20 mx-auto flex min-h-[100dvh] max-w-screen-2xl flex-col justify-between px-6 pb-12 pt-32 md:px-16 md:pb-16 md:pt-36">
        {/* Top: hour + moment ticker */}
        <div className="flex items-start justify-between">
          <span className="label-mono text-ink-muted/80">
            Curated Caravan Travel
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={clip.hour}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.5, ease: LUXURY_EASE }}
              className="flex items-center gap-3 text-right"
            >
              <span className="label-mono text-gold">{clip.hour}</span>
              <span className="hidden h-3 w-px bg-line-strong sm:block" />
              <span className="label-mono hidden text-ink-muted/70 sm:inline">
                {clip.moment}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom: kinetic headline + actions */}
        <div className="max-w-6xl">
          <div className="relative min-h-[7rem] sm:min-h-[10rem] md:min-h-[12rem] lg:min-h-[15rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={reduced ? 'static' : clip.src}
                initial={reduced ? false : { opacity: 0, y: 24, filter: 'blur(14px)' }}
                animate={reduced ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduced ? undefined : { opacity: 0, y: -18, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: LUXURY_EASE }}
                className="display-hero text-[clamp(2.5rem,8vw,8rem)] text-ink"
              >
                <span className="block">{clip.line1}</span>
                <span className="block">{clip.line2}</span>
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: LUXURY_EASE, delay: 0.3 }}
            className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink-muted md:text-lg"
          >
            Where the journey is the destination. Private caravans, curated routes, and a life
            lived outside the ordinary.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: LUXURY_EASE, delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <button
              type="button"
              onClick={scrollToConcierge}
              className="gradient-cta group inline-flex items-center gap-2 rounded-full py-4 pl-7 pr-4 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06]"
            >
              Plan Your Journey
              <span className="flex size-7 items-center justify-center rounded-full bg-gold-ink/25">
                <ArrowDown className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0.5" />
              </span>
            </button>
            <Link
              href="/fleet"
              className="group inline-flex items-center gap-2 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:text-gold"
            >
              View the Fleet
              <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
