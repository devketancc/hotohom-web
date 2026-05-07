"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const luxuryEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: luxuryEase },
  },
};

export type RevealStaggerProps = {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
};

export function RevealStagger({
  children,
  className,
  once = true,
}: RevealStaggerProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate = mounted && !reduced;

  if (!mounted) {
    return (
      <div className={className} suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={shouldAnimate ? "hidden" : false}
      whileInView={shouldAnimate ? "visible" : undefined}
      viewport={{ once, margin: "-10% 0px" }}
      variants={shouldAnimate ? containerVariants : undefined}
      suppressHydrationWarning
    >
      {children}
    </motion.div>
  );
}

export type RevealItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function RevealItem({ children, className }: RevealItemProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate = mounted && !reduced;

  if (!mounted) {
    return (
      <div className={className} suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={shouldAnimate ? itemVariants : undefined}
      suppressHydrationWarning
    >
      {children}
    </motion.div>
  );
}
