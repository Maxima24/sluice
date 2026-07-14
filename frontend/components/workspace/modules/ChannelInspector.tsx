import { useState } from 'react';
import { focusWorkspaceModule } from '@/lib/workspace';
import { cn } from '@/lib/utils';
import { channelBorderClass, GlassMetric } from './shared';
import { useChannelHealth } from '@/lib/queries/channels';
import { channelState, liquidityLabel, outboundPct } from '@/lib/liquidity';

export function ChannelInspector() {
  const health = useChannelHealth();
  const rows = (health.data?.channels ?? []).map(
    (channel, index) =>
      [`channel ${index + 1}`, channelState(channel), `${outboundPct(channel)}%`, liquidityLabel(channel)] as const,
  );
  const [selected, setSelected] = useState('');
  const active = rows.find(([name]) => name === selected) ?? rows[0];

  if (rows.length === 0) {
    return (
      <div className="flex h-full min-h-[260px] items-center justify-center bg-transparent">
        <p className="font-mono text-[11px] text-white/40">
          {health.isError ? 'Node unreachable.' : health.isPending ? 'Loading channels…' : 'No channels open.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-[260px] grid-cols-[1fr_132px] gap-5 bg-transparent">
      <div className="space-y-2">
        {rows.map(([name, state, value, route]) => (
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
              active?.[0] === name ? 'border-white/28 border-l-white/80 text-white' : 'text-white/70',
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
        <p className="mt-2 font-mono text-lg font-black uppercase text-white">{active?.[0] ?? '—'}</p>
        <div className="mt-5 space-y-4">
          <GlassMetric label="outbound" value={active?.[2] ?? '—'} />
          <GlassMetric label="state" value={active?.[1] ?? '—'} />
          <p className="text-xs leading-5 text-white/38">
            State: {active?.[1] ?? 'unknown'}. Linked to the active liquidity surface.
          </p>
        </div>
      </div>
    </div>
  );
}
