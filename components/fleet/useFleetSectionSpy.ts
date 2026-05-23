'use client';

import * as React from 'react';

/**
 * Highlights which `#sectionId` is nearest the top of the viewport.
 */
export function useFleetSectionSpy(sectionIds: string[], rootMargin = '-40% 0px -45% 0px') {
  const [activeId, setActiveId] = React.useState<string | null>(sectionIds[0] ?? null);

  React.useEffect(() => {
    if (sectionIds.length === 0) return;
    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { root: null, rootMargin, threshold: [0.08, 0.2, 0.35, 0.5] }
    );

    for (const el of els) obs.observe(el);
    return () => obs.disconnect();
  }, [sectionIds, rootMargin]);

  return activeId;
}
