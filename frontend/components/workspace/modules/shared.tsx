import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export const pillClass =
  'rounded-full border border-white/16 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60';
export const actionButtonClass =
  'rounded-full border border-white/16 bg-white/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60 transition hover:border-white/90';
export const primaryButtonClass = 'rounded-full border border-white bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-white/90';

export function SegmentSwitch({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em]">
      {options.map(([option, label]) => (
        <button
          key={option}
          type="button"
          data-no-magnetic
          onClick={() => onChange(option)}
          className={cn('text-white/38 transition hover:text-white', value === option ? 'text-white' : '')}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(pillClass, className)}>{children}</span>;
}

export function GlassMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{label}</p>
      <p className="font-mono text-sm font-bold text-white">{value}</p>
    </div>
  );
}

export function MetricStrip({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="flex items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      {items.map(([label, value], index) => (
        <div key={label} className="flex min-w-0 items-center gap-6">
          {index > 0 ? <span className="h-8 w-px shrink-0 bg-white/10" /> : null}
          <GlassMetric label={label} value={value} />
        </div>
      ))}
    </div>
  );
}

export function SingleLineStats({ items, className }: { items: Array<[string, string]>; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55', className)}>
      {items.map(([label, value], index) => (
        <span key={label} className="flex items-center gap-2">
          {index > 0 ? <span className="text-white/28">/</span> : null}
          <span>{label}</span>
          <span className="font-bold text-white/75">{value}</span>
        </span>
      ))}
    </div>
  );
}

export function LiveDataSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Skeleton className="h-1.5 w-8 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.14),rgba(255,255,255,0.42),rgba(255,255,255,0.14))]" />
      <Skeleton className="h-1.5 w-14 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.1),rgba(255,255,255,0.32),rgba(255,255,255,0.1))]" />
    </div>
  );
}

export function Pool({
  label,
  amount,
  unit,
  channel,
  value,
  trend,
  running,
  muted = false,
}: {
  label: string;
  amount: string;
  unit: string;
  channel: string;
  value: number;
  trend: string;
  running: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">{label}</span>
        <span className="font-mono text-[10px] text-white/40">{trend}</span>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{channel}</p>
      <p data-numeric className={cn('font-mono text-2xl font-black leading-none text-white', muted ? 'text-white/74' : '')}>
        {amount}
        <span className="ml-1 text-xs text-white/38">{unit}</span>
      </p>
      <div className="relative mt-1 h-16 overflow-hidden rounded-xl border border-white/8 bg-white/6">
        <motion.span
          className={cn('absolute inset-x-0 bottom-0 block bg-gradient-to-t from-white/80 to-white/38', muted ? 'opacity-60' : '')}
          style={{ height: `${value}%` }}
          animate={{ opacity: running ? [0.48, 0.86, 0.48] : 0.42 }}
          transition={{ duration: 2.8, repeat: running ? Infinity : 0, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

export function Meter({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
        <span className={cn('block h-full rounded-full', muted ? 'bg-white/34' : 'bg-white/70')} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function severityBadgeClass(severity: string) {
  if (severity === 'critical') return 'rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-red-300';
  if (severity === 'blocked') return 'rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-orange-300';
  if (severity === 'queued') return 'rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-yellow-200';
  return 'rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-blue-300';
}

export function channelBorderClass(state: string) {
  if (state === 'healthy') return 'border-l-emerald-500/60';
  if (state === 'warning') return 'border-l-amber-500/60';
  if (state === 'critical') return 'border-l-red-500/60';
  return 'border-l-white/80';
}

export function stateForChannel(selected: string, channels: ReadonlyArray<readonly [string, string, string, string]>) {
  return channels.find(([name]) => name === selected)?.[1] ?? 'unknown';
}
