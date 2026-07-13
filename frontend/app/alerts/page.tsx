'use client';

import { AlertTriangle, Bell } from 'lucide-react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceHeader, WorkspacePanel } from '@/components/canvas-dashboard/CanvasAppShell';
import { useChannelHealth } from '@/lib/queries/channels';
import { focusWorkspaceModule } from '@/lib/workspace';
import { formatCkb, truncateId } from '@/lib/format';

export default function AlertsPage() {
  const health = useChannelHealth();
  const channels = health.data?.channels ?? [];
  const lowOutbound = channels.filter((channel) => 1 - channel.inboundRatio < 0.25);
  const alerts = [
    ...lowOutbound.map((channel) => ({
      id: channel.channelId,
      title: 'Outbound below operating threshold',
      detail: `${truncateId(channel.channelId)} has ${formatCkb(channel.outbound, { withUnit: !channel.isUdt })} outbound available.`,
      target: 'liquidity' as const,
    })),
    ...(health.data?.stale
      ? [
          {
            id: 'snapshot-stale',
            title: 'Channel snapshot is stale',
            detail: 'The console is reading snapshot data. Confirm live Fiber node connectivity.',
            target: 'network' as const,
          },
        ]
      : []),
  ];

  return (
    <CanvasAppShell active="alerts" breadcrumb="Liquidity Layer / Alerts">
      <CanvasWorkspace>
        <WorkspaceHeader
          eyebrow="operator attention"
          title="Alerts"
          description="Surface channel conditions that can lead to failed payments, stale state, or unreliable route decisions."
          action={
            <button
              type="button"
              onClick={() => focusWorkspaceModule('alerts')}
              className="hidden h-11 shrink-0 items-center gap-2 rounded-[4px] border border-ink-editorial bg-ink-editorial px-4 text-xs font-black uppercase tracking-[0.12em] text-panel transition hover:bg-ink-hover sm:flex"
            >
              <Bell className="h-4 w-4" />
              Focus alerts
            </button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Open" value={String(alerts.length)} />
          <Metric label="Channels" value={String(lowOutbound.length)} />
          <Metric label="Source" value={health.data?.source ?? 'Unknown'} />
        </div>

        <WorkspacePanel className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Alert timeline</h2>
            <AlertTriangle className="h-4 w-4 text-faint" />
          </div>
          <div className="space-y-2">
            {health.isError ? (
              <Empty text={(health.error as Error)?.message ?? 'Alert state unavailable.'} />
            ) : alerts.length ? (
              alerts.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => focusWorkspaceModule(alert.target)}
                  className="block w-full rounded-[4px] border border-line bg-panel p-3 text-left transition hover:border-ink-editorial"
                >
                  <p className="font-black uppercase tracking-[0.04em] text-ink-editorial">{alert.title}</p>
                  <p className="mt-2 text-sm leading-6 text-copy">{alert.detail}</p>
                </button>
              ))
            ) : (
              <Empty text={health.isPending ? 'Building alert timeline.' : 'No active liquidity alerts.'} />
            )}
          </div>
        </WorkspacePanel>
      </CanvasWorkspace>
    </CanvasAppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <button type="button" onClick={() => focusWorkspaceModule('alerts')} className="rounded-[6px] border border-line bg-panel p-4 text-left transition hover:border-ink-editorial">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">{label}</p>
      <p className="mt-4 truncate font-mono text-2xl font-black tracking-[-0.03em] text-ink-editorial">{value}</p>
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[4px] border border-dashed border-line bg-shell-muted p-4 text-sm leading-6 text-copy">{text}</div>;
}
