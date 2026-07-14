'use client';

import { useEffect } from 'react';

type InteractiveElement = HTMLButtonElement | HTMLAnchorElement | HTMLElement;

const LIGHT_FILL = '#101010';
const LIGHT_TEXT = '#FAFAF8';
const LIGHT_BORDER = '#101010';
const DARK_FILL = '#FAFAF8';
const DARK_TEXT = '#0A0A0A';
const DARK_BORDER = 'rgba(255,255,255,0.42)';
const FILL_DURATION_MS = 900;
const FILL_OVERSCAN = 96;

const activeTimers = new WeakMap<InteractiveElement, number>();

function parseRgb(value: string) {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  const alpha = match[4] === undefined ? 1 : Number(match[4]);
  if (alpha === 0) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
  };
}

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function getSurfaceColor(element: Element) {
  let current: Element | null = element;

  while (current) {
    const rgb = parseRgb(window.getComputedStyle(current).backgroundColor);
    if (rgb) return rgb;
    current = current.parentElement;
  }

  return { r: 246, g: 246, b: 242 };
}

function getTarget(event: Event) {
  const target = event.target;
  if (!(target instanceof Element)) return null;

  const element = target.closest<InteractiveElement>('button, a[href], [role="button"]');
  if (!element || element.closest('[data-no-magnetic]')) return null;
  if (element instanceof HTMLButtonElement && element.disabled) return null;
  if (element.getAttribute('aria-disabled') === 'true') return null;

  return element;
}

function getFillDelay(x: number, y: number, rect: DOMRect, size: number) {
  const distanceToContent = Math.hypot(rect.width / 2 - x, rect.height / 2 - y);
  const fillRadius = Math.max(1, size / 2);
  const progressToContent = Math.min(1, distanceToContent / fillRadius);

  return Math.round(Math.min(560, Math.max(80, progressToContent * FILL_DURATION_MS)));
}

function clearActiveTimer(element: InteractiveElement) {
  const timer = activeTimers.get(element);
  if (timer) window.clearTimeout(timer);
  activeTimers.delete(element);
}

function setFillGeometry(element: InteractiveElement, event: PointerEvent) {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const farthestX = Math.max(x, rect.width - x);
  const farthestY = Math.max(y, rect.height - y);
  const size = Math.ceil(Math.hypot(farthestX, farthestY) * 2 + Math.max(FILL_OVERSCAN, rect.width * 0.18));
  const delay = getFillDelay(x, y, rect, size);

  element.style.setProperty('--magnetic-x', `${x}px`);
  element.style.setProperty('--magnetic-y', `${y}px`);
  element.style.setProperty('--magnetic-size', `${size}px`);
  element.style.setProperty('--magnetic-color-delay', `${delay}ms`);

  return delay;
}

function setFillVariant(element: InteractiveElement) {
  const isDarkSurface = luminance(getSurfaceColor(element)) < 0.42;

  element.style.setProperty('--magnetic-fill', isDarkSurface ? DARK_FILL : LIGHT_FILL);
  element.style.setProperty('--magnetic-text-hover', isDarkSurface ? DARK_TEXT : LIGHT_TEXT);
  element.style.setProperty('--magnetic-border-hover', isDarkSurface ? DARK_BORDER : LIGHT_BORDER);
}

export function MagneticFillProvider() {
  useEffect(() => {
    const handlePointerOver = (event: PointerEvent) => {
      const element = getTarget(event);
      if (!element) return;
      if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return;

      setFillVariant(element);
      const delay = setFillGeometry(element, event);
      clearActiveTimer(element);
      element.removeAttribute('data-magnetic-active');
      activeTimers.set(
        element,
        window.setTimeout(() => {
          element.setAttribute('data-magnetic-active', 'true');
          activeTimers.delete(element);
        }, delay),
      );
    };

    const handlePointerMove = (event: PointerEvent) => {
      const element = getTarget(event);
      if (!element) return;
      setFillGeometry(element, event);
    };

    const handlePointerOut = (event: PointerEvent) => {
      const element = getTarget(event);
      if (!element) return;
      if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return;

      setFillGeometry(element, event);
      clearActiveTimer(element);
      element.removeAttribute('data-magnetic-active');
    };

    document.addEventListener('pointerover', handlePointerOver);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerout', handlePointerOut);

    return () => {
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerout', handlePointerOut);
    };
  }, []);

  return null;
}
