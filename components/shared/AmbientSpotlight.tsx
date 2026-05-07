"use client";

import * as React from "react";

export type AmbientSpotlightProps = {
  /**
   * Optional className applied to the root overlay element. The overlay is
   * absolutely positioned and inherits the size of its nearest positioned
   * ancestor. Add e.g. `inset-0` from the parent or rely on default `absolute inset-0`.
   */
  className?: string;
  /** Size of the warm glow in viewport-px. Defaults to 520. */
  size?: number;
  /** Glow color (rgba). Defaults to a warm gold. */
  color?: string;
  /** Glow intensity opacity 0-1. Defaults to 0.22. */
  intensity?: number;
};

export function AmbientSpotlight({
  className,
  size = 520,
  color = "rgba(229, 185, 92, 0.45)",
  intensity = 0.22,
}: AmbientSpotlightProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const targetRef = React.useRef({ x: 0, y: 0, has: false });

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const parent = node.parentElement;
    if (!parent) return;

    const handleMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      targetRef.current.x = event.clientX - rect.left;
      targetRef.current.y = event.clientY - rect.top;
      targetRef.current.has = true;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    const handleLeave = () => {
      targetRef.current.has = false;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    const flush = () => {
      rafRef.current = null;
      const overlay = ref.current;
      if (!overlay) return;
      if (targetRef.current.has) {
        overlay.style.setProperty("--mx", `${targetRef.current.x}px`);
        overlay.style.setProperty("--my", `${targetRef.current.y}px`);
        overlay.style.setProperty("--mo", String(intensity));
      } else {
        overlay.style.setProperty("--mo", "0");
      }
    };

    parent.addEventListener("pointermove", handleMove, { passive: true });
    parent.addEventListener("pointerleave", handleLeave);

    return () => {
      parent.removeEventListener("pointermove", handleMove);
      parent.removeEventListener("pointerleave", handleLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 z-[1]"}
      style={{
        background: `radial-gradient(${size}px circle at var(--mx, 50%) var(--my, 30%), ${color}, transparent 60%)`,
        opacity: "var(--mo, 0)",
        transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        mixBlendMode: "soft-light",
      }}
    />
  );
}
