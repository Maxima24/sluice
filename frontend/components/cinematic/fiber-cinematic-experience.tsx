'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NetworkCanvas } from './network-canvas';
import { SCENE_COUNT } from './scene-config';
import { StoryOverlay } from './story-overlay';
import type { CinematicData } from './types';

gsap.registerPlugin(ScrollTrigger);

export function FiberCinematicExperience({ info, health, reconciliation }: CinematicData) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState<'full' | 'reduced'>(() => {
    if (typeof window === 'undefined') return 'full';
    return getSceneQuality();
  });

  useEffect(() => {
    const updateQuality = () => setQuality(getSceneQuality());
    window.addEventListener('resize', updateQuality);
    return () => window.removeEventListener('resize', updateQuality);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;

    const lenis = new Lenis({
      duration: 1.18,
      smoothWheel: true,
      wheelMultiplier: 0.84,
      touchMultiplier: 1.15,
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

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  const activeScene = useMemo(
    () => Math.min(SCENE_COUNT - 1, Math.floor(progress * SCENE_COUNT)),
    [progress],
  );

  return (
    <main ref={wrapperRef} className="relative min-h-screen bg-[#02050b] text-white">
      <div ref={stageRef} className="relative h-screen overflow-hidden bg-[#02050b]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(40,110,255,0.28),transparent_34%),radial-gradient(circle_at_76%_62%,rgba(103,232,249,0.12),transparent_28%),linear-gradient(180deg,#02050b_0%,#07101c_52%,#02050b_100%)]" />
        <div className="absolute inset-0 opacity-[0.12] mix-blend-screen [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,5,11,0.28)_54%,rgba(2,5,11,0.92)_100%)]" />
        <NetworkCanvas progress={progress} quality={quality} />
        <StoryOverlay
          progress={progress}
          activeScene={activeScene}
          info={info}
          health={health}
          reconciliation={reconciliation}
        />
      </div>
    </main>
  );
}

function getSceneQuality(): 'full' | 'reduced' {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  return reduceMotion || coarsePointer || window.innerWidth < 900 ? 'reduced' : 'full';
}
