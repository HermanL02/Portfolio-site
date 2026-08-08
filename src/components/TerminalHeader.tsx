'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TerminalTyping } from '@/components/TerminalTyping';
import { CalendlyButton } from '@/components/CalendlyButton';
import { DURATION, EASE_OUT } from '@/lib/motion';

export function TerminalHeader() {
  const [ran, setRan] = useState(false);

  return (
    <div className="mb-16">
      {/* Status bar */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.state, ease: EASE_OUT }}
      >
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <motion.span
            className="w-2 h-2 bg-terminal-green rounded-full"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span>status:</span>
          <span className="text-terminal-green">available</span>
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="text-sm text-muted-foreground">pid: 1337</span>
      </motion.div>

      {/* Typed command */}
      <div className="space-y-2 mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-terminal-green text-sm shrink-0">$</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            <TerminalTyping text="cat portfolio.md" onComplete={() => setRan(true)} />
          </h1>
        </div>

        <AnimatePresence>
          {ran && (
            <motion.p
              className="text-muted-foreground pl-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.16, ease: 'linear' }}
            >
              &gt; Explore my projects, experience, and technical expertise
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {ran && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.16, delay: 0.08, ease: 'linear' }}
          >
            <CalendlyButton />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
