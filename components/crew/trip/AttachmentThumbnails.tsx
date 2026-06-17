'use client';

import Image from 'next/image';
import { Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Read-only strip of clickable attachment thumbnails (opens full image in a new tab). */
export function AttachmentThumbnails({
  urls,
  className,
  size = 48,
  showLabel = false,
}: {
  urls: string[];
  className?: string;
  size?: number;
  showLabel?: boolean;
}) {
  if (!urls || urls.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {showLabel ? (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          <Paperclip className="size-3" aria-hidden />
          {urls.length}
        </span>
      ) : null}
      {urls.map((url, i) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative overflow-hidden rounded-md border border-border bg-muted/20 transition-opacity hover:opacity-80"
          style={{ width: size, height: size }}
        >
          <Image
            src={url}
            alt={`Attachment ${i + 1}`}
            fill
            sizes={`${size}px`}
            className="object-cover"
            unoptimized
          />
        </a>
      ))}
    </div>
  );
}
