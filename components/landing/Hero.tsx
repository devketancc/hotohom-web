"use client"

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BookingControl } from './BookingControl'
import { Reveal } from '@/components/shared/Reveal'
import { AmbientSpotlight } from '@/components/shared/AmbientSpotlight'

interface HeroClipDef {
  src: string
  headline: React.ReactNode
}

const HERO_CLIP_DEFS: HeroClipDef[] = [
  {
    src: '/videos/hero-home.mp4',
    headline: (
      <>
        <span className="block">Not Just Travel.</span>
        <span className="block font-light italic text-stitch-primary-container/95">
          A Lifestyle.
        </span>
      </>
    ),
  },
  {
    src: '/videos/hero-scene-2.mp4',
    headline: (
      <>
        <span className="block">Wake Up</span>
        <span className="block font-light italic text-stitch-primary-container/95">
          Somewhere New
        </span>
      </>
    ),
  },
  {
    src: '/videos/hero-scene-3.mp4',
    headline: (
      <>
        <span className="block">The Road</span>
        <span className="block">
          Becomes{' '}
          <span className="font-light italic text-stitch-primary-container/95">Home</span>
        </span>
      </>
    ),
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
    setVideoReady(false) // Reset for next clip
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

  const handleCanPlay = React.useCallback(() => {
    setVideoReady(true)
  }, [])

  const src = playlist[clipIndex]?.src ?? playlist[0]?.src

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Permanent Poster / Fallback Layer */}
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

export const Hero = () => {
  const reducedMotion = useReducedMotion()
  const [mounted, setMounted] = React.useState(false)
  const [activeHeadline, setActiveHeadline] = React.useState<React.ReactNode>(
    HERO_CLIP_DEFS[0].headline
  )
  const [activeClipSrc, setActiveClipSrc] = React.useState(HERO_CLIP_DEFS[0].src)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const onActiveClip = React.useCallback((clip: HeroClipDef) => {
    setActiveHeadline(clip.headline)
    setActiveClipSrc(clip.src)
  }, [])

  return (
    <section className="hero-grain hero-ambient-shift hero-ambient-counter relative min-h-[100svh] lg:h-[100svh] lg:min-h-0 w-full overflow-hidden">
      {/* Background: shuffled hero clips (no repeat until all three play); static image if reduced motion or server-rendering */}
      <div className="absolute inset-0 z-0">
        {!mounted || reducedMotion ? (
          <img
            alt="Cinematic luxury caravan driving through scenic mountains at sunset"
            className="hero-kenburns h-full w-full object-cover object-[60%_35%]"
            src={HERO_POSTER_SRC}
          />
        ) : (
          <HeroBackgroundVideos poster={HERO_POSTER_SRC} onActiveClip={onActiveClip} />
        )}
        {/* Layered atmosphere */}
        <div className="hero-vignette absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_18%,rgba(255,208,120,0.2),transparent_54%)] opacity-80 blur-3xl" />
        {/* Cursor-following warm spotlight (above background, below copy) */}
        <AmbientSpotlight />
      </div>

      {/* Editorial 12-col grid */}
      <div className="relative z-10 mx-auto grid min-h-[100svh] lg:h-full lg:min-h-0 max-w-screen-2xl grid-cols-12 lg:grid-rows-[auto_1fr_auto] gap-x-6 px-10 pb-12 lg:pb-16 pt-36 md:pt-40 lg:pt-44">
        {/* Top-right eyebrow */}
        <Reveal
          as="div"
          duration={1.1}
          y={0}
          className="col-span-12 md:col-start-9 md:col-span-4 flex items-start justify-end lg:row-start-1"
        >
          <div className="hero-eyebrow-rule font-headline text-[10px] font-medium uppercase tracking-[0.4em] text-stitch-primary-container/90">
            Est. 2024 — Curated Caravan Travel
          </div>
        </Reveal>

        {/* Spacer pushes content toward lower portion for editorial weight */}
        <div className="col-span-12 grow lg:hidden" />

        {/* Headline block */}
        <div className="col-span-12 md:col-span-8 lg:row-start-2 lg:self-end mt-auto pt-10 md:pt-16 lg:pt-0">
          <div className="relative min-h-[10rem] md:min-h-[12rem] lg:min-h-[10rem] xl:min-h-[14rem] 2xl:min-h-[16rem]">
            <AnimatePresence initial={false} mode="wait">
              <motion.h1
                key={reducedMotion ? 'static-h1' : activeClipSrc}
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="font-headline font-semibold text-stitch-on-background leading-[0.95] tracking-[-0.04em] text-5xl md:text-7xl lg:text-[5.5rem] xl:text-[7.5rem] 2xl:text-[9.5rem]"
              >
                {activeHeadline}
              </motion.h1>
            </AnimatePresence>
          </div>

          <Reveal as="p" delay={0.18} y={14} className="mt-6 md:mt-8 max-w-xl font-body text-sm md:text-base lg:text-lg leading-relaxed text-stitch-on-surface-variant/80">
            Curated caravan journeys and immersive travel experiences designed for modern explorers.
          </Reveal>
        </div>

        {/* Booking widget — integrated floating concierge panel */}
        <Reveal
          as="div"
          delay={0.5}
          y={18}
          duration={1.1}
          className="col-span-12 lg:row-start-3 mt-8 lg:mt-10 flex justify-center w-full"
        >
          <div className="w-full md:max-w-2xl lg:max-w-4xl xl:max-w-5xl motion-safe:hover:-translate-y-0.5 transition-transform">
            <BookingControl />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
