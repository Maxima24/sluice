import { motion } from 'framer-motion';
import { ChevronDown, Focus, Grip, Maximize2, Minimize2 } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { getModuleChrome } from './module-chrome';
import { ModuleKindIcon } from './module-kind-icon';
import type { WorkspaceModule } from './workspace-types';
import { cn } from '@/lib/utils';

export function ModuleFrame({
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
  const chrome = getModuleChrome(item);

  return (
    <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-[28px]">
      <div className="relative z-20 flex h-[118px] shrink-0 items-center justify-between rounded-b-none rounded-t-[28px] bg-white/[0.026] px-5 backdrop-blur-xl">
        <div className="pointer-events-none absolute bottom-0 left-5 right-5 h-px bg-white/[0.065]" />
        <div className="absolute right-5 top-4 flex gap-4 font-mono text-[9px] uppercase tracking-[0.18em] text-white/28">
          <span>X:{Math.round(item.x)}</span>
          <span>Y:{Math.round(item.y)}</span>
        </div>

        <div className="flex min-w-0 items-center gap-4">
          <motion.div
            className="relative flex h-12 w-12 shrink-0 items-center justify-center text-white/72"
            animate={{ opacity: [0.62, 1, 0.62] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-white/32" />
            <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-white/32" />
            <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-white/32" />
            <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-white/32" />
            <ModuleKindIcon kind={item.kind} />
          </motion.div>
          <div className="min-w-0 pt-2">
            <h3 data-display className="text-[clamp(1.45rem,2.0vw,2.05rem)] font-black uppercase leading-[0.86] tracking-[-0.05em] text-white">
              {chrome.titleLines.map((line) => (
                <span key={line} className="block truncate">
                  {line}
                </span>
              ))}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1" data-module-control>
          <button type="button" data-no-magnetic aria-label="Focus module" onClick={onFocus} className="flex h-8 w-8 items-center justify-center text-white/44 transition hover:text-white">
            <Focus className="h-4 w-4" />
          </button>
          <button type="button" data-no-magnetic aria-label="Collapse module" onClick={onToggle} className="flex h-8 w-8 items-center justify-center text-white/44 transition hover:text-white">
            {item.collapsed ? <ChevronDown className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <Grip className="h-4 w-4 text-white/18" />
        </div>
      </div>
      {item.collapsed ? null : (
        <>
          <div data-module-control className="workspace-scrollbar relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-white/[0.018] px-5 py-4 backdrop-blur-[28px]">
            {children}
          </div>
          <InstrumentMetricStrip metrics={chrome.metrics} />
        </>
      )}
      {!item.collapsed ? (
        <button
          type="button"
          data-module-control
          data-no-magnetic
          aria-label="Resize module"
          onPointerDown={onResize}
          className="absolute bottom-2 right-2 z-20 flex h-7 w-7 cursor-nwse-resize items-center justify-center rounded-[16px] text-white/22 transition hover:border hover:border-white/20 hover:text-white"
        >
          <Maximize2 className="h-4 w-4 rotate-45" />
        </button>
      ) : null}
    </div>
  );
}

function InstrumentMetricStrip({ metrics }: { metrics: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid h-12 shrink-0 border-t border-white/[0.065] bg-black/12" style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}>
      {metrics.map((metric, index) => (
        <div key={metric.label} className={cn('flex min-w-0 items-center justify-between gap-3 px-4', index > 0 ? 'border-l border-white/[0.055]' : '')}>
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{metric.label}</p>
          </div>
          <p data-numeric className="truncate text-right text-base font-black text-white">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
