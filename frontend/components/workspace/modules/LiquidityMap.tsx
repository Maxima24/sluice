import { motion } from 'framer-motion';
import { useState } from 'react';
import { focusWorkspaceModule } from '@/lib/workspace';
import { cn } from '@/lib/utils';
import { LiveDataSkeleton, Meter } from './shared';
import { useChannelHealth } from '@/lib/queries/channels';
import { liquidityLabel, outboundPct } from '@/lib/liquidity';

export function LiquidityMap() {
  const health = useChannelHealth();
  const rows = (health.data?.channels ?? []).map((channel, index) => ({
    id: `chan-${String(index + 1).padStart(2, '0')}`,
    outbound: outboundPct(channel),
    inbound: Math.round(channel.inboundRatio * 100),
    state: liquidityLabel(channel),
  }));
  const [selected, setSelected] = useState('');
  const active = rows.find((row) => row.id === selected) ?? rows[0];

  if (rows.length === 0) {
    return (
      <div className="flex h-full min-h-[290px] items-center justify-center bg-transparent">
        <p className="font-mono text-[11px] text-white/40">
          {health.isError ? 'Node unreachable.' : health.isPending ? 'Loading channels…' : 'No channels open.'}
        </p>
      </div>
    );
  }

  return (
    <div data-no-magnetic className="grid h-full min-h-[290px] grid-cols-[minmax(0,1fr)_140px] gap-5 bg-transparent">
      <div className="grid min-h-0 grid-rows-[1fr_auto] gap-4">
        <div className="grid min-h-[150px] grid-cols-4 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          {rows.map((row, index) => (
            <button
              key={row.id}
              type="button"
              data-no-magnetic
              onClick={() => setSelected(row.id)}
              className={cn(
                'group relative min-h-[126px] rounded-xl border border-white/10 bg-white/[0.03] p-2 text-left transition hover:border-white/28',
                active?.id === row.id ? 'border-white/35' : '',
              )}
            >
              <span className="absolute left-2 top-2 z-10 font-mono text-[9px] text-white/40">0{index + 1}</span>
              <span className="absolute inset-x-3 bottom-3 top-8 overflow-hidden rounded-xl bg-white/8">
                <motion.span
                  className="absolute inset-x-1 bottom-1 z-0 rounded-xl bg-white/25"
                  style={{ height: `${row.inbound}%` }}
                  animate={{ opacity: [0.22, 0.48, 0.22] }}
                  transition={{ duration: 3.4, repeat: Infinity, delay: index * 0.14 }}
                />
                <motion.span
                  className="absolute inset-x-1 bottom-1 z-10 rounded-xl bg-gradient-to-t from-white/90 to-white/50"
                  style={{ height: `${row.outbound}%` }}
                  animate={{ opacity: [0.62, 0.95, 0.62] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.18 }}
                />
              </span>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              data-no-magnetic
              onClick={() => {
                setSelected(row.id);
                focusWorkspaceModule('channels');
              }}
              className={cn(
                'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-white/28',
                active?.id === row.id ? 'border-white/35' : '',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
                  {row.id}
                  <span className="px-2 text-white/28">/</span>
                  <span className="text-white/35">{row.state}</span>
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white">{row.outbound}%</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                <span className="block h-full rounded-full bg-white/70" style={{ width: `${row.outbound}%` }} />
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="border-l-2 border-white/30 pl-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">selected</p>
          <LiveDataSkeleton className="scale-75" />
        </div>
        <p data-numeric className="mt-2 font-mono text-2xl font-black text-white">{active?.id ?? '—'}</p>
        <p className="mt-2 text-xs leading-5 text-white/45">Outbound capacity remains visible before payment attempts.</p>
        <div className="mt-5 space-y-5">
          <Meter label="OUTBOUND" value={active?.outbound ?? 0} />
          <Meter label="INBOUND" value={active?.inbound ?? 0} muted />
        </div>
      </div>
    </div>
  );
}
