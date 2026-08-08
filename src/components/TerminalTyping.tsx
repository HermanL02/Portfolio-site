'use client';

import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import { TYPE_CPS } from '@/lib/motion';

interface TerminalTypingProps {
  text: string;
  /** Characters per second. Defaults to the shared typing rate. */
  cps?: number;
  /** Seconds to wait before the first character. */
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

export function TerminalTyping({
  text,
  cps = TYPE_CPS,
  delay = 0.15,
  onComplete,
  className = '',
}: TerminalTypingProps) {
  const reduced = useReducedMotion();
  const chars = useMotionValue(0);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  const complete = useRef(onComplete);
  complete.current = onComplete;

  useMotionValueEvent(chars, 'change', latest => setCount(Math.round(latest)));

  useEffect(() => {
    if (reduced) {
      setCount(text.length);
      setDone(true);
      complete.current?.();
      return;
    }

    const controls = animate(chars, text.length, {
      duration: text.length / cps,
      delay,
      ease: 'linear',
    });

    controls.then(() => {
      setDone(true);
      complete.current?.();
    });

    return () => controls.stop();
  }, [text, cps, delay, reduced, chars]);

  return (
    <span className={className}>
      {text.slice(0, count)}
      {/* Always rendered so server and client markup match — `useReducedMotion`
          resolves to null on the server, so branching on it here produced a
          hydration mismatch. Visibility is carried by the animation instead. */}
      <motion.span
        aria-hidden="true"
        className="ml-0.5 inline-block w-[0.5em] bg-terminal-green align-baseline"
        style={{ height: '0.9em' }}
        animate={done || reduced ? { opacity: 0 } : { opacity: [1, 1, 0, 0] }}
        transition={
          done || reduced
            ? { duration: 0.12 }
            : { duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: 'linear' }
        }
      />
    </span>
  );
}
