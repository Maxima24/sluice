'use client';

import { BarChart3, Gauge } from 'lucide-react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceHeader, WorkspacePanel } from '@/components/canvas-dashboard/CanvasAppShell';
import { useChannelHealth } from '@/lib/queries/channels';
import { focusWorkspaceModule } from '@/lib/workspace';
import { formatCkb, sumShannon, truncateId } from '@/lib/format';

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
            <button
              type="button"
              onClick={() => focusWorkspaceModule('liquidity')}
              className="hidden h-11 shrink-0 items-center gap-2 rounded-[4px] border border-ink-editorial bg-ink-editorial px-4 text-xs font-black uppercase tracking-[0.12em] text-panel transition hover:bg-ink-hover sm:flex"
            >
              <BarChart3 className="h-4 w-4" />
              Focus liquidity
            </button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Outbound" value={formatCkb(outbound)} />
          <Metric label="Inbound" value={formatCkb(inbound)} />
          <Metric label="Warnings" value={String(warnings)} />
        </div>

        <WorkspacePanel className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Liquidity health</h2>
            <Gauge className="h-4 w-4 text-faint" />
          </div>
          <div className="space-y-4">
            {health.isError ? (
              <Empty text={(health.error as Error)?.message ?? 'Liquidity unavailable.'} />
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <button type="button" onClick={() => focusWorkspaceModule('liquidity')} className="rounded-[6px] border border-line bg-panel p-4 text-left transition hover:border-ink-editorial">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">{label}</p>
      <p className="mt-4 truncate font-mono text-2xl font-black tracking-[-0.03em] text-ink-editorial">{value}</p>
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[4px] border border-dashed border-line bg-shell-muted p-4 text-sm leading-6 text-copy">{text}</div>;
}
