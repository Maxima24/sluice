'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { cn } from '@/lib/utils';

const gridColumns = Array.from({ length: 21 }, (_, index) => index * 80);
const gridRows = Array.from({ length: 13 }, (_, index) => index * 80);
const wordmark = ['S', 'l', 'u', 'i', 'c', 'e'];

// Boot operation copy: one set is selected per reload so the startup feels alive.
const operationSets = [
  ['DISCOVERING CHANNELS', 'VERIFYING PEERS', 'BUILDING ROUTING GRAPH', 'CALCULATING LIQUIDITY', 'LOADING WORKSPACE'],
  ['NEGOTIATING CHANNEL STATE', 'RECONCILING LEDGER', 'UPDATING ROUTE GRAPH', 'VALIDATING CAPACITY', 'INITIALIZING OPERATOR CONSOLE'],
  ['READING NODE STATE', 'SYNCHRONIZING PEERS', 'MAPPING CHANNELS', 'CHECKING LIQUIDITY', 'ASSEMBLING WORKSPACE'],
];

// Stage 3/5 data: alternate Fiber topologies used by the network construction and pulse animations.
const topologyVariants = [
  {
    origin: { x: 500, y: 280 },
    loop: 'M500 280C410 178 294 162 236 238C178 314 250 416 386 394C520 372 580 250 704 212C814 178 884 274 812 360C736 450 584 394 500 280',
    nodes: [
      { id: 'NODE 00', x: 500, y: 280 },
      { id: 'CHAN 01', x: 236, y: 238 },
      { id: 'PEER 02', x: 386, y: 394 },
      { id: 'ROUTE 03', x: 704, y: 212 },
      { id: 'LIQ 04', x: 812, y: 360 },
      { id: 'EDGE 05', x: 584, y: 394 },
    ],
    paths: [
      'M500 280C438 216 324 200 236 238',
      'M236 238C198 304 252 384 386 394',
      'M386 394C460 360 494 310 500 280',
      'M500 280C572 226 632 218 704 212',
      'M704 212C802 212 860 284 812 360',
      'M812 360C734 418 648 430 584 394',
      'M584 394C548 354 524 314 500 280',
    ],
  },
  {
    origin: { x: 500, y: 280 },
    loop: 'M500 280L334 176H666L812 280L666 384H334L188 280L334 176',
    nodes: [
      { id: 'NODE 00', x: 500, y: 280 },
      { id: 'CHAN 01', x: 334, y: 176 },
      { id: 'PEER 02', x: 666, y: 176 },
      { id: 'ROUTE 03', x: 812, y: 280 },
      { id: 'LIQ 04', x: 666, y: 384 },
      { id: 'EDGE 05', x: 334, y: 384 },
    ],
    paths: [
      'M500 280L334 176',
      'M334 176H666',
      'M666 176L812 280',
      'M812 280L666 384',
      'M666 384H334',
      'M334 384L188 280',
      'M188 280L334 176',
      'M334 384L500 280',
      'M500 280L666 176',
    ],
  },
  {
    origin: { x: 270, y: 280 },
    loop: 'M270 280C318 174 456 138 566 202C676 266 744 172 846 246C930 308 864 440 720 390C594 346 500 448 384 386C292 336 224 368 270 280',
    nodes: [
      { id: 'NODE 00', x: 270, y: 280 },
      { id: 'CHAN 01', x: 430, y: 174 },
      { id: 'PEER 02', x: 566, y: 202 },
      { id: 'ROUTE 03', x: 846, y: 246 },
      { id: 'LIQ 04', x: 720, y: 390 },
      { id: 'EDGE 05', x: 384, y: 386 },
    ],
    paths: [
      'M270 280C302 214 356 184 430 174',
      'M430 174C484 164 522 176 566 202',
      'M566 202C662 260 746 174 846 246',
      'M846 246C898 316 848 382 720 390',
      'M720 390C590 350 512 438 384 386',
      'M384 386C300 348 230 356 270 280',
      'M270 280C398 280 526 282 720 390',
    ],
  },
  {
    origin: { x: 748, y: 246 },
    loop: 'M748 246C690 130 520 158 462 256C404 354 286 182 182 304C104 396 254 474 388 392C500 324 570 454 710 404C852 354 818 278 748 246',
    nodes: [
      { id: 'NODE 00', x: 748, y: 246 },
      { id: 'CHAN 01', x: 462, y: 256 },
      { id: 'PEER 02', x: 182, y: 304 },
      { id: 'ROUTE 03', x: 388, y: 392 },
      { id: 'LIQ 04', x: 710, y: 404 },
      { id: 'EDGE 05', x: 570, y: 178 },
    ],
    paths: [
      'M748 246C680 182 616 160 570 178',
      'M570 178C512 194 482 226 462 256',
      'M462 256C368 330 300 188 182 304',
      'M182 304C138 380 260 456 388 392',
      'M388 392C492 326 562 454 710 404',
      'M710 404C822 360 834 282 748 246',
      'M748 246C640 314 534 340 388 392',
    ],
  },
];

export const DEFAULT_BOOT_VARIANT = 1;
export const BOOT_TOPOLOGY_VARIANT_COUNT = topologyVariants.length;

const constructionPaths = [
  'M500 280H500',
  'M500 280V280',
  'M500 280L500 280',
  'M500 280L500 280',
];

// Stage 8 data: interface wireframe paths that draw into the app shell.
const interfacePaths = [
  'M110 128H246V492H110Z',
  'M286 128H674V492H286Z',
  'M714 128H900V492H714Z',
  'M286 128H900V184H286Z',
  'M320 226H520V360H320Z',
  'M548 226H650V360H548Z',
  'M742 226H872V314H742Z',
  'M742 338H872V456H742Z',
];

const statusMetrics = [
  { label: 'Peers', target: 247, suffix: '' },
  { label: 'Channels', target: 1430, suffix: '' },
  { label: 'Liquidity', target: 1, suffix: 'Synced' },
  { label: 'Latency', target: 2.3, suffix: ' ms' },
];

type BootState = 'checking' | 'running' | 'done';

// Runtime-only boot gate: resets on browser reload, but survives client-side route changes.
let bootedInCurrentRuntime = false;

interface OperatorBootLoaderProps {
  preview?: boolean;
  variant?: number;
}

export function OperatorBootLoader({ preview = false, variant = DEFAULT_BOOT_VARIANT }: OperatorBootLoaderProps = {}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<BootState>(() => (!preview && bootedInCurrentRuntime ? 'done' : 'checking'));
  const [variantIndex, setVariantIndex] = useState(() => (preview ? variant % topologyVariants.length : DEFAULT_BOOT_VARIANT));

  // Mount gate: play the boot sequence on refresh/full load only, unless preview mode is enabled.
  useEffect(() => {
    if (state !== 'checking') return;

    const frame = window.requestAnimationFrame(() => {
      if (!preview && bootedInCurrentRuntime) {
        setState('done');
        return;
      }

      setVariantIndex(preview ? variant % topologyVariants.length : DEFAULT_BOOT_VARIANT);
      setState('running');
    });

    return () => window.cancelAnimationFrame(frame);
  }, [preview, state, variant]);

  useEffect(() => {
    if (state !== 'running' || !rootRef.current) return;

    gsap.registerPlugin(MotionPathPlugin);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = rootRef.current;

    const context = gsap.context(() => {
      const rootRect = root.getBoundingClientRect();
      const originRevealScale =
        rootRect.width > 0 && rootRect.height > 0 ? Math.ceil(Math.hypot(rootRect.width, rootRect.height) / 20) + 8 : 140;
      const reversePathLength = (_index: number, target: Element) => (target as SVGPathElement).getTotalLength();

      // Reduced motion fallback: show the wordmark briefly, then release the app.
      if (reducedMotion) {
        gsap
          .timeline({
            onComplete: () => {
              if (!preview) bootedInCurrentRuntime = true;
              if (!preview) setState('done');
            },
          })
          .set('[data-boot-content]', { autoAlpha: 1 })
          .set('[data-boot-scrim]', { autoAlpha: 0 })
          .set('[data-white-gate]', { autoAlpha: 0, scale: 0 })
          .set('[data-boot-word]', { opacity: 1, scale: 1, filter: 'blur(0px)' })
          .to(root, preview ? { opacity: 1, duration: 0.18 } : { opacity: 0, duration: 0.18 }, 0.2);
        return;
      }

      const drawTargets = gsap.utils.toArray<SVGPathElement>('[data-draw]');
      drawTargets.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      // Master timeline: all boot stages are synchronized from this single GSAP sequence.
      const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          if (!preview) {
            bootedInCurrentRuntime = true;
            setState('done');
          }
        },
      });

      timeline
        // Initial state: black screen with every animated system hidden, collapsed, or blurred.
        .set(root, { autoAlpha: 1, yPercent: 0, willChange: 'transform, opacity' })
        .set('[data-boot-scrim]', { autoAlpha: 1 })
        .set('[data-boot-content]', { autoAlpha: 1, scale: 1, x: 0, y: 0, transformOrigin: '50% 50%', willChange: 'opacity', force3D: true })
        .set('[data-wordmark-stage]', { scale: 1, y: 0, opacity: 1, transformOrigin: '50% 50%', willChange: 'opacity', force3D: true })
        .set('[data-white-gate]', {
          autoAlpha: 0,
          left: '50%',
          top: '50%',
          xPercent: -50,
          yPercent: -50,
          scale: 0,
          borderRadius: '999px',
          transformOrigin: '50% 50%',
          willChange: 'transform, opacity, border-radius',
          force3D: true,
        })
        .set('[data-origin-dot]', { scale: 0, opacity: 0, filter: 'blur(10px)' })
        .set('[data-grid-line]', { opacity: 0 })
        .set('[data-node-group]', { scale: 0.54, opacity: 1, filter: 'blur(16px)', transformOrigin: 'center center' })
        .set('[data-node-label]', { clipPath: 'inset(0 100% 0 0)' })
        .set('[data-route-pulse]', { opacity: 0 })
        .set('[data-boot-op]', { y: 12, clipPath: 'inset(0 100% 0 0)', color: 'rgba(255,255,255,0.28)' })
        .set('[data-boot-word]', { y: 34, x: (index) => (index - (wordmark.length - 1) / 2) * 18, opacity: 0, filter: 'blur(10px)' })
        .set('[data-status-panel]', { y: 18, clipPath: 'inset(0 0 100% 0)' })
        .set('[data-status-value]', { textContent: '0' })
        .set('[data-interface-path]', { opacity: 0 })
        .set('[data-interface-card]', { scaleY: 0, opacity: 1, transformOrigin: 'top center', filter: 'blur(10px)' })
        // Stage 1: origin dot powers on and pulses once.
        .to('[data-origin-dot]', { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.32, ease: 'sine.out' }, 0.2)
        .to('[data-origin-dot]', { scale: 1.9, duration: 0.24, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.52)
        // Stage 2: CAD coordinate expansion and engineering grid reveal.
        .to('[data-construction-x]', { attr: { d: 'M110 280H890' }, duration: 0.5, ease: 'power3.inOut' }, 0.68)
        .to('[data-construction-y]', { attr: { d: 'M500 68V492' }, duration: 0.5, ease: 'power3.inOut' }, 0.68)
        .to('[data-construction-a]', { attr: { d: 'M188 84.5L812 475.5' }, duration: 0.44, ease: 'power3.inOut' }, 0.98)
        .to('[data-construction-b]', { attr: { d: 'M812 84.5L188 475.5' }, duration: 0.44, ease: 'power3.inOut' }, 0.98)
        .to('[data-grid-line]', { opacity: 0.18, duration: 0.68, stagger: 0.006, ease: 'sine.out' }, 1.12)
        // Stage 3: Fiber topology paths draw in, then nodes and labels assemble.
        .to('[data-network-path]', { strokeDashoffset: 0, duration: 0.92, stagger: 0.06, ease: 'power3.out' }, 1.28)
        .to('[data-node-group]', { scale: 1, filter: 'blur(0px)', duration: 0.58, stagger: 0.055, ease: 'power3.out' }, 1.42)
        .to('[data-node-label]', { clipPath: 'inset(0 0% 0 0)', duration: 0.34, stagger: 0.055, ease: 'power2.out' }, 1.66)
        // Stage 4: route discovery operation log scans through boot tasks.
        .to('[data-boot-op]', { clipPath: 'inset(0 0% 0 0)', duration: 0.24, stagger: 0.4, ease: 'power2.out' }, 1.82)
        .to('[data-boot-op]', { y: 0, duration: 0.36, stagger: 0.4, ease: 'power2.out' }, 1.82)
        .to('[data-boot-op]', { color: 'rgba(255,255,255,0.86)', duration: 0.18, stagger: 0.4, ease: 'sine.out' }, 1.94)
        .to('[data-boot-op]', { color: 'rgba(255,255,255,0.34)', duration: 0.24, stagger: 0.4, ease: 'sine.inOut' }, 2.26)
        // Stage 5: Fiber pulse travels through the graph and wakes each node ring.
        .to('[data-route-pulse]', { opacity: 1, duration: 0.12, ease: 'sine.out' }, 2.76)
        .to(
          '[data-route-pulse]',
          {
            motionPath: {
              path: '#fiber-pulse-loop',
              align: '#fiber-pulse-loop',
              autoRotate: false,
              start: 0,
              end: 1,
            },
            duration: 1.34,
            ease: 'none',
          },
          2.8,
        )
        .to('[data-node-ring]', { scale: 1.42, duration: 0.24, stagger: 0.11, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 2.86)
        // Stage 6: Sluice wordmark machines into place.
        .to('[data-boot-word]', { x: 0, y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, stagger: 0.045, ease: 'power4.out' }, 3.22)
        .to('[data-boot-word]', { y: -8, scale: 0.985, duration: 0.72, stagger: 0.018, ease: 'sine.inOut' }, 4.02)
        // Stage 7: operating diagnostics open and numeric counters come online.
        // .to('[data-status-panel]', { y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.38 }, 3.58)
        .add(() => animateCounters(root), 3.7)
        // Stage 8: dashboard wireframe and interface cards are constructed.
        // .to('[data-interface-path]', { strokeDashoffset: 0, opacity: 0.42, duration: 0.7, stagger: 0.045 }, 3.92)
        // .to('[data-interface-card]', { scaleY: 1, filter: 'blur(0px)', duration: 0.44, stagger: 0.055 }, 4.14)
        // Stage 9: reverse the boot sequence back into the original white origin dot.
        .to('[data-final-breath]', { scale: 1.2, opacity: 0.84, duration: 0.34, stagger: 0.045, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 4.58)
        .to(
          '[data-boot-word]',
          {
            y: 30,
            x: (index) => (index - (wordmark.length - 1) / 2) * -12,
            opacity: 0,
            filter: 'blur(10px)',
            duration: 0.42,
            stagger: { each: 0.035, from: 'edges' },
            ease: 'power3.in',
          },
          4.78,
        )
        .to(
          '[data-boot-op]',
          { y: -10, clipPath: 'inset(0 0 0 100%)', opacity: 0, duration: 0.34, stagger: 0.04, ease: 'power2.in' },
          4.82,
        )
        .to('[data-node-label]', { clipPath: 'inset(0 100% 0 0)', duration: 0.25, stagger: 0.035, ease: 'power2.in' }, 4.86)
        .to('[data-route-pulse]', { opacity: 0, duration: 0.16, ease: 'sine.in' }, 4.9)
        .to(
          '[data-node-group]',
          { scale: 0.48, opacity: 0, filter: 'blur(14px)', duration: 0.42, stagger: { each: 0.045, from: 'end' }, ease: 'power3.in' },
          4.98,
        )
        .to(
          '[data-network-path]',
          { strokeDashoffset: reversePathLength, duration: 0.52, stagger: { each: 0.035, from: 'end' }, ease: 'power3.inOut' },
          4.96,
        )
        .to('[data-grid-line]', { opacity: 0, duration: 0.36, stagger: 0.002, ease: 'sine.inOut' }, 5.08)
        .to('[data-construction-a]', { attr: { d: 'M500 280L500 280' }, duration: 0.38, ease: 'power3.inOut' }, 5.08)
        .to('[data-construction-b]', { attr: { d: 'M500 280L500 280' }, duration: 0.38, ease: 'power3.inOut' }, 5.08)
        .to('[data-construction-x]', { attr: { d: 'M500 280H500' }, duration: 0.38, ease: 'power3.inOut' }, 5.12)
        .to('[data-construction-y]', { attr: { d: 'M500 280V280' }, duration: 0.38, ease: 'power3.inOut' }, 5.12)
        // Stage 10: the origin dot becomes the white transition field that reveals the app.
        .to('[data-origin-dot]', { scale: 2.35, opacity: 1, filter: 'blur(0px)', duration: 0.28, ease: 'power2.out' }, 5.36)
        .to('[data-white-gate]', { autoAlpha: 1, scale: originRevealScale, borderRadius: '0px', duration: 0.82, ease: 'expo.inOut' }, 5.52)
        .to('[data-boot-scrim]', { autoAlpha: 0, duration: 0.12, ease: 'none' }, 6.04)
        .to('[data-boot-content]', { autoAlpha: 0, duration: 0.2, ease: 'sine.inOut' }, 6.08);

      // Preview mode holds the final composition; production wipes the loader into the app.
      if (preview) {
        timeline.to('[data-white-gate]', { autoAlpha: 0, duration: 0.64, ease: 'sine.inOut' }, 6.56);
      } else {
        timeline.to(root, { autoAlpha: 0, duration: 0.64, ease: 'sine.inOut' }, 6.42);
      }
    }, root);

    return () => context.revert();
  }, [preview, state, variantIndex]);

  if (state === 'done') return null;

  const isChecking = state === 'checking';
  const topology = topologyVariants[variantIndex];
  const operations = operationSets[variantIndex % operationSets.length];

  return (
    <div
      ref={rootRef}
      className={cn(
        'overflow-hidden text-white',
        preview ? 'relative h-dvh min-h-[720px] w-full' : 'pointer-events-none fixed inset-0 z-[9999]',
      )}
    >
      {isChecking ? <div className="absolute inset-0 bg-black" /> : null}
      <div data-boot-scrim className="absolute inset-0 bg-black" />
      <div data-boot-content className="absolute inset-0 opacity-0 will-change-transform">
        {/* Stage 2/3/5/8 SVG layer: grid, topology, route pulse path, and interface construction. */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden>
          {gridColumns.map((x) => (
            <path key={`grid-x-${x}`} data-grid-line d={`M${x - 300} 0V560`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          ))}
          {gridRows.map((y) => (
            <path key={`grid-y-${y}`} data-grid-line d={`M0 ${y - 220}H1000`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          ))}

          {constructionPaths.map((path, index) => (
            <path
              key={path}
              className={cn(index === 0 && 'origin-line')}
              data-construction-x={index === 0 ? true : undefined}
              data-construction-y={index === 1 ? true : undefined}
              data-construction-a={index === 2 ? true : undefined}
              data-construction-b={index === 3 ? true : undefined}
              d={path}
              fill="none"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth="0.8"
            />
          ))}

          {topology.paths.map((path) => (
            <path key={path} data-draw data-network-path d={path} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1" />
          ))}

          <path id="fiber-pulse-loop" d={topology.loop} fill="none" stroke="transparent" />
          <circle data-route-pulse r="4" fill="#ffffff" />

          {topology.nodes.map((node, index) => (
            <g key={node.id} data-node-group style={{ transformBox: 'fill-box' }}>
              <circle data-final-breath data-node-ring cx={node.x} cy={node.y} r={index === 0 ? 18 : 13} fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="0.7" />
              <circle cx={node.x} cy={node.y} r={index === 0 ? 5 : 4} fill="#000000" stroke="#ffffff" strokeWidth="1" />
              <text
                data-node-label
                x={node.x + 13}
                y={node.y - 10}
                fill="rgba(255,255,255,0.44)"
                fontFamily="IBM Plex Mono, Courier New, monospace"
                fontSize="10"
                letterSpacing="1.4"
              >
                {node.id}
              </text>
            </g>
          ))}

          {interfacePaths.map((path) => (
            <path key={path} data-draw data-interface-path d={path} fill="none" stroke="rgba(255,255,255,0.46)" strokeWidth="1" />
          ))}
        </svg>

        {/* Stage 1 origin point. */}
        <span
          data-origin-dot
          className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        />

        {/* Stage 4 route discovery operation log. */}
        <div className="absolute left-[8vw] top-[18vh] w-[min(360px,82vw)] space-y-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/36">
          {operations.map((operation) => (
            <p key={operation} data-boot-op className="will-change-transform">
              {operation}
            </p>
          ))}
        </div>

        {/* Stage 6/7 wordmark and operating status diagnostics. */}
        <div data-wordmark-stage className="absolute inset-x-0 top-[44vh] text-center">
          <h1
            data-display
            className="mx-auto flex w-max max-w-[92vw] justify-center gap-x-[0.01em] text-[clamp(4.2rem,12vw,9rem)] font-black leading-[0.78] tracking-[-0.055em]"
          >
            {wordmark.map((char, index) => {
              return (
                <span key={`${char}-${index}`} data-boot-word className="inline-block will-change-transform">
                  {char}
                </span>
              );
            })}
          </h1>

          <div data-status-panel className="mx-auto mt-8 w-[min(620px,84vw)]">
            <div className="mb-4 flex items-center justify-between border-y border-white/18 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">
              <span>Status</span>
              <span>Online</span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {statusMetrics.map((metric) => (
                <div key={metric.label} className="border border-white/14 px-3 py-3 text-left">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/34">{metric.label}</p>
                  <p className="mt-2 font-mono text-lg font-bold text-white">
                    <span data-status-value data-target={metric.target} data-suffix={metric.suffix}>
                      0
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div data-white-gate className="absolute h-5 w-5 rounded-full bg-white opacity-0" />
    </div>
  );
}

function animateCounters(root: HTMLElement) {
  gsap.utils.toArray<HTMLElement>('[data-status-value]', root).forEach((element) => {
    const target = Number(element.dataset.target ?? 0);
    const suffix = element.dataset.suffix ?? '';

    if (suffix === 'Synced') {
      element.textContent = 'Synced';
      return;
    }

    const state = { value: 0 };
    gsap.to(state, {
      value: target,
      duration: 0.62,
      ease: 'power2.out',
      onUpdate: () => {
        const value = target % 1 === 0 ? Math.round(state.value).toLocaleString('en-US') : state.value.toFixed(1);
        element.textContent = `${value}${suffix}`;
      },
    });
  });
}
