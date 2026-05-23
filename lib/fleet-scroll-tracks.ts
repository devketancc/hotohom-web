/**
 * Stacking-scroll keyframes shared by FleetExperience + FleetStoryScroll.
 * Pair with `useSpring(scrollYProgress, …)` on the scrub for smoother motion.
 */

const CROSSFADE_MIN_RATIO = 0.12;
const CROSSFADE_TARGET_RATIO = 0.21;
const CROSSFADE_MAX_RATIO = 0.38;

export const FLEET_SCROLL_EDGE = 0.017;

export function clamp01Fleet(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function strictFour(a: number, b: number, c: number, d: number) {
  const x = clamp01Fleet(a);
  const y = clamp01Fleet(Math.max(b, x + 1e-6));
  const z = clamp01Fleet(Math.max(c, y + 1e-6));
  const w = clamp01Fleet(Math.max(d, z + 1e-6));
  return [x, y, z, w] as const;
}

/** Half-width of crossfade zones (fraction of 0→1 scroll). */
export function fleetSlideBlendE(index: number, total: number, edgeFallback = FLEET_SCROLL_EDGE) {
  const start = index / total;
  const end = (index + 1) / total;
  const span = Math.max(end - start, 1e-9);
  const target = span * CROSSFADE_TARGET_RATIO;
  const minW = span * CROSSFADE_MIN_RATIO;
  const maxW = span * CROSSFADE_MAX_RATIO;
  const fromEdgeConstant = edgeFallback * (total / Math.max(total, 2));
  const e = Math.min(maxW, Math.max(minW, target, fromEdgeConstant));
  return e;
}

export function fleetSlideOpacityInputs(index: number, total: number, edge = FLEET_SCROLL_EDGE) {
  const start = index / total;
  const end = (index + 1) / total;
  const e = fleetSlideBlendE(index, total, edge);

  if (total <= 1) {
    return strictFour(0, 1e-5, 0.999, 1);
  }
  if (index === 0) {
    return strictFour(0, 1e-5, end - e, end + e);
  }
  if (index === total - 1) {
    return strictFour(start - e, start + e, end - e, 1);
  }
  return strictFour(start - e, start + e, end - e, end + e);
}

export function fleetSlideOpacityOutputs(index: number, total: number) {
  if (total <= 1) return [1, 1, 1, 1] as const;
  if (index === 0) return [1, 1, 1, 0] as const;
  if (index === total - 1) return [0, 1, 1, 1] as const;
  return [0, 1, 1, 0] as const;
}

export function fleetPlateauInteriorKeys(inputs: readonly [number, number, number, number]) {
  const startPlat = inputs[1];
  const endPlat = inputs[2];
  const room = Math.max(endPlat - startPlat, 1e-5);
  const span = Math.min(0.09, Math.max(room * 0.48, 0.032));
  return {
    fadeFrom: startPlat,
    fadeThru: clamp01Fleet(startPlat + span),
    staggerA: clamp01Fleet(startPlat + span * 0.28),
    staggerB: clamp01Fleet(startPlat + span * 0.92),
    clipA: clamp01Fleet(startPlat + 1e-5),
    clipB: clamp01Fleet(Math.min(endPlat - 1e-5, startPlat + Math.min(room * 0.42, 0.055))),
  };
}

export function fleetProgressTickFillInputs(index: number, total: number, edge = FLEET_SCROLL_EDGE) {
  const start = index / total;
  const end = (index + 1) / total;
  const span = Math.max(end - start, 1e-9);
  const e = fleetSlideBlendE(index, total, edge);
  const ramp = clamp01Fleet(span * 0.1 + e * 0.4);
  const sFill = clamp01Fleet(Math.max(start - ramp * 0.2, 0));
  const mid = clamp01Fleet(start + ramp);
  const endHold = clamp01Fleet(end - ramp * 0.5);
  const tail = clamp01Fleet(end + e * 2);
  return strictFour(sFill, mid, endHold, tail);
}
