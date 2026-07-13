'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const STORAGE_KEY = 'fiber.operator-panel-width';
const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 420;
const MAX_WIDTH = 900;

export function useResizePanel() {
  const frameRef = useRef<number | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = Number(saved);
    if (!Number.isFinite(parsed)) return;
    const frame = window.requestAnimationFrame(() => setWidth(clamp(parsed, MIN_WIDTH, MAX_WIDTH)));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const scheduleWidth = useCallback((nextWidth: number) => {
    const clamped = clamp(nextWidth, MIN_WIDTH, MAX_WIDTH);
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      setWidth(clamped);
      window.localStorage.setItem(STORAGE_KEY, String(Math.round(clamped)));
    });
  }, []);

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const pointerId = event.pointerId;
      event.currentTarget.setPointerCapture(pointerId);

      const handleMove = (moveEvent: PointerEvent) => {
        scheduleWidth(window.innerWidth - moveEvent.clientX);
      };

      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp, { once: true });
    },
    [scheduleWidth],
  );

  useEffect(() => {
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return { width, startResize };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
