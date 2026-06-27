'use client';

import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { MediaSlot } from '@/components/fleet/redesign/MediaSlot';

export interface FleetGalleryMedia {
  /** Ordered real images (class media first, then unit thumbnails). */
  images: string[];
  /** Real walkthrough video, if the API has one. */
  video: string | null;
  /** Real 360 tour asset, if the API has one. */
  tour360: string | null;
  /** True when `images` are local stand-ins, not class marketing photography. */
  imagesArePlaceholder: boolean;
}

interface Cell {
  type: 'image' | 'video' | 'tour360';
  caption: string;
  /** index into images for type=image */
  imageIndex?: number;
  className: string;
  aspect: string;
}

const LAYOUT: Cell[] = [
  { type: 'image', caption: 'Exterior · road presence', imageIndex: 0, className: 'md:col-span-7 md:row-span-2', aspect: 'aspect-[4/3] md:aspect-auto' },
  { type: 'video', caption: 'Walkthrough film', className: 'md:col-span-5', aspect: 'aspect-[16/10]' },
  { type: 'image', caption: 'Interior · living volume', imageIndex: 1, className: 'md:col-span-5', aspect: 'aspect-[16/10]' },
  { type: 'image', caption: 'Galley & kitchen', imageIndex: 2, className: 'md:col-span-4', aspect: 'aspect-[4/3]' },
  { type: 'image', caption: 'Rest & berths', imageIndex: 3, className: 'md:col-span-4', aspect: 'aspect-[4/3]' },
  { type: 'tour360', caption: '360° interior tour', className: 'md:col-span-4', aspect: 'aspect-[4/3]' },
];

export function FleetDetailGallery({
  media,
  name,
}: {
  media: FleetGalleryMedia;
  name: string;
}) {
  const reduced = useReducedMotion();
  const { images, video, tour360, imagesArePlaceholder } = media;
  if (images.length === 0) return null;

  const pick = (i: number) => images[i % images.length];

  return (
    <section
      id="gallery"
      className="relative scroll-mt-24 border-t border-[var(--color-line)] bg-surface-0 py-20 md:py-28"
    >
      <div className="mx-auto max-w-screen-2xl px-6 md:px-12">
        <motion.header
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.85, ease: luxuryEase }}
          className="max-w-2xl"
        >
          <span className="label-mono text-gold">Gallery</span>
          <h2 className="mt-4 font-heading text-[clamp(1.8rem,3.6vw,2.75rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-ink">
            Inside and out, on the road.
          </h2>
          <p className="mt-4 font-body text-[15px] leading-relaxed text-ink-muted">
            Interiors, exterior presence, a walkthrough film, and a 360° tour.
          </p>
        </motion.header>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-12 md:gap-5">
          {LAYOUT.map((cell, i) => {
            const isVideo = cell.type === 'video';
            const isTour = cell.type === 'tour360';
            const realVideo = isVideo ? video : null;
            const stillForMedia =
              isVideo || isTour ? pick(i) : pick(cell.imageIndex ?? 0);
            // placeholder when: images are stand-ins, OR no real video/tour asset.
            const placeholder =
              (isVideo && !realVideo) || (isTour && !tour360) || imagesArePlaceholder;

            return (
              <motion.figure
                key={`${cell.type}-${i}`}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.8, ease: luxuryEase, delay: (i % 3) * 0.06 }}
                className={cn(
                  'group relative overflow-hidden rounded-[1.5rem] ring-1 ring-[var(--color-line)] shadow-luxury-sm',
                  cell.className
                )}
              >
                <div className={cn('h-full w-full', cell.aspect)}>
                  <MediaSlot
                    kind={cell.type}
                    // For video, src must be a real video file (or null) so the
                    // slot shows a play affordance instead of a broken <video>.
                    src={isVideo ? realVideo : isTour ? tour360 ?? stillForMedia : stillForMedia}
                    poster={stillForMedia}
                    alt={`${name}, ${cell.caption}`}
                    isPlaceholder={placeholder}
                    zoomOnHover={!isVideo}
                  />
                </div>
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-surface-0/85 to-transparent px-4 pb-3.5 pt-10">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                    {cell.caption}
                  </span>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
