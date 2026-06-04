import type { TravelPackage } from '@/types/package';

export const PACKAGE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200&auto=format&fit=crop';

/** Thumbnail first, then gallery images; deduped and trimmed. */
export function packageGalleryUrls(pkg: Pick<TravelPackage, 'thumbnail_url' | 'images'>): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const thumb = pkg.thumbnail_url?.trim();
  if (thumb) {
    seen.add(thumb);
    urls.push(thumb);
  }
  for (const img of pkg.images ?? []) {
    const u = typeof img === 'string' ? img.trim() : '';
    if (u && !seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  }
  return urls.length > 0 ? urls : [PACKAGE_FALLBACK_IMAGE];
}

export function packageBasePriceNumber(basePrice: string): number | null {
  const n = Number.parseFloat(basePrice);
  return Number.isFinite(n) ? n : null;
}
