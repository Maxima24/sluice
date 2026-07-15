'use client';

import { AlertTriangle, Bell } from 'lucide-react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceActionButton, WorkspaceHeader, WorkspacePanel } from '@/components/canvas-dashboard/CanvasAppShell';
import { useChannelHealth } from '@/lib/queries/channels';
import { useReconciliation } from '@/lib/queries/reconciliation';
import { deriveAlerts } from '@/lib/liquidity';
import { focusWorkspaceModule } from '@/lib/workspace';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
  const health = useChannelHealth();
  const recon = useReconciliation();
  const channels = health.data?.channels ?? [];
  // Same derivation the canvas Alert Timeline uses, so the two stay consistent.
  const alerts = deriveAlerts(health.data, recon.data);

  return (
    <CanvasAppShell active="alerts" breadcrumb="Liquidity Layer / Alerts">
      <CanvasWorkspace>
        <WorkspaceHeader
          eyebrow="operator attention"
          title="Alerts"
          description="Surface channel conditions that can lead to failed payments, stale state, or unreliable route decisions."
          action={
            <WorkspaceActionButton onClick={() => focusWorkspaceModule('alerts')} icon={<Bell className="h-4 w-4" />}>
              Focus alerts
            </WorkspaceActionButton>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Open" value={String(alerts.length)} />
          <Metric label="Channels" value={health.data ? String(channels.length) : '—'} />
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
                  onClick={() => focusWorkspaceModule('alerts')}
                  className="block w-full rounded-[4px] border border-line bg-panel p-3 text-left transition hover:border-ink-editorial"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', alert.tone === 'danger' ? 'bg-ink-editorial' : 'bg-copy')} />
                    <p className="font-black uppercase tracking-[0.04em] text-ink-editorial">{alert.text}</p>
                  </div>
                  <p className="mt-1 pl-4 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{alert.tone}</p>
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
