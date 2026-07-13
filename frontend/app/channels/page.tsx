'use client';

import { GitBranch, ListFilter } from 'lucide-react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceHeader, WorkspacePanel } from '@/components/canvas-dashboard/CanvasAppShell';
import { useChannelHealth } from '@/lib/queries/channels';
import { focusWorkspaceModule } from '@/lib/workspace';
import { formatCkb, formatPercent, truncateId } from '@/lib/format';

export default function ChannelsPage() {
  const health = useChannelHealth();
  const channels = health.data?.channels ?? [];

  return (
    <CanvasAppShell active="channels" breadcrumb="Liquidity Layer / Channels">
      <CanvasWorkspace>
        <WorkspaceHeader
          eyebrow="channel inspector"
          title="Channels"
          description="Inspect each Fiber channel by state, peer, capacity, outbound availability, and balance direction."
          action={
            <button
              type="button"
              onClick={() => focusWorkspaceModule('channels')}
              className="hidden h-11 shrink-0 items-center gap-2 rounded-[4px] border border-ink-editorial bg-ink-editorial px-4 text-xs font-black uppercase tracking-[0.12em] text-panel transition hover:bg-ink-hover sm:flex"
            >
              <GitBranch className="h-4 w-4" />
              Focus channels
            </button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Channels" value={String(channels.length)} />
          <Metric label="Source" value={health.data?.source ?? 'Unknown'} />
          <Metric label="State" value={health.data?.stale ? 'Stale' : health.isPending ? 'Loading' : 'Live'} />
        </div>

        <WorkspacePanel className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Channel list</h2>
            <ListFilter className="h-4 w-4 text-faint" />
          </div>
          <div className="space-y-2">
            {health.isError ? (
              <Empty text={(health.error as Error)?.message ?? 'Channel health unavailable.'} />
            ) : channels.length ? (
              channels.map((channel) => (
                <button
                  key={channel.channelId}
                  type="button"
                  onClick={() => focusWorkspaceModule('channels')}
                  className="block w-full rounded-[4px] border border-line bg-panel p-3 text-left transition hover:border-ink-editorial"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-xs font-bold text-ink-editorial">{truncateId(channel.channelId)}</span>
                    <span className="rounded-[3px] border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-copy">
                      {channel.state}
                    </span>
                  </div>
                  <p className="mt-2 truncate font-mono text-[11px] text-copy">{truncateId(channel.peerPubkey, 12, 8)}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-copy">
                    <span>out {formatCkb(channel.outbound, { withUnit: !channel.isUdt })}</span>
                    <span>in {formatCkb(channel.inbound, { withUnit: !channel.isUdt })}</span>
                    <span>{formatPercent(channel.inboundRatio)}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden bg-shell-muted">
                    <span className="block h-full bg-ink-editorial" style={{ width: `${Math.max(4, Math.round((1 - channel.inboundRatio) * 100))}%` }} />
                  </div>
                </button>
              ))
            ) : (
              <Empty text={health.isPending ? 'Reading channel health.' : 'No Fiber channels reported yet.'} />
            )}
          </div>
        </WorkspacePanel>
      </CanvasWorkspace>
    </CanvasAppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <button type="button" onClick={() => focusWorkspaceModule('channels')} className="rounded-[6px] border border-line bg-panel p-4 text-left transition hover:border-ink-editorial">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">{label}</p>
      <p className="mt-4 truncate font-mono text-2xl font-black tracking-[-0.03em] text-ink-editorial">{value}</p>
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[4px] border border-dashed border-line bg-shell-muted p-4 text-sm leading-6 text-copy">{text}</div>;
}
