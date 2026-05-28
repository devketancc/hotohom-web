"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion, type HTMLMotionProps } from "motion/react";

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
  const ref = React.useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: 0.15,
    margin: "0px 0px -8% 0px",
  });
  const [ready, setReady] = React.useState(false);

  React.useLayoutEffect(() => {
    setReady(true);
  }, []);

  if (reduced) {
    return React.createElement(as, { className, ...rest }, children);
  }

  const show = !ready || isInView;
  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      initial={false}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, ease: luxuryEase, delay }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
