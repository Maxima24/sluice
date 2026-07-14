import { useState } from 'react';
import { focusWorkspaceModule } from '@/lib/workspace';
import { cn } from '@/lib/utils';
import { channelBorderClass, GlassMetric, stateForChannel } from './shared';

export function ChannelInspector() {
  const [selected, setSelected] = useState('channel 4');
  const channels = [
    ['channel 1', 'healthy', '72%', 'active'],
    ['channel 2', 'warning', '44%', 'watch'],
    ['channel 3', 'critical', '18%', 'blocked'],
    ['channel 4', 'selected', '64%', 'recovering'],
  ] as const;

  return (
    <div className="grid h-full min-h-[260px] grid-cols-[1fr_132px] gap-5 bg-transparent">
      <div className="space-y-2">
        {channels.map(([name, state, value, route]) => (
          <button
            key={name}
            type="button"
            data-no-magnetic
            onClick={() => {
              setSelected(name);
              focusWorkspaceModule('liquidity');
            }}
            className={cn(
              'grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-l-2 border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-white/28',
              channelBorderClass(state),
              selected === name ? 'border-white/28 border-l-white/80 text-white' : 'text-white/70',
            )}
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">{name}</p>
              <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">{state} / {route}</p>
            </div>
            <span data-numeric className="font-mono text-sm font-bold text-white">{value}</span>
          </button>
        ))}
      </div>
      <div className="border-l border-white/12 pl-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">inspector</p>
        <p className="mt-2 font-mono text-lg font-black uppercase text-white">{selected}</p>
        <div className="mt-5 space-y-4">
          <GlassMetric label="policy" value="72%" />
          <GlassMetric label="delta" value="14%" />
          <p className="text-xs leading-5 text-white/38">State: {stateForChannel(selected, channels)}. Linked to the active liquidity surface.</p>
        </div>
      </div>
    </div>
  );
}
