'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from 'react';
import { ConnectionLayer } from './connection-layer';
import { ModuleBody } from './module-body';
import { ModuleFrame } from './module-frame';
import { ZoomControls } from './zoom-controls';
import type { CanvasModuleId, WorkspaceModule } from './workspace-types';
import type { WorkspaceModuleId } from '@/lib/workspace';
import { cn } from '@/lib/utils';

interface DragState {
  mode: 'pan' | 'move' | 'resize';
  id?: CanvasModuleId;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  originWidth?: number;
  originHeight?: number;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const CANVAS_WIDTH = 2200;
const CANVAS_HEIGHT = 1500;
const MODULE_HEADER_HEIGHT = 118;

const initialModules: WorkspaceModule[] = [
  {
    id: 'network',
    title: 'Live Fiber Network',
    eyebrow: 'topology view',
    x: 120,
    y: 130,
    width: 520,
    height: 380,
    minWidth: 360,
    minHeight: 280,
    kind: 'network',
  },
  {
    id: 'liquidity',
    title: 'Liquidity Heat Map',
    eyebrow: 'capacity surface',
    x: 760,
    y: 110,
    width: 420,
    height: 340,
    minWidth: 330,
    minHeight: 290,
    kind: 'liquidity',
  },
  {
    id: 'route-probe',
    title: 'Route Simulation',
    eyebrow: 'can i pay',
    x: 1300,
    y: 160,
    width: 460,
    height: 380,
    minWidth: 350,
    minHeight: 310,
    kind: 'route',
  },
  {
    id: 'channels',
    title: 'Channel Inspector',
    eyebrow: 'channel 4 selected',
    x: 190,
    y: 650,
    width: 440,
    height: 360,
    minWidth: 350,
    minHeight: 300,
    kind: 'channels',
  },
  {
    id: 'rebalance',
    title: 'Rebalancing Engine',
    eyebrow: 'liquidity movement',
    x: 800,
    y: 560,
    width: 460,
    height: 380,
    minWidth: 350,
    minHeight: 320,
    kind: 'rebalance',
  },
  {
    id: 'alerts',
    title: 'Alert Timeline',
    eyebrow: 'operator attention',
    x: 1410,
    y: 660,
    width: 360,
    height: 340,
    minWidth: 300,
    minHeight: 290,
    kind: 'alerts',
  },
  {
    id: 'reconciliation',
    title: 'Reconciliation Watch',
    eyebrow: 'drift detection',
    x: 1110,
    y: 1060,
    width: 430,
    height: 330,
    minWidth: 330,
    minHeight: 280,
    kind: 'audit',
  },
];

const connections: Array<[WorkspaceModuleId, WorkspaceModuleId]> = [
  ['network', 'liquidity'],
  ['liquidity', 'route-probe'],
  ['route-probe', 'rebalance'],
  ['channels', 'rebalance'],
  ['rebalance', 'alerts'],
  ['network', 'channels'],
];

export function InfiniteCanvas() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const viewportFrameRef = useRef<number | null>(null);
  const stagedViewportRef = useRef<{ zoom: number; pan: { x: number; y: number } } | null>(null);
  const zoomRef = useRef(0.82);
  const panRef = useRef({ x: 44, y: 12 });

  const [zoom, setZoom] = useState(0.82);
  const [pan, setPan] = useState({ x: 44, y: 12 });
  const [modules, setModules] = useState(initialModules);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const [focused, setFocused] = useState<CanvasModuleId | null>(null);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const moduleMap = useMemo(() => new Map(modules.map((item) => [item.id, item])), [modules]);

  const commitViewport = useCallback((nextZoom: number, nextPan: { x: number; y: number }) => {
    zoomRef.current = nextZoom;
    panRef.current = nextPan;
    stagedViewportRef.current = { zoom: nextZoom, pan: nextPan };

    if (viewportFrameRef.current) return;
    viewportFrameRef.current = window.requestAnimationFrame(() => {
      const staged = stagedViewportRef.current;
      if (staged) {
        setZoom(staged.zoom);
        setPan(staged.pan);
      }
      stagedViewportRef.current = null;
      viewportFrameRef.current = null;
    });
  }, []);

  const animateCamera = useCallback((nextZoom: number, nextPan: { x: number; y: number }, duration = 520) => {
    if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    if (viewportFrameRef.current) {
      window.cancelAnimationFrame(viewportFrameRef.current);
      viewportFrameRef.current = null;
      stagedViewportRef.current = null;
    }
    const startedAt = performance.now();
    const startZoom = zoomRef.current;
    const startPan = panRef.current;
    const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

    const tick = (time: number) => {
      const progress = clamp((time - startedAt) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const z = startZoom + (clampedZoom - startZoom) * eased;
      const p = {
        x: startPan.x + (nextPan.x - startPan.x) * eased,
        y: startPan.y + (nextPan.y - startPan.y) * eased,
      };

      zoomRef.current = z;
      panRef.current = p;
      setZoom(z);
      setPan(p);

      if (progress < 1) animationRef.current = window.requestAnimationFrame(tick);
    };

    animationRef.current = window.requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
      if (viewportFrameRef.current) window.cancelAnimationFrame(viewportFrameRef.current);
    };
  }, []);

  const focusModule = useCallback(
    (id: CanvasModuleId) => {
      const target = moduleMap.get(id);
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!target || !rect) return;

      const targetHeight = target.collapsed ? MODULE_HEADER_HEIGHT : target.height;
      const targetZoom = clamp(Math.min(rect.width / (target.width + 240), rect.height / (targetHeight + 220)), 0.6, 1.55);
      const nextPan = {
        x: rect.width / 2 - (target.x + target.width / 2) * targetZoom,
        y: rect.height / 2 - (target.y + targetHeight / 2) * targetZoom,
      };

      setFocused(id);
      animateCamera(targetZoom, nextPan);
    },
    [animateCamera, moduleMap],
  );

  useEffect(() => {
    const handleFocus = (event: Event) => {
      const custom = event as CustomEvent<{ moduleId: WorkspaceModuleId }>;
      if (custom.detail?.moduleId) focusModule(custom.detail.moduleId);
    };
    window.addEventListener('fiber-workspace-focus', handleFocus);
    return () => window.removeEventListener('fiber-workspace-focus', handleFocus);
  }, [focusModule]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') setSpaceDown(true);
      if (event.key === 'Escape') setFocused(null);
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, []);

  useEffect(() => {
    if (!drag) return;

    const move = (event: PointerEvent) => {
      if (drag.mode === 'pan') {
        commitViewport(zoomRef.current, {
          x: drag.originX + event.clientX - drag.startX,
          y: drag.originY + event.clientY - drag.startY,
        });
        return;
      }

      setModules((current) =>
        current.map((item) => {
          if (item.id !== drag.id) return item;

          if (drag.mode === 'resize') {
            return {
              ...item,
              width: Math.max(item.minWidth, (drag.originWidth ?? item.width) + (event.clientX - drag.startX) / zoomRef.current),
              height: Math.max(item.minHeight, (drag.originHeight ?? item.height) + (event.clientY - drag.startY) / zoomRef.current),
              collapsed: false,
            };
          }

          return {
            ...item,
            x: drag.originX + (event.clientX - drag.startX) / zoomRef.current,
            y: drag.originY + (event.clientY - drag.startY) / zoomRef.current,
          };
        }),
      );
    };

    const up = () => setDrag(null);

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [commitViewport, drag]);

  function zoomTowardCursor(event: WheelEvent<HTMLDivElement>) {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nextZoom = clamp(zoomRef.current * Math.exp(-event.deltaY * 0.0012), MIN_ZOOM, MAX_ZOOM);
    if (Math.abs(nextZoom - zoomRef.current) < 0.0005) return;
    const cursorX = (event.clientX - rect.left - panRef.current.x) / zoomRef.current;
    const cursorY = (event.clientY - rect.top - panRef.current.y) / zoomRef.current;
    commitViewport(nextZoom, {
      x: event.clientX - rect.left - cursorX * nextZoom,
      y: event.clientY - rect.top - cursorY * nextZoom,
    });
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (event.shiftKey || (!event.ctrlKey && Math.abs(event.deltaX) > Math.abs(event.deltaY))) {
      commitViewport(zoomRef.current, { x: panRef.current.x - event.deltaX, y: panRef.current.y - event.deltaY });
      return;
    }

    zoomTowardCursor(event);
  }

  function beginPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.button !== 1) return;
    if ((event.target as HTMLElement).closest('[data-workspace-control], [data-module-control]')) return;
    setDrag({
      mode: 'pan',
      startX: event.clientX,
      startY: event.clientY,
      originX: panRef.current.x,
      originY: panRef.current.y,
    });
  }

  function beginMove(item: WorkspaceModule, event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest('[data-module-control]')) return;
    event.stopPropagation();
    setFocused(null);
    setDrag({
      mode: 'move',
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
    });
  }

  function beginResize(item: WorkspaceModule, event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setDrag({
      mode: 'resize',
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      originWidth: item.width,
      originHeight: item.height,
    });
  }

  function updateModule(id: CanvasModuleId, updater: (item: WorkspaceModule) => WorkspaceModule) {
    setModules((current) => current.map((item) => (item.id === id ? updater(item) : item)));
  }

  const fitAll = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const box = modules.reduce(
      (acc, item) => ({
        minX: Math.min(acc.minX, item.x),
        minY: Math.min(acc.minY, item.y),
        maxX: Math.max(acc.maxX, item.x + item.width),
        maxY: Math.max(acc.maxY, item.y + (item.collapsed ? MODULE_HEADER_HEIGHT : item.height)),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );
    const nextZoom = clamp(Math.min(rect.width / (box.maxX - box.minX + 260), rect.height / (box.maxY - box.minY + 220)), 0.25, 1);
    animateCamera(nextZoom, {
      x: rect.width / 2 - ((box.minX + box.maxX) / 2) * nextZoom,
      y: rect.height / 2 - ((box.minY + box.maxY) / 2) * nextZoom,
    });
    setFocused(null);
  }, [animateCamera, modules]);

  const transformStyle: CSSProperties = {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
    transformOrigin: '0 0',
    backgroundImage:
      'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
    backgroundSize: '28px 28px, 112px 112px, 112px 112px',
  };

  return (
    <section
      ref={viewportRef}
      data-testid="infinite-workspace"
      className={cn(
        'relative min-w-0 flex-1 overflow-hidden bg-machine',
        drag?.mode === 'pan' || spaceDown ? 'cursor-grabbing' : drag?.mode === 'move' ? 'cursor-move' : 'cursor-grab',
      )}
      onWheel={handleWheel}
      onPointerDown={beginPan}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:96px_96px]" />

      <div className="absolute left-0 top-0 will-change-transform" style={transformStyle}>
        <ConnectionLayer
          canvasHeight={CANVAS_HEIGHT}
          canvasWidth={CANVAS_WIDTH}
          connections={connections}
          focused={focused}
          moduleHeaderHeight={MODULE_HEADER_HEIGHT}
          modules={moduleMap}
        />
        {modules.map((item, index) => (
          <motion.div
            key={item.id}
            className={cn(
              'workspace-module-card group/module absolute isolate z-10 text-white transition duration-200 will-change-transform',
              focused && focused !== item.id ? 'opacity-25 blur-[1px]' : 'opacity-100',
              focused === item.id ? 'shadow-[0_28px_100px_rgba(255,255,255,0.08)]' : '',
            )}
            style={{
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.collapsed ? MODULE_HEADER_HEIGHT : item.height,
            }}
            initial={{ opacity: 0, rotateX: -8, scale: 0.92, y: 34 }}
            animate={{ opacity: focused && focused !== item.id ? 0.24 : 1, rotateX: 0, scale: 1, y: 0 }}
            whileHover={{ scale: focused && focused !== item.id ? 1 : 1.014, y: -6 }}
            whileTap={{ scale: 0.992 }}
            transition={{ duration: 0.42, delay: index * 0.055, ease: [0.22, 1, 0.36, 1] }}
            onPointerDown={(event) => beginMove(item, event)}
            onDoubleClick={() => focusModule(item.id)}
          >
            <ModuleFrame
              item={item}
              onFocus={() => focusModule(item.id)}
              onToggle={() => updateModule(item.id, (current) => ({ ...current, collapsed: !current.collapsed }))}
              onResize={(event) => beginResize(item, event)}
            >
              <ModuleBody item={item} />
            </ModuleFrame>
          </motion.div>
        ))}
      </div>

      {focused ? (
        <button
          type="button"
          data-workspace-control
          data-testid="exit-focus"
          onClick={() => setFocused(null)}
          className="absolute right-5 top-5 z-30 flex h-10 items-center gap-2 rounded-[16px] border border-white/12 bg-machine px-3 text-xs font-semibold text-white transition hover:border-white/40"
        >
          <X className="h-4 w-4" />
          <span>Exit focus</span>
        </button>
      ) : null}

      <ZoomControls
        zoom={zoom}
        onZoomIn={() => animateCamera(zoomRef.current + 0.12, panRef.current, 160)}
        onZoomOut={() => animateCamera(zoomRef.current - 0.12, panRef.current, 160)}
        onReset={() => {
          setFocused(null);
          animateCamera(0.82, { x: 44, y: 12 });
        }}
        onFit={fitAll}
      />
    </section>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
