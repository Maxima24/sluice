'use client';

import { type ReactNode } from 'react';
import { Database, ListChecks, ShieldAlert, ShieldCheck } from 'lucide-react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceHeader, WorkspacePanel } from '@/components/canvas-dashboard/CanvasAppShell';
import { useReconciliation } from '@/lib/queries/reconciliation';
import { focusWorkspaceModule } from '@/lib/workspace';
import { formatCkb, truncateId } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function ReconciliationPage() {
  const recon = useReconciliation();
  const data = recon.data;
  const driftCount = data?.channels.filter((channel) => !channel.inSync).length ?? 0;

  return (
    <CanvasAppShell active="reconciliation" breadcrumb="Liquidity Layer / Audit Log">
      <CanvasWorkspace>
        <WorkspaceHeader
          eyebrow="snapshot vs node"
          title="Reconciliation"
          description="The Fiber node is the source of truth. Drift is surfaced inside the Operator Console and mapped to the workspace audit module."
          action={
            <button
              type="button"
              onClick={() => focusWorkspaceModule('reconciliation')}
              className="hidden h-11 shrink-0 items-center gap-2 rounded-[4px] border border-line bg-panel px-3 text-xs font-black uppercase tracking-[0.12em] text-ink-editorial transition hover:border-ink-editorial sm:flex"
            >
              <ListChecks className="h-4 w-4" />
              Inspect
            </button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="Status"
            value={data ? (data.inSync ? 'In sync' : 'Drift') : recon.isPending ? 'Checking' : 'Unknown'}
            icon={data?.inSync ? <ShieldCheck className="h-5 w-5 text-copy" /> : <ShieldAlert className="h-5 w-5 text-copy" />}
          />
          <MetricCard label="Tolerance" value={data ? formatCkb(data.tolerance) : 'Unknown'} icon={<Database className="h-5 w-5 text-copy" />} />
          <MetricCard label="Drift" value={driftCount ? String(driftCount) : '0'} icon={<ListChecks className="h-5 w-5 text-copy" />} />
        </div>

        <WorkspacePanel className="mt-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">per-channel drift</p>
              <h2 className="mt-1 text-lg font-black uppercase tracking-[0.04em]">Ledger agreement</h2>
            </div>
            <span className="rounded-[4px] border border-line px-2 py-1 font-mono text-[10px] text-copy">
              {data?.channels.length ?? 0} channels
            </span>
          </div>

          {recon.isError ? (
            <div className="rounded-[4px] border border-line bg-shell-muted p-4">
              <p className="font-black uppercase tracking-[0.04em]">Reconciliation unavailable</p>
              <p className="mt-1 text-sm leading-6 text-copy">{(recon.error as Error)?.message}</p>
            </div>
          ) : recon.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-[4px] bg-shell-muted" />
              ))}
            </div>
          ) : !data || data.channels.length === 0 ? (
            <div className="rounded-[4px] border border-dashed border-line bg-shell-muted p-4 text-sm leading-6 text-copy">
              No channels or snapshots yet.
            </div>
          ) : (
            <div className="space-y-2">
              {data.channels.map((channel) => (
                <button
                  key={channel.channelId}
                  type="button"
                  onClick={() => focusWorkspaceModule(channel.inSync ? 'reconciliation' : 'alerts')}
                  className="block w-full rounded-[4px] border border-line bg-panel p-3 text-left transition hover:border-ink-editorial"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-xs font-bold text-ink-editorial">{truncateId(channel.channelId)}</span>
                    <span className={cn('rounded-[3px] border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em]', channel.inSync ? 'border-line text-copy' : 'border-ink-editorial bg-ink-editorial text-panel')}>
                      {channel.inSync ? 'in sync' : 'drift'}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-copy">
                    <span>snapshot {channel.snapshotOutbound ? formatCkb(channel.snapshotOutbound) : 'unknown'}</span>
                    <span>node {channel.nodeOutbound ? formatCkb(channel.nodeOutbound) : 'unknown'}</span>
                    <span>drift {formatCkb(channel.drift)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">trust model</p>
          <h2 className="mt-2 text-lg font-black uppercase tracking-[0.04em]">Node authority</h2>
          <p className="mt-3 text-sm leading-6 text-copy">
            The database is a record and reconciliation check. The Fiber node remains the authority on channel state.
          </p>
          <div className="mt-5 space-y-2">
            {['Fiber node RPC', 'Channel snapshot', 'Ledger entries', 'Operator view'].map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => focusWorkspaceModule(index < 2 ? 'network' : 'reconciliation')}
                className="flex w-full items-center justify-between rounded-[4px] border border-line bg-panel px-3 py-3 text-sm text-copy transition hover:border-ink-editorial hover:text-ink-editorial"
              >
                <span>{item}</span>
                <span className="h-2 w-2 rounded-full bg-ink-editorial" />
              </button>
            ))}
          </div>
        </WorkspacePanel>
      </CanvasWorkspace>
    </CanvasAppShell>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => focusWorkspaceModule('reconciliation')}
      className="min-w-0 rounded-[6px] border border-line bg-panel p-4 text-left transition hover:border-ink-editorial"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.22em] text-faint">{label}</p>
        {icon}
      </div>
      <p className="mt-4 truncate font-mono text-2xl font-black tracking-[-0.03em] text-ink-editorial">{value}</p>
    </button>
  );
}
