"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";

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
  const ref = React.useRef<HTMLDivElement>(null);
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
    return <div className={className}>{children}</div>;
  }

  const show = !ready || isInView;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={show ? "visible" : "hidden"}
      variants={containerVariants}
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

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
