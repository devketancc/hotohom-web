'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/shared/Reveal';
import { MagneticButton } from '@/components/shared/MagneticButton';
import {
  GALLERY_FILTERS,
  GALLERY_ITEMS,
  type GalleryCategory,
  type GalleryItem,
} from '@/config/gallery-content';

function aspectClass(aspect: GalleryItem['aspect']) {
  switch (aspect) {
    case 'tall':
      return 'md:row-span-2';
    case 'wide':
      return 'md:col-span-2';
    default:
      return '';
  }
}

function GalleryTile({ item }: { item: GalleryItem }) {
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-[1.75rem] ring-1 ring-white/10 transition-[transform,box-shadow,ring-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:ring-stitch-primary-container/35 hover:shadow-[0_28px_60px_-24px_rgba(229,185,92,0.25)]',
        aspectClass(item.aspect)
      )}
    >
      <div className="relative aspect-[4/5] min-h-[220px] w-full md:aspect-auto md:h-full md:min-h-[280px]">
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-stitch-primary-container/0 transition-colors duration-500 group-hover:bg-stitch-primary-container/[0.06]" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <span className="font-headline text-[9px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/90">
            {item.location}
          </span>
          <h3 className="mt-2 font-headline text-xl font-semibold tracking-[-0.02em] text-stitch-on-background md:text-2xl">
            {item.title}
          </h3>
        </div>
      </div>
    </article>
  );
}

export function GalleryPageContent() {
  const [activeFilter, setActiveFilter] = useState<GalleryCategory>('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return GALLERY_ITEMS;
    return GALLERY_ITEMS.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <>
      <section className="section-ambient-warm relative border-b border-[var(--color-line)] pb-14 pt-36 md:pb-16 md:pt-44">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(229,185,92,0.08),transparent_55%)]" />
        <div className="relative mx-auto max-w-screen-xl px-6 md:px-10">
          <Reveal as="div" className="max-w-2xl">
            <span className="inline-flex items-center gap-2 font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/92">
              <Camera className="size-3.5" />
              Visual Archive
            </span>
            <h1 className="mt-5 font-headline text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-stitch-on-background md:text-5xl lg:text-[3.35rem]">
              Moments from the road, framed like editorial film.
            </h1>
            <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-stitch-on-surface-variant/85 md:text-lg">
              Interiors bathed in amber light, horizons that never end, and camps under constellations — a curated
              lookbook from the Motohom fleet and our explorers.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          <Reveal as="div" className="mb-12 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {GALLERY_FILTERS.map((filter) => {
              const active = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    'rounded-full border px-5 py-2.5 font-headline text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    active
                      ? 'border-stitch-primary-container/50 bg-stitch-primary-container/15 text-stitch-primary-container shadow-[0_8px_24px_-12px_rgba(229,185,92,0.4)]'
                      : 'border-white/10 bg-white/[0.03] text-stitch-on-surface-variant/80 hover:border-white/20 hover:text-stitch-on-background'
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </Reveal>

          <div
            key={activeFilter}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:auto-rows-[minmax(280px,auto)] md:gap-6"
          >
            {filtered.map((item, i) => (
              <Reveal key={item.id} as="div" delay={Math.min(i * 0.04, 0.32)} className={aspectClass(item.aspect)}>
                <GalleryTile item={item} />
              </Reveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-20 text-center font-body text-stitch-on-surface-variant">
              No images in this category yet.
            </p>
          )}
        </div>
      </section>

      <section className="section-ambient-cool relative border-t border-white/5 py-24 md:py-28">
        <div className="relative mx-auto flex max-w-screen-xl flex-col items-center gap-10 px-6 text-center md:px-10">
          <Reveal as="div" className="max-w-2xl">
            <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/90">
              Share yours
            </span>
            <h2 className="mt-5 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
              Every journey deserves a frame.
            </h2>
            <p className="mt-5 font-body text-base leading-relaxed text-stitch-on-surface-variant/80">
              Book a trip, capture the road, and tag us — the best frames find their way into this gallery and our
              community feed.
            </p>
          </Reveal>
          <Reveal as="div" delay={0.12} className="flex flex-wrap items-center justify-center gap-4">
            <MagneticButton strength={0.32}>
              <Link
                href="/community"
                className="group inline-flex items-center gap-3 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container shadow-[0_12px_36px_-16px_rgba(229,185,92,0.55)] transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06]"
              >
                Join the community
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
              </Link>
            </MagneticButton>
            <Link
              href="/select-caravan"
              className="inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-background/90 transition-all duration-500 hover:border-white/30 hover:bg-white/[0.04]"
            >
              Start planning
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
