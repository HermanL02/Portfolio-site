'use client';

import { useEffect, useRef, useState } from 'react';
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  motion,
} from 'motion/react';
import { DELETE_CPS, TYPE_CPS } from '@/lib/motion';

interface CommandLineProps {
  /** The flag value to display, e.g. the active section. */
  value: string;
  /** Fired once the new value has finished typing, to release the output. */
  onSettled?: () => void;
}

/**
 * The prompt line, treated as a real command being re-run.
 *
 * Switching sections in a terminal doesn't cross-fade — you return to the
 * prompt, erase the argument and type a new one. The character count is a
 * motion value driven by Motion's `animate`, so a mid-flight switch retargets
 * the running animation instead of racing a queue of timers.
 */
export function CommandLine({ value, onSettled }: CommandLineProps) {
  const reduced = useReducedMotion();
  const chars = useMotionValue(value.length);

  // The value currently being typed out. Lags `value` during the erase phase.
  const [shown, setShown] = useState(value);
  const [count, setCount] = useState(value.length);
  const settled = useRef(onSettled);
  settled.current = onSettled;

  useMotionValueEvent(chars, 'change', latest => setCount(Math.round(latest)));

  useEffect(() => {
    if (value === shown) return;

    if (reduced) {
      setShown(value);
      setCount(value.length);
      chars.set(value.length);
      settled.current?.();
      return;
    }

    let cancelled = false;

    // Erase what's there, swap the text at zero, then type the new argument.
    const erase = animate(chars, 0, {
      duration: shown.length / DELETE_CPS,
      ease: 'linear',
    });

    erase.then(() => {
      if (cancelled) return;
      setShown(value);
      const type = animate(chars, value.length, {
        duration: value.length / TYPE_CPS,
        ease: 'linear',
      });
      type.then(() => {
        if (!cancelled) settled.current?.();
      });
    });

    return () => {
      cancelled = true;
      erase.stop();
    };
  }, [value, shown, reduced, chars]);

  return (
    <span className="inline-flex items-baseline">
      <span className="text-terminal-green">{shown.slice(0, count)}</span>
      {/* One cursor, always present, so it reads as a single object that the
          text is typed against rather than an effect layered on top. */}
      <motion.span
        aria-hidden="true"
        className="ml-px inline-block w-[0.55em] self-center bg-terminal-green"
        style={{ height: '1em' }}
        animate={reduced ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
        transition={
          reduced
            ? undefined
            : { duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: 'linear' }
        }
      />
    </span>
  );
}
