"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

const MAX_TRANSLATE = 6;

export type MagneticButtonProps = {
  children: React.ReactNode;
  className?: string;
  /** Strength of the pull, 0-1. Defaults to 0.35. */
  strength?: number;
};

export function MagneticButton({
  children,
  className,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const shouldAnimate = !reduced;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 180, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 180, damping: 22, mass: 0.4 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldAnimate) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    const clampedX = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, offsetX * strength));
    const clampedY = Math.max(-MAX_TRANSLATE, Math.min(MAX_TRANSLATE, offsetY * strength));
    x.set(clampedX);
    y.set(clampedY);
  };

  const handleMouseLeave = () => {
    if (!shouldAnimate) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={shouldAnimate ? handleMouseMove : undefined}
      onMouseLeave={shouldAnimate ? handleMouseLeave : undefined}
      style={shouldAnimate ? { x: springX, y: springY } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}
