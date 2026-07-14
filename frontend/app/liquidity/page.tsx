'use client';

import { BarChart3, Gauge } from 'lucide-react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceActionButton, WorkspaceHeader, WorkspacePanel } from '@/components/canvas-dashboard/CanvasAppShell';
import { useChannelHealth } from '@/lib/queries/channels';
import { focusWorkspaceModule } from '@/lib/workspace';
import { formatCkb, sumShannon, truncateId } from '@/lib/format';
import { Skeleton } from '@/components/ui/Skeleton';

export default function LiquidityPage() {
  const health = useChannelHealth();
  const channels = health.data?.channels ?? [];
  const outbound = sumShannon(channels.map((channel) => channel.outbound));
  const inbound = sumShannon(channels.map((channel) => channel.inbound));
  const warnings = channels.filter((channel) => 1 - channel.inboundRatio < 0.25).length;

  return (
    <CanvasAppShell active="liquidity" breadcrumb="Liquidity Layer / Liquidity">
      <CanvasWorkspace>
        <WorkspaceHeader
          eyebrow="capacity surface"
          title="Liquidity"
          description="Read outbound and inbound capacity as an operating surface. Thin channels become obvious before they become failed payments."
          action={
            <WorkspaceActionButton onClick={() => focusWorkspaceModule('liquidity')} icon={<BarChart3 className="h-4 w-4" />}>
              Focus liquidity
            </WorkspaceActionButton>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric isPending={health.isPending} label="Outbound" value={formatCkb(outbound)} />
          <Metric isPending={health.isPending} label="Inbound" value={formatCkb(inbound)} />
          <Metric isPending={health.isPending} label="Warnings" value={String(warnings)} />
        </div>

        <WorkspacePanel className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Liquidity health</h2>
            <Gauge className="h-4 w-4 text-faint" />
          </div>
          <div className="space-y-4">
            {health.isError ? (
              <Empty text={(health.error as Error)?.message ?? 'Liquidity unavailable.'} />
            ) : health.isPending ? (
              <LiquidityListSkeleton />
            ) : channels.length ? (
              channels.map((channel) => {
                const outboundRatio = Math.max(0, Math.min(1, 1 - channel.inboundRatio));
                const warning = outboundRatio < 0.25;
                return (
                  <button
                    key={channel.channelId}
                    type="button"
                    onClick={() => focusWorkspaceModule(warning ? 'alerts' : 'liquidity')}
                    className="block w-full rounded-[4px] border border-line bg-panel p-3 text-left transition hover:border-ink-editorial"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-mono text-xs font-bold text-ink-editorial">{truncateId(channel.channelId)}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-copy">{warning ? 'warning' : 'balanced'}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-copy">
                      <span>outbound {formatCkb(channel.outbound, { withUnit: !channel.isUdt })}</span>
                      <span>capacity {formatCkb(channel.capacity, { withUnit: !channel.isUdt })}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden bg-shell-muted">
                      <span className="block h-full bg-ink-editorial" style={{ width: `${Math.max(4, Math.round(outboundRatio * 100))}%` }} />
                    </div>
                  </button>
                );
              })
            ) : (
              <Empty text={health.isPending ? 'Reading liquidity health.' : 'No channel liquidity available yet.'} />
            )}
          </div>
        </WorkspacePanel>
      </CanvasWorkspace>
    </CanvasAppShell>
  );
}

function Metric({ label, value, isPending = false }: { label: string; value: string; isPending?: boolean }) {
  const skeletonWidth = label === 'Warnings' ? 'w-8' : 'w-24';

  return (
    <button type="button" onClick={() => focusWorkspaceModule('liquidity')} className="rounded-[6px] border border-line bg-panel p-4 text-left transition hover:border-ink-editorial">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">{label}</p>
      {isPending ? <Skeleton className={`mt-4 h-8 ${skeletonWidth}`} /> : <p className="mt-4 truncate font-mono text-2xl font-black tracking-[-0.03em] text-ink-editorial">{value}</p>}
    </button>
  );
}

function LiquidityListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-[4px] border border-line bg-panel p-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-[11ch]" />
            <Skeleton className="h-3 w-[8ch]" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Skeleton className="h-3 w-[15ch]" />
            <Skeleton className="h-3 w-[16ch]" />
          </div>
          <Skeleton className="mt-3 h-2 w-[64%] rounded-none" />
        </div>
      ))}
    </>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[4px] border border-dashed border-line bg-shell-muted p-4 text-sm leading-6 text-copy">{text}</div>;
}
