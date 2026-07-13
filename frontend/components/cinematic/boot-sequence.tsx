'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BOOT_STEPS } from './scene-config';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_DURATION = 4300;

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const stepTimers = BOOT_STEPS.map((_, index) =>
      window.setTimeout(() => setStepIndex(index), 420 + index * 520),
    );
    const completeTimer = window.setTimeout(onComplete, BOOT_DURATION);

    return () => {
      stepTimers.forEach(window.clearTimeout);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.section
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(18px)' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(0deg,rgba(255,255,255,0.06),transparent)]" />

      <div className="relative flex w-[min(86vw,520px)] flex-col items-center">
        <div className="relative h-64 w-64 md:h-72 md:w-72">
          <CornerMark className="-left-2 -top-2" />
          <CornerMark className="-right-2 -top-2 rotate-90" />
          <CornerMark className="-bottom-2 -right-2 rotate-180" />
          <CornerMark className="-bottom-2 -left-2 -rotate-90" />

          <motion.div
            className="absolute inset-5 border border-white/10"
            animate={{ scale: [0.94, 1, 0.94], opacity: [0.26, 0.48, 0.26] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-14 border border-white/20"
            animate={{ rotate: [0, 90, 180], opacity: [0.32, 0.64, 0.32] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-28 w-px -translate-x-1/2 -translate-y-1/2 bg-white/24"
            animate={{ scaleY: [0.35, 1, 0.35] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-px w-28 -translate-x-1/2 -translate-y-1/2 bg-white/24"
            animate={{ scaleX: [1, 0.42, 1] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 border border-white/35 bg-white/[0.03]"
            animate={{ rotate: [45, 135, 225], scale: [0.84, 1.02, 0.84] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-white shadow-[0_0_28px_rgba(255,255,255,0.34)]"
            animate={{ opacity: [0.55, 1, 0.55], scale: [0.86, 1.18, 0.86] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="mt-8 min-h-16 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={BOOT_STEPS[stepIndex]}
              className="font-mono text-xs uppercase tracking-[0.28em] text-white/70"
              initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(10px)' }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              {BOOT_STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>
          <div className="mx-auto mt-5 grid w-28 grid-cols-3 gap-2">
            {BOOT_STEPS.map((step, index) => (
              <span
                key={step}
                className={[
                  'h-2 transition-all duration-500',
                  index <= stepIndex ? 'bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.18)]' : 'bg-white/16',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function CornerMark({ className }: { className: string }) {
  return (
    <div className={`absolute h-5 w-5 ${className}`} aria-hidden>
      <span className="absolute left-0 top-1/2 h-px w-full bg-white/40" />
      <span className="absolute left-1/2 top-0 h-full w-px bg-white/40" />
    </div>
  );
}
