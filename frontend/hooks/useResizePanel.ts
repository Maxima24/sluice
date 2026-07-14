'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const STORAGE_KEY = 'fiber.operator-panel-width';
const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 420;
const MAX_WIDTH = 900;
const RESERVED_WORKSPACE_WIDTH = 650;

export function useResizePanel() {
  const frameRef = useRef<number | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = Number(saved);
    if (!Number.isFinite(parsed)) return;
    const frame = window.requestAnimationFrame(() => setWidth(clampWidth(parsed)));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const scheduleWidth = useCallback((nextWidth: number) => {
    const clamped = clampWidth(nextWidth);
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
    const handleResize = () => scheduleWidth(width);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scheduleWidth, width]);

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

function clampWidth(value: number) {
  if (typeof window === 'undefined') return clamp(value, MIN_WIDTH, MAX_WIDTH);
  const available = Math.max(MIN_WIDTH, window.innerWidth - RESERVED_WORKSPACE_WIDTH);
  const max = Math.min(MAX_WIDTH, available);
  return clamp(value, MIN_WIDTH, max);
}
