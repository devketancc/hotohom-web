'use client';

import Link from 'next/link';
import { ArrowRight, Heart, MessageCircle, Share2, Users } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import { RevealStagger, RevealItem } from '@/components/shared/RevealStagger';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { TestimonialCard } from '@/components/landing/TestimonialCard';
import {
  COMMUNITY_STATS,
  FEATURED_STORIES,
  RECENT_MOMENTS,
} from '@/config/community-content';

export function CommunityPageContent() {
  return (
    <>
      <section className="section-ambient-warm relative border-b border-[var(--color-line)] pb-14 pt-36 md:pb-16 md:pt-44">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(229,185,92,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-screen-xl px-6 md:px-10">
          <Reveal as="div" className="max-w-2xl">
            <span className="inline-flex items-center gap-2 font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/92">
              <Users className="size-3.5" />
              The Motohom Circle
            </span>
            <h1 className="mt-5 font-headline text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-stitch-on-background md:text-5xl lg:text-[3.35rem]">
              A community built on miles, not algorithms.
            </h1>
            <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-stitch-on-surface-variant/85 md:text-lg">
              Real travelers sharing routes, deck rituals, and golden-hour frames. Join explorers who treat the road as
              home — and each other as co-pilots.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-white/5 py-16 md:py-20">
        <div className="mx-auto max-w-screen-xl px-6 md:px-10">
          <RevealStagger className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            {COMMUNITY_STATS.map((stat) => (
              <RevealItem key={stat.label} className="text-center">
                <p className="font-headline text-4xl font-semibold tracking-[-0.03em] text-stitch-primary-container md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 font-headline text-[10px] font-semibold uppercase tracking-[0.28em] text-stitch-on-surface-variant/70">
                  {stat.label}
                </p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          <Reveal as="div" className="mb-16 max-w-xl">
            <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/90">
              Featured voices
            </span>
            <h2 className="mt-4 font-headline text-3xl font-semibold tracking-[-0.025em] text-stitch-on-background md:text-4xl">
              Stories from the road
            </h2>
          </Reveal>
          <RevealStagger className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
            {FEATURED_STORIES.map((story) => (
              <RevealItem key={story.id}>
                <TestimonialCard
                  name={story.name}
                  location={story.location}
                  stats={story.trip}
                  quote={story.quote}
                  image={story.image}
                />
                <p className="mt-4 font-body text-xs text-stitch-on-surface-variant/60">
                  {story.handle} · {story.likes} appreciations
                </p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="section-ambient-cool border-y border-white/5 py-20 md:py-28">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          <Reveal as="div" className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/90">
                Live feed
              </span>
              <h2 className="mt-4 font-headline text-3xl font-semibold tracking-[-0.025em] text-stitch-on-background md:text-4xl">
                Recent moments
              </h2>
              <p className="mt-4 font-body text-base text-stitch-on-surface-variant/80">
                A snapshot of what our circle is sharing this week.
              </p>
            </div>
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-2 font-headline text-[11px] font-semibold uppercase tracking-[0.2em] text-stitch-primary-container transition-colors hover:text-stitch-on-background"
            >
              View gallery
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
            {RECENT_MOMENTS.map((moment, i) => (
              <Reveal key={moment.id} as="div" delay={Math.min(i * 0.05, 0.3)}>
                <article className="group relative overflow-hidden rounded-2xl ring-1 ring-white/10 transition-all duration-500 hover:ring-stitch-primary-container/30">
                  <div className="relative aspect-square">
                    <img
                      src={moment.image}
                      alt={moment.caption}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <p className="font-body text-[11px] leading-snug text-white/95">{moment.caption}</p>
                      <p className="mt-1 font-headline text-[9px] uppercase tracking-wider text-stitch-primary-container/90">
                        {moment.author}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 bg-zinc-900/80 px-3 py-2 md:hidden">
                    <span className="truncate font-body text-[10px] text-stitch-on-surface-variant">{moment.author}</span>
                    <div className="flex gap-2 text-stitch-on-surface-variant/60">
                      <Heart className="size-3.5" />
                      <MessageCircle className="size-3.5" />
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2400&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-stitch-background/90 backdrop-blur-sm" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center md:px-10">
          <Reveal as="div">
            <Share2 className="mx-auto mb-6 size-10 text-stitch-primary-container/80" />
            <h2 className="font-headline text-3xl font-semibold tracking-[-0.025em] text-stitch-on-background md:text-5xl">
              Your next chapter starts with a booking.
            </h2>
            <p className="mx-auto mt-6 max-w-lg font-body text-base leading-relaxed text-stitch-on-surface-variant/85 md:text-lg">
              Complete a journey, share your frames, and become part of the circle. We feature standout trips in our
              gallery and community highlights.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton strength={0.32}>
                <Link
                  href="/select-caravan"
                  className="group inline-flex items-center gap-3 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-8 py-4 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container shadow-[0_12px_36px_-16px_rgba(229,185,92,0.55)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-[1.06]"
                >
                  Book your journey
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </MagneticButton>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-3 rounded-full border border-white/15 px-8 py-4 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-background/90 transition-all hover:border-white/30 hover:bg-white/[0.04]"
              >
                Browse gallery
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
