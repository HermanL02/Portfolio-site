'use client';

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from 'motion/react';

const CELLS = 12;

/**
 * Scroll progress for a long post, drawn as a terminal meter.
 *
 * Reads from Motion's `useScroll` rather than a scroll listener, so it is
 * frame-synced and does not force layout on every event.
 */
export function ReadingProgress({ minutes }: { minutes: number }) {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const [pct, setPct] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', v =>
    setPct(Math.round(Math.min(1, Math.max(0, v)) * 100))
  );

  const filled = Math.round((pct / 100) * CELLS);
  const remaining = Math.max(0, Math.ceil(minutes * (1 - pct / 100)));

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-4 left-4 z-40 hidden select-none items-center gap-2 border border-terminal-border bg-terminal-surface px-3 py-1.5 text-[10px] text-muted-foreground sm:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: pct > 1 ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
    >
      <span className="text-terminal-green">
        {'█'.repeat(filled)}
        <span className="text-muted-foreground">{"░".repeat(CELLS - filled)}</span>
      </span>
      <span className="tabular-nums">{String(pct).padStart(3)}%</span>
      <span className="text-muted-foreground">|</span>
      <span>{remaining === 0 ? 'done' : `~${remaining} min left`}</span>
    </motion.div>
  );
}
