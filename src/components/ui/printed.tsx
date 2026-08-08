'use client';

import { Children, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { printGroup, printItem, staggerFor } from '@/lib/motion';

/**
 * Renders children as terminal output: each one prints in sequence.
 *
 * Replaces the per-section `terminal-line` class plus hand-written inline
 * `animationDelay: index * 80` that all nine sections carried. Sections now
 * describe *what* is output; the stagger budget lives here in one place.
 */
export function Printed({
  children,
  className,
  budget,
}: {
  children: ReactNode;
  className?: string;
  /** Total lead-in allowance in seconds. Defaults to the focal budget. */
  budget?: number;
}) {
  const reduced = useReducedMotion();
  const items = Children.toArray(children);
  const stagger = reduced ? 0 : staggerFor(items.length, budget);

  return (
    <motion.div
      className={className}
      variants={printGroup(stagger)}
      initial="hidden"
      animate="visible"
    >
      {items.map((child, i) => (
        <motion.div key={i} variants={printItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
