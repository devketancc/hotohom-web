"use client";

import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

type RevealTag = "div" | "section" | "article" | "header" | "footer" | "main" | "aside" | "li" | "ul" | "ol" | "span" | "p" | "h1" | "h2" | "h3" | "h4";

export type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  as?: RevealTag;
} & Omit<HTMLMotionProps<"div">, "initial" | "whileInView" | "viewport" | "transition" | "children" | "className">;

const luxuryEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Reveal({
  children,
  delay = 0,
  y = 18,
  duration = 1.05,
  once = true,
  className,
  as = "div",
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate = mounted && !reduced;

  if (!mounted) {
    return React.createElement(
      as,
      { className, suppressHydrationWarning: true, ...rest },
      children
    );
  }

  return (
    <Tag
      initial={shouldAnimate ? { opacity: 0, y } : false}
      whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once, margin: "-8% 0px" }}
      transition={shouldAnimate ? { duration, ease: luxuryEase, delay } : undefined}
      className={className}
      suppressHydrationWarning
      {...rest}
    >
      {children}
    </Tag>
  );
}
