'use client';

import { GitBranch, ListFilter } from 'lucide-react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceActionButton, WorkspaceHeader, WorkspacePanel } from '@/components/canvas-dashboard/CanvasAppShell';
import { useChannelHealth } from '@/lib/queries/channels';
import { focusWorkspaceModule } from '@/lib/workspace';
import { formatCkb, formatPercent, truncateId } from '@/lib/format';
import { Skeleton } from '@/components/ui/Skeleton';

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
            <WorkspaceActionButton onClick={() => focusWorkspaceModule('channels')} icon={<GitBranch className="h-4 w-4" />}>
              Focus channels
            </WorkspaceActionButton>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric isPending={health.isPending} label="Channels" value={String(channels.length)} />
          <Metric isPending={health.isPending} label="Source" value={health.data?.source ?? 'Unknown'} />
          <Metric isPending={health.isPending} label="State" value={health.data?.stale ? 'Stale' : 'Live'} />
        </div>

        <WorkspacePanel className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Channel list</h2>
            <ListFilter className="h-4 w-4 text-faint" />
          </div>
          <div className="space-y-2">
            {health.isError ? (
              <Empty text={(health.error as Error)?.message ?? 'Channel health unavailable.'} />
            ) : health.isPending ? (
              <ChannelListSkeleton />
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

function Metric({ label, value, isPending = false }: { label: string; value: string; isPending?: boolean }) {
  const skeletonWidth = label === 'Source' ? 'w-28' : label === 'Channels' ? 'w-8' : 'w-12';

  return (
    <button type="button" onClick={() => focusWorkspaceModule('channels')} className="rounded-[6px] border border-line bg-panel p-4 text-left transition hover:border-ink-editorial">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">{label}</p>
      {isPending ? <Skeleton className={`mt-4 h-8 ${skeletonWidth}`} /> : <p className="mt-4 truncate font-mono text-2xl font-black tracking-[-0.03em] text-ink-editorial">{value}</p>}
    </button>
  );
}

function ChannelListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-[4px] border border-line bg-panel p-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-[11ch]" />
            <Skeleton className="h-6 w-[8ch]" />
          </div>
          <Skeleton className="mt-3 h-3 w-[18ch]" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Skeleton className="h-3 w-[9ch]" />
            <Skeleton className="h-3 w-[8ch]" />
            <Skeleton className="h-3 w-[5ch]" />
          </div>
          <Skeleton className="mt-3 h-2 w-[72%] rounded-none" />
        </div>
      ))}
    </>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[4px] border border-dashed border-line bg-shell-muted p-4 text-sm leading-6 text-copy">{text}</div>;
}
