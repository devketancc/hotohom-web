'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.95, ease: luxuryEase },
  },
};

export function FleetSplitReveal({
  text,
  className,
  as: Tag = 'h2',
}: {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
}) {
  const reduced = useReducedMotion();
  const words = text.split(/(\s+)/).filter(Boolean);

  if (reduced) {
    return React.createElement(Tag, { className }, text);
  }

  const MotionComp =
    Tag === 'h1'
      ? motion.h1
      : Tag === 'h3'
        ? motion.h3
        : Tag === 'p'
          ? motion.p
          : motion.h2;

  return (
    <MotionComp className={cn(className)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }} variants={container}>
      {words.map((chunk, i) =>
        /\s+/.test(chunk) ? (
          <span key={i}>{chunk}</span>
        ) : (
          <motion.span key={i} variants={item} className="inline-block">
            {chunk}
          </motion.span>
        )
      )}
    </MotionComp>
  );
}
