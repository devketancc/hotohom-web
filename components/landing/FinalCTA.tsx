"use client"

import Link from 'next/link'
import { Reveal } from '@/components/shared/Reveal'

export const FinalCTA = () => {
  return (
    <section className="section-ambient-warm section-grain-soft relative py-60 overflow-hidden">
      <div className="absolute inset-0 z-0 scale-110">
        <img
          alt="Caravan under a starry night sky"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGvK9qkpcWpYop4hVYNUzOzR3zKGRzVnA17MeyW1YQhmAn5QYEvklWWhVyBoXldDspoU8WUgQf9ICzh3I_x6waP1wS4qjXQ7qeS5ID8FU8DhuKxbEWXI1fmG7YRAif16-mHMUCPXsA_cLjLDyaKJlp1kuSk5OddQW8CWFmN48XiqfSGoVZdi5eNud0QiGY6z6s3uspIZQJUwJSPGCZVuFTSo4jVk0JEbCHKimh6dtfswEibqoUt6qFxjOqMbMrgj1aMpi4ZbKXFs"
        />
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center px-8">
        <Reveal as="h2" duration={1.0} className="text-6xl md:text-8xl font-black tracking-tight mb-10 leading-none font-headline">
          Your Next Adventure <br/><span className="text-stitch-primary-container">Starts Here</span>
        </Reveal>
        <Reveal as="p" delay={0.12} duration={0.95} className="text-2xl text-stitch-on-surface-variant/90 mb-16 max-w-3xl mx-auto leading-relaxed font-medium font-body">
          Join a global community of modern nomads. Rediscover the freedom of the road with Motohom&apos;s premium caravan experiences.
        </Reveal>

        <Reveal as="div" delay={0.24} duration={0.95} className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <Link
            href="/select-caravan"
            className="card-lift gradient-cta text-stitch-on-primary-container px-16 py-7 h-auto rounded-2xl font-headline font-black text-xl uppercase tracking-[0.15em] shadow-2xl shadow-stitch-primary/20 transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:brightness-[1.06]"
          >
            Start Your Journey
          </Link>
          <Link
            href="/fleet"
            className="card-lift bg-transparent border-2 border-stitch-primary/40 text-stitch-primary px-16 py-7 h-auto rounded-2xl font-headline font-black text-xl uppercase tracking-[0.15em] hover:bg-stitch-primary/5 hover:border-stitch-primary transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            View Fleet
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
