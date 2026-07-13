'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ChevronDown,
  Focus,
  GitBranch,
  Grip,
  Maximize2,
  Minimize2,
  MousePointer2,
  Network,
  Plus,
  Radar,
  RefreshCw,
  Route,
  Square,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';
import { focusWorkspaceModule, type WorkspaceModuleId } from '@/lib/workspace';
import { cn } from '@/lib/utils';

interface WorkspaceModule {
  id: WorkspaceModuleId;
  title: string;
  eyebrow: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  kind: 'network' | 'liquidity' | 'route' | 'rebalance' | 'channels' | 'alerts' | 'audit';
  collapsed?: boolean;
}

interface DragState {
  mode: 'pan' | 'move' | 'resize';
  id?: WorkspaceModuleId;
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
    height: 300,
    minWidth: 330,
    minHeight: 250,
    kind: 'liquidity',
  },
  {
    id: 'route-probe',
    title: 'Route Simulation',
    eyebrow: 'can i pay',
    x: 1300,
    y: 160,
    width: 460,
    height: 340,
    minWidth: 350,
    minHeight: 270,
    kind: 'route',
  },
  {
    id: 'channels',
    title: 'Channel Inspector',
    eyebrow: 'channel 4 selected',
    x: 190,
    y: 650,
    width: 440,
    height: 320,
    minWidth: 350,
    minHeight: 270,
    kind: 'channels',
  },
  {
    id: 'rebalance',
    title: 'Rebalancing Engine',
    eyebrow: 'liquidity movement',
    x: 800,
    y: 560,
    width: 460,
    height: 340,
    minWidth: 350,
    minHeight: 280,
    kind: 'rebalance',
  },
  {
    id: 'alerts',
    title: 'Alert Timeline',
    eyebrow: 'operator attention',
    x: 1410,
    y: 660,
    width: 360,
    height: 300,
    minWidth: 300,
    minHeight: 250,
    kind: 'alerts',
  },
  {
    id: 'reconciliation',
    title: 'Reconciliation Watch',
    eyebrow: 'drift detection',
    x: 1110,
    y: 1060,
    width: 430,
    height: 290,
    minWidth: 330,
    minHeight: 240,
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
  const zoomRef = useRef(0.82);
  const panRef = useRef({ x: 44, y: 12 });

  const [zoom, setZoom] = useState(0.82);
  const [pan, setPan] = useState({ x: 44, y: 12 });
  const [modules, setModules] = useState(initialModules);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const [focused, setFocused] = useState<WorkspaceModuleId | null>(null);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const moduleMap = useMemo(() => new Map(modules.map((item) => [item.id, item])), [modules]);

  const animateCamera = useCallback((nextZoom: number, nextPan: { x: number; y: number }, duration = 520) => {
    if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
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

  const focusModule = useCallback(
    (id: WorkspaceModuleId) => {
      const target = moduleMap.get(id);
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!target || !rect) return;

      const targetHeight = target.collapsed ? 76 : target.height;
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
        const nextPan = {
          x: drag.originX + event.clientX - drag.startX,
          y: drag.originY + event.clientY - drag.startY,
        };
        panRef.current = nextPan;
        setPan(nextPan);
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
  }, [drag]);

  function zoomTowardCursor(event: WheelEvent<HTMLDivElement>) {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nextZoom = clamp(zoomRef.current * Math.exp(-event.deltaY * 0.0012), MIN_ZOOM, MAX_ZOOM);
    const cursorX = (event.clientX - rect.left - panRef.current.x) / zoomRef.current;
    const cursorY = (event.clientY - rect.top - panRef.current.y) / zoomRef.current;
    const nextPan = {
      x: event.clientX - rect.left - cursorX * nextZoom,
      y: event.clientY - rect.top - cursorY * nextZoom,
    };

    zoomRef.current = nextZoom;
    panRef.current = nextPan;
    setZoom(nextZoom);
    setPan(nextPan);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.shiftKey || (!event.ctrlKey && Math.abs(event.deltaX) > Math.abs(event.deltaY))) {
      const nextPan = { x: panRef.current.x - event.deltaX, y: panRef.current.y - event.deltaY };
      panRef.current = nextPan;
      setPan(nextPan);
      return;
    }

    zoomTowardCursor(event);
  }

  function beginPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.button !== 1) return;
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

  function updateModule(id: WorkspaceModuleId, updater: (item: WorkspaceModule) => WorkspaceModule) {
    setModules((current) => current.map((item) => (item.id === id ? updater(item) : item)));
  }

  function fitAll() {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const box = modules.reduce(
      (acc, item) => ({
        minX: Math.min(acc.minX, item.x),
        minY: Math.min(acc.minY, item.y),
        maxX: Math.max(acc.maxX, item.x + item.width),
        maxY: Math.max(acc.maxY, item.y + (item.collapsed ? 76 : item.height)),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );
    const nextZoom = clamp(Math.min(rect.width / (box.maxX - box.minX + 260), rect.height / (box.maxY - box.minY + 220)), 0.25, 1);
    animateCamera(nextZoom, {
      x: rect.width / 2 - ((box.minX + box.maxX) / 2) * nextZoom,
      y: rect.height / 2 - ((box.minY + box.maxY) / 2) * nextZoom,
    });
    setFocused(null);
  }

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
        spaceDown || drag?.mode === 'pan' ? 'cursor-grabbing' : 'cursor-default',
      )}
      onWheel={handleWheel}
      onPointerDown={beginPan}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:96px_96px]" />
      <div className="pointer-events-none absolute left-5 top-4 z-20 flex items-center gap-3 rounded-[4px] border border-white/12 bg-machine px-3 py-2 text-white">
        <span className="h-2 w-2 animate-pulse rounded-full border border-white/70 bg-transparent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">Workspace live</span>
        {focused ? <span className="font-mono text-[10px] text-white/32">focus: {moduleMap.get(focused)?.title}</span> : null}
      </div>

      <div className="absolute left-0 top-0 will-change-transform" style={transformStyle}>
        <ConnectionLayer modules={moduleMap} focused={focused} />
        {modules.map((item, index) => (
          <motion.div
            key={item.id}
            className={cn(
              'absolute z-10 rounded-[6px] border border-white/12 bg-ink-editorial text-white transition duration-200 will-change-transform',
              focused && focused !== item.id ? 'opacity-25 blur-[1px]' : 'opacity-100',
              focused === item.id ? 'border-white/60' : 'hover:border-white/28',
            )}
            style={{
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.collapsed ? 76 : item.height,
            }}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: focused && focused !== item.id ? 0.24 : 1, scale: 1, y: 0 }}
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
          data-testid="exit-focus"
          onClick={() => setFocused(null)}
          className="absolute right-5 top-5 z-30 flex h-10 items-center gap-2 rounded-[4px] border border-white/12 bg-machine px-3 text-xs font-semibold text-white transition hover:border-white/40"
        >
          <X className="h-4 w-4" />
          Exit focus
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
      <WorkspaceToolbar />
    </section>
  );
}

function ModuleFrame({
  item,
  children,
  onFocus,
  onToggle,
  onResize,
}: {
  item: WorkspaceModule;
  children: ReactNode;
  onFocus: () => void;
  onToggle: () => void;
  onResize: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[6px]">
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/12 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-white/14 bg-machine-panel-high">
            <ModuleKindIcon kind={item.kind} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-white/34">{item.eyebrow}</p>
            <h3 className="mt-1 truncate text-sm font-bold text-white">{item.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1" data-module-control>
          <button type="button" aria-label="Focus module" onClick={onFocus} className="flex h-8 w-8 items-center justify-center rounded-[4px] text-white/44 transition hover:border hover:border-white/20 hover:text-white">
            <Focus className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Collapse module" onClick={onToggle} className="flex h-8 w-8 items-center justify-center rounded-[4px] text-white/44 transition hover:border hover:border-white/20 hover:text-white">
            {item.collapsed ? <ChevronDown className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <Grip className="h-4 w-4 text-white/18" />
        </div>
      </div>
      {item.collapsed ? null : <div className="min-h-0 flex-1 overflow-hidden p-4">{children}</div>}
      {!item.collapsed ? (
        <button
          type="button"
          data-module-control
          aria-label="Resize module"
          onPointerDown={onResize}
          className="absolute bottom-2 right-2 flex h-7 w-7 cursor-nwse-resize items-center justify-center rounded-[4px] text-white/22 transition hover:border hover:border-white/20 hover:text-white"
        >
          <Maximize2 className="h-4 w-4 rotate-45" />
        </button>
      ) : null}
    </div>
  );
}

function ModuleBody({ item }: { item: WorkspaceModule }) {
  if (item.kind === 'network') return <NetworkGraph />;
  if (item.kind === 'liquidity') return <LiquidityMap />;
  if (item.kind === 'route') return <RouteSimulation />;
  if (item.kind === 'rebalance') return <RebalanceEngine />;
  if (item.kind === 'channels') return <ChannelInspector />;
  if (item.kind === 'alerts') return <AlertTimeline />;
  return <ReconciliationModule />;
}

function ConnectionLayer({ modules, focused }: { modules: Map<WorkspaceModuleId, WorkspaceModule>; focused: WorkspaceModuleId | null }) {
  return (
    <svg className="absolute inset-0 z-0 h-full w-full overflow-visible" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-hidden>
      {connections.map(([from, to], index) => {
        const a = modules.get(from);
        const b = modules.get(to);
        if (!a || !b) return null;
        const start = { x: a.x + a.width, y: a.y + (a.collapsed ? 76 : a.height) / 2 };
        const end = { x: b.x, y: b.y + (b.collapsed ? 76 : b.height) / 2 };
        const active = focused === from || focused === to;
        const d = `M ${start.x} ${start.y} C ${start.x + 140} ${start.y}, ${end.x - 140} ${end.y}, ${end.x} ${end.y}`;
        return (
          <g key={`${from}-${to}`}>
            <motion.path
              d={d}
              fill="none"
              stroke={active ? 'rgba(255,255,255,0.48)' : 'rgba(255,255,255,0.14)'}
              strokeWidth={active ? 1.8 : 1}
              strokeDasharray="8 9"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.08, ease: 'easeOut' }}
            />
            <circle cx={start.x} cy={start.y} r="3.5" fill="#0A0A0A" stroke="rgba(255,255,255,0.28)" />
            <circle cx={end.x} cy={end.y} r="3.5" fill="#0A0A0A" stroke="rgba(255,255,255,0.28)" />
          </g>
        );
      })}
    </svg>
  );
}

function NetworkGraph() {
  const points = [
    [58, 154],
    [138, 86],
    [232, 132],
    [334, 72],
    [392, 202],
    [208, 230],
    [102, 248],
  ];

  return (
    <div className="relative h-full overflow-hidden rounded-[4px] border border-white/12 bg-machine">
      <svg viewBox="0 0 460 260" className="h-full w-full" aria-hidden>
        {points.slice(1).map(([x, y], index) => (
          <line key={`${x}-${y}`} x1={points[index][0]} y1={points[index][1]} x2={x} y2={y} stroke="rgba(255,255,255,0.22)" strokeDasharray="6 7" />
        ))}
        <path d="M58 154 C168 30 276 284 392 202" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" fill="none" />
        {points.map(([x, y], index) => (
          <g key={`${x}-${y}`}>
            <motion.circle cx={x} cy={y} r={index === 2 ? 13 : 9} fill={index === 2 ? '#F5F5F5' : '#111'} stroke="rgba(255,255,255,0.75)" animate={{ opacity: [0.65, 1, 0.65] }} transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.18 }} />
            <text x={x} y={y + 28} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.42)" fontFamily="monospace">
              N{index + 9}
            </text>
          </g>
        ))}
        <motion.circle r="4" fill="#fff" animate={{ cx: [58, 138, 232, 334, 392], cy: [154, 86, 132, 72, 202] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'linear' }} />
      </svg>
      <div className="absolute bottom-3 left-3 rounded-[4px] border border-white/12 bg-machine px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/36">liquidity moving</p>
        <p className="mt-1 text-sm font-semibold">7 peers / 4 monitored channels</p>
      </div>
    </div>
  );
}

function LiquidityMap() {
  const rows = [
    ['chan-01', 78, 'balanced'],
    ['chan-02', 36, 'thin outbound'],
    ['chan-03', 18, 'critical'],
    ['chan-04', 64, 'recovering'],
  ] as const;

  return (
    <div className="grid h-full grid-cols-[1fr_120px] gap-4">
      <div className="space-y-3">
        {rows.map(([label, value, state]) => (
          <button
            key={label}
            type="button"
            onClick={() => focusWorkspaceModule('channels')}
            className="block w-full rounded-[4px] border border-white/12 bg-machine-panel-high p-3 text-left transition hover:border-white/28"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-white/72">{label}</span>
              <span className="text-[11px] text-white/38">{state}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-white/80 transition-[width] duration-700" style={{ width: `${value}%` }} />
            </div>
          </button>
        ))}
      </div>
      <div className="rounded-[4px] border border-white/12 bg-machine-panel-high p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">Health</p>
        <p className="mt-4 text-4xl font-black">78</p>
        <p className="mt-2 text-xs leading-5 text-white/42">Outbound capacity remains visible before payment attempts.</p>
      </div>
    </div>
  );
}

function RouteSimulation() {
  return (
    <div className="flex h-full flex-col">
      <div className="rounded-[4px] border border-white/12 bg-machine-panel-high p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">pre-flight result</p>
          <span className="rounded-full border border-white/12 px-2 py-1 text-[10px] text-white/52">confidence 82%</span>
        </div>
        <div className="mt-5 flex items-center gap-2">
          {['A', 'B', 'C', 'D', 'E'].map((hop, index) => (
            <div key={hop} className="flex items-center gap-2">
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs', index === 2 ? 'border-white bg-white text-black' : 'border-white/16 bg-black text-white/72')}>
                {hop}
              </span>
              {index < 4 ? <span className={cn('h-px w-10 border-t border-dashed', index === 1 ? 'border-white/70' : 'border-white/18')} /> : null}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
        <MiniMetric label="fee ceiling" value="0.003 CKB" />
        <MiniMetric label="bottleneck" value="hop C" />
        <MiniMetric label="alt routes" value="3" />
        <MiniMetric label="status" value="payable" />
      </div>
    </div>
  );
}

function RebalanceEngine() {
  return (
    <div className="relative h-full overflow-hidden rounded-[4px] border border-white/12 bg-machine p-4">
      <div className="grid h-full grid-cols-2 gap-4">
        <Pool label="source" amount="8.42 CKB" fill="82%" />
        <Pool label="destination" amount="2.19 CKB" fill="31%" />
      </div>
      <motion.div
        className="absolute left-[26%] top-1/2 h-1 w-24 rounded-full bg-white"
        animate={{ x: [0, 132, 0], opacity: [0.1, 0.9, 0.1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <button
        type="button"
        onClick={() => focusWorkspaceModule('rebalance')}
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-[4px] border border-white bg-white px-4 py-2 text-xs font-bold text-black"
      >
        Inspect flow
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ChannelInspector() {
  return (
    <div className="h-full space-y-3 overflow-hidden">
      {[
        ['channel 1', 'healthy', '72%'],
        ['channel 2', 'warning', '44%'],
        ['channel 3', 'critical', '18%'],
        ['channel 4', 'selected', '64%'],
      ].map(([name, state, value]) => (
        <button key={name} type="button" onClick={() => focusWorkspaceModule('liquidity')} className="flex w-full items-center justify-between rounded-[4px] border border-white/12 bg-machine-panel-high px-3 py-3 text-left transition hover:border-white/28">
          <div>
            <p className="font-mono text-xs text-white/72">{name}</p>
            <p className="mt-1 text-[11px] text-white/34">{state}</p>
          </div>
          <span className="font-mono text-xs text-white">{value}</span>
        </button>
      ))}
    </div>
  );
}

function AlertTimeline() {
  const alerts = ['Outbound below 20%', 'Probe failed at hop C', 'Rebalance queued', 'Snapshot drift surfaced'];
  return (
    <div className="h-full rounded-[4px] border border-white/12 bg-machine-panel-high p-4">
      {alerts.map((alert, index) => (
        <div key={alert} className="relative border-l border-white/12 pb-5 pl-5 last:pb-0">
          <span className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-white" />
          <p className="text-sm font-semibold">{alert}</p>
          <p className="mt-1 font-mono text-[10px] text-white/34">{index + 2}m ago</p>
        </div>
      ))}
    </div>
  );
}

function ReconciliationModule() {
  return (
    <div className="grid h-full grid-cols-2 gap-3">
      <MiniMetric label="snapshot" value="synced" />
      <MiniMetric label="drift" value="0.02 CKB" />
      <MiniMetric label="ledger" value="double-entry" />
      <MiniMetric label="authority" value="fiber node" />
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[4px] border border-white/12 bg-machine-panel-high p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">{label}</p>
      <p className="mt-3 truncate text-lg font-black text-white">{value}</p>
    </div>
  );
}

function Pool({ label, amount, fill }: { label: string; amount: string; fill: string }) {
  return (
    <div className="flex flex-col justify-between rounded-[4px] border border-white/12 bg-machine-panel-high p-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">{label}</p>
        <p className="mt-2 text-2xl font-black">{amount}</p>
      </div>
      <div className="h-28 overflow-hidden rounded-[4px] border border-white/12 bg-machine">
        <motion.div
          className="mt-auto h-full bg-white/70"
          style={{ transformOrigin: 'bottom', height: fill }}
          animate={{ opacity: [0.45, 0.86, 0.45] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}) {
  return (
    <div data-testid="zoom-controls" className="absolute bottom-5 left-5 z-30 flex h-10 items-center gap-1 rounded-[4px] border border-white/12 bg-machine px-2 text-white">
      <button type="button" aria-label="Zoom out" onClick={onZoomOut} className="h-7 w-7 rounded-[3px] text-white/60 transition hover:border hover:border-white/20 hover:text-white">
        -
      </button>
      <button type="button" data-testid="zoom-label" onClick={onReset} className="min-w-14 rounded-[3px] px-2 font-mono text-xs text-white/72 transition hover:border hover:border-white/20">
        {Math.round(zoom * 100)}%
      </button>
      <button type="button" aria-label="Zoom in" onClick={onZoomIn} className="h-7 w-7 rounded-[3px] text-white/60 transition hover:border hover:border-white/20 hover:text-white">
        +
      </button>
      <button type="button" aria-label="Fit modules" onClick={onFit} className="flex h-7 w-7 items-center justify-center rounded-[3px] text-white/60 transition hover:border hover:border-white/20 hover:text-white">
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function WorkspaceToolbar() {
  const tools = [
    { label: 'Select', icon: MousePointer2, active: true },
    { label: 'Frame', icon: Square },
    { label: 'Route', icon: Route },
    { label: 'Network', icon: Network },
  ];

  return (
    <div data-testid="bottom-toolbar" className="absolute bottom-5 left-1/2 z-30 flex h-12 -translate-x-1/2 items-center gap-1 rounded-[4px] border border-white/12 bg-machine px-2 text-white">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button key={tool.label} type="button" aria-label={tool.label} className={cn('flex h-9 w-9 items-center justify-center rounded-[3px] transition', tool.active ? 'bg-white text-black' : 'text-white/42 hover:border hover:border-white/20 hover:text-white')}>
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
      <button type="button" aria-label="Add module" onClick={() => focusWorkspaceModule('network')} className="ml-1 flex h-9 w-9 items-center justify-center rounded-[3px] bg-white text-black transition hover:bg-white/90">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function ModuleKindIcon({ kind }: { kind: WorkspaceModule['kind'] }) {
  const className = 'h-4 w-4 text-white/70';
  if (kind === 'network') return <Network className={className} />;
  if (kind === 'liquidity') return <BarChart3 className={className} />;
  if (kind === 'route') return <Radar className={className} />;
  if (kind === 'rebalance') return <RefreshCw className={className} />;
  if (kind === 'channels') return <GitBranch className={className} />;
  if (kind === 'alerts') return <AlertTriangle className={className} />;
  return <AlertTriangle className={className} />;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
