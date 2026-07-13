'use client';

import { AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChannelHealth } from '@/lib/queries/channels';
import { useNodeInfo } from '@/lib/queries/node';
import { useReconciliation } from '@/lib/queries/reconciliation';
import { BootSequence } from './boot-sequence';
import { DashboardAssembler } from './dashboard-assembler';
import { NetworkCanvas } from './network-canvas';
import { SCENE_COUNT } from './scene-config';
import { StoryOverlay } from './story-overlay';

gsap.registerPlugin(ScrollTrigger);

export function FiberCinematicExperience() {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const node = useNodeInfo();
  const health = useChannelHealth();
  const reconciliation = useReconciliation();
  const [bootComplete, setBootComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState<'full' | 'reduced'>(() => {
    if (typeof window === 'undefined') return 'full';
    return getSceneQuality();
  });

  const completeBoot = useCallback(() => setBootComplete(true), []);

  useEffect(() => {
    if (bootComplete) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [bootComplete]);

  useEffect(() => {
    const updateQuality = () => setQuality(getSceneQuality());
    window.addEventListener('resize', updateQuality);
    return () => window.removeEventListener('resize', updateQuality);
  }, []);

  useEffect(() => {
    if (!bootComplete) return;

    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;

    const lenis = new Lenis({
      duration: 1.18,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1.1,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${window.innerHeight * (SCENE_COUNT - 1)}`,
      pin: stage,
      scrub: 0.85,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setProgress(Number(self.progress.toFixed(4)));
      },
    });

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      trigger.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [bootComplete]);

  const activeScene = useMemo(() => Math.min(SCENE_COUNT - 1, Math.floor(progress * SCENE_COUNT)), [progress]);

  return (
    <main className="relative bg-black text-white">
      <AnimatePresence>{bootComplete ? null : <BootSequence onComplete={completeBoot} />}</AnimatePresence>

      <section ref={wrapperRef} className="relative bg-black">
        <div ref={stageRef} className="relative h-screen overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#000000_0%,#050505_50%,#000000_100%)]" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="absolute inset-y-0 left-0 w-32 bg-[linear-gradient(90deg,#000000,transparent)] md:w-52" />
          <div className="absolute inset-y-0 right-0 w-32 bg-[linear-gradient(270deg,#000000,transparent)] md:w-52" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#000000,transparent)]" />
          <NetworkCanvas progress={progress} quality={quality} />
          <StoryOverlay
            progress={progress}
            activeScene={activeScene}
            info={node.data ?? null}
            health={health.data ?? null}
            reconciliation={reconciliation.data ?? null}
          />
        </div>
      </section>

      <DashboardAssembler
        info={node.data ?? null}
        health={health.data ?? null}
        reconciliation={reconciliation.data ?? null}
        nodePending={node.isPending}
        nodeError={node.isError}
        healthPending={health.isPending}
      />
    </main>
  );
}

function getSceneQuality(): 'full' | 'reduced' {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  return reduceMotion || coarsePointer || window.innerWidth < 900 ? 'reduced' : 'full';
}
