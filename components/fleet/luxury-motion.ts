/** Shared choreography — matches [`Reveal`](components/shared/Reveal.tsx) */
export const luxuryEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fleetTransition = (duration: number, delay = 0) => ({
  duration,
  ease: luxuryEase,
  delay,
});
