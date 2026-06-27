'use client';

/**
 * MediaSlot — single place that renders fleet imagery/video AND makes every
 * not-yet-real asset obvious so it is trivial to find and swap later.
 *
 * HOW TO FIND PLACEHOLDERS:
 *   - In code: grep for `data-media-placeholder` or `isPlaceholder`.
 *   - In the UI: placeholders show a small corner tag ("Sample frame" /
 *     "Film coming soon"). Pass a real `src` (and, for video, a real file) and
 *     set `isPlaceholder={false}` to clear the marker.
 *
 * Real media comes from the caravan-class API (`media[]`: image | video |
 * tour360). When the API has nothing yet we fall back to a real MotoHom frame
 * from /public/exp-case so the layout is never empty.
 */

import * as React from 'react';
import { Play, ImageIcon, Film, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

type MediaKind = 'image' | 'video' | 'tour360';

export interface MediaSlotProps {
  kind?: MediaKind;
  /** Real asset URL when available (image url, or video file for kind=video). */
  src?: string | null;
  /** Poster image for video, or the image to show for kind=image. */
  poster?: string | null;
  alt: string;
  /** Marks this asset as not-yet-final. Shows the in-UI + DOM marker. */
  isPlaceholder?: boolean;
  className?: string;
  /** object-position, e.g. "center" | "60% 35%". */
  focus?: string;
  /** Hover zoom on the media (used inside link cards). */
  zoomOnHover?: boolean;
  /** Eager-load (above the fold). */
  priority?: boolean;
  /** Shown if the primary image fails to load (e.g. a not-yet-uploaded asset). */
  fallbackSrc?: string | null;
}

const KIND_TAG: Record<MediaKind, { label: string; Icon: typeof Play }> = {
  image: { label: 'Sample frame', Icon: ImageIcon },
  video: { label: 'Film coming soon', Icon: Film },
  tour360: { label: '360° tour coming soon', Icon: Compass },
};

function PlaceholderTag({ kind }: { kind: MediaKind }) {
  const { label, Icon } = KIND_TAG[kind];
  return (
    <span
      className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] bg-surface-0/70 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-muted backdrop-blur-md"
      data-media-placeholder="true"
    >
      <Icon className="size-3 text-gold/80" aria-hidden />
      {label}
    </span>
  );
}

export function MediaSlot({
  kind = 'image',
  src,
  poster,
  alt,
  isPlaceholder = false,
  className,
  focus = 'center',
  zoomOnHover = false,
  priority = false,
  fallbackSrc = null,
}: MediaSlotProps) {
  const objectStyle: React.CSSProperties = { objectPosition: focus };
  const zoomClass = zoomOnHover
    ? 'transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]'
    : '';

  const hasRealVideo = kind === 'video' && Boolean(src);
  const primaryStill = poster ?? src ?? null;
  // Swap to the fallback if the primary still 404s (e.g. asset not uploaded yet).
  const [imgFailed, setImgFailed] = React.useState(false);
  const stillSrc = imgFailed && fallbackSrc ? fallbackSrc : primaryStill;

  return (
    <div
      className={cn('relative h-full w-full overflow-hidden bg-surface-2', className)}
      data-media-placeholder={isPlaceholder ? 'true' : undefined}
    >
      {hasRealVideo ? (
        <video
          aria-label={alt}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          preload="metadata"
          poster={poster ?? undefined}
          className={cn('h-full w-full object-cover', zoomClass)}
          style={objectStyle}
        >
          <source src={src ?? undefined} type="video/mp4" />
        </video>
      ) : stillSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={stillSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => {
            if (fallbackSrc && !imgFailed) setImgFailed(true);
          }}
          className={cn('h-full w-full object-cover', zoomClass)}
          style={objectStyle}
        />
      ) : (
        // TODO: no media available for this slot yet — provide a real asset.
        <div
          className="flex h-full w-full items-center justify-center bg-surface-2"
          data-media-placeholder="true"
        >
          <ImageIcon className="size-7 text-ink-faint" aria-hidden />
        </div>
      )}

      {/* Video play affordance over a still (real poster OR placeholder). */}
      {kind === 'video' && !hasRealVideo && stillSrc && (
        <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-white/25 bg-surface-0/45 backdrop-blur-md">
            <Play className="size-5 translate-x-px text-ink" aria-hidden />
          </span>
        </span>
      )}

      {isPlaceholder && <PlaceholderTag kind={kind} />}
    </div>
  );
}
