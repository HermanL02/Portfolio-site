import type { Transition, Variants } from 'motion/react';

/**
 * Motion tokens.
 *
 * Durations express distance and consequence rather than taste:
 * feedback is near-instant, state changes are quick, and only the one
 * authored sequence (the tab switch) is allowed to take real time.
 */
export const DURATION = {
  /** Immediate feedback — hover, press. */
  feedback: 0.12,
  /** Routine state change. */
  state: 0.22,
  /** Layout, overlay, view transition. */
  transition: 0.36,
  /** The authored focal entrance. */
  focal: 0.5,
} as const;

/** Confident deceleration. Deliberately not a bounce or elastic curve. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Characters per second for the command line. Exit is faster than entry. */
export const TYPE_CPS = 34;
export const DELETE_CPS = 55;

/**
 * Printed output.
 *
 * A terminal prints; it does not ease up from below. There is no vertical
 * movement here on purpose — the translateY that this replaces was the
 * generic tell, and it was applied identically to all nine sections.
 */
export const printItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.16, ease: 'linear' },
  },
};

/**
 * Stagger for a list that genuinely appears as a list.
 *
 * `staggerChildren` is a per-child delay, so a 45-project grid at the old
 * 80ms produced 3.6s of lead-in and the last cards crawled in. Motion has no
 * built-in cap, so callers use {@link staggerFor} to keep the total bounded.
 */
export const printGroup = (stagger: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: 0.02 } },
});

/** Per-child delay that keeps a whole group under ~450ms regardless of length. */
export const staggerFor = (count: number, budget = 0.45) =>
  count <= 1 ? 0 : Math.min(0.045, budget / count);

/** Content being replaced blooms and dies rather than cutting out. */
export const decayOut: Variants = {
  exit: {
    opacity: 0,
    filter: 'brightness(0.35)',
    transition: { duration: DURATION.state, ease: EASE_OUT },
  },
};

export const SPRING_SNAP: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 38,
  mass: 0.7,
};
