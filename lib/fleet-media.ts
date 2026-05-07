import type { FleetClassSummary } from '@/types/fleet';
import type { CaravanMediaItem } from '@/types/fleet';

/**
 * Ordered image URLs from class media, de-duped with unit thumbnails.
 */
export function getFleetImageList(summary: FleetClassSummary): string[] {
  const klassImages = summary.klass.media
    .filter((m: CaravanMediaItem) => m.media_type === 'image' && Boolean(m.url))
    .sort((a, b) => a.order - b.order)
    .map((m) => m.url);

  const merged = [...klassImages];
  for (const t of summary.unitThumbnails) {
    if (t && !merged.includes(t)) merged.push(t);
  }
  return merged;
}

export function buildFleetImagePlan(summary: FleetClassSummary, fallback: string) {
  const list = getFleetImageList(summary);
  const hero = summary.coverImage ?? list[0] ?? fallback;
  const interior = list[1] ?? list[0] ?? hero;
  const technology = list.length > 2 ? list[Math.min(2, list.length - 1)] : list[0] ?? hero;
  const living = list.length > 1 ? list[list.length - 1] : interior;

  return {
    hero,
    interior,
    technology,
    living,
    gallery: list.length > 0 ? list : [fallback],
  };
}
