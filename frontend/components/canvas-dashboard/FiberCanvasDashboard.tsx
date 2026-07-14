'use client';

import { Activity, AlertTriangle, ArrowRight, BarChart3, GitBranch, Radar, RefreshCw } from 'lucide-react';
import { type ReactNode } from 'react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceActionButton, WorkspaceHeader, WorkspacePanel } from './CanvasAppShell';
import { focusWorkspaceModule, type WorkspaceModuleId } from '@/lib/workspace';

const overviewCards: Array<{
  label: string;
  value: string;
  detail: string;
  moduleId: WorkspaceModuleId;
}> = [
  { label: 'Liquidity health', value: '78%', detail: '2 channels below outbound target', moduleId: 'liquidity' },
  { label: 'Route readiness', value: '82%', detail: '3 payable alternatives pre-computed', moduleId: 'route-probe' },
  { label: 'Settlement window', value: '60ms', detail: 'latest pre-flight decision latency', moduleId: 'network' },
  { label: 'Ledger drift', value: '0.02', detail: 'inside double-entry tolerance', moduleId: 'reconciliation' },
];

const capacityRows: Array<{
  label: string;
  value: number;
  status: string;
  moduleId: WorkspaceModuleId;
}> = [
  { label: 'alpha / beta', value: 78, status: 'balanced', moduleId: 'liquidity' },
  { label: 'alpha / delta', value: 44, status: 'watch outbound', moduleId: 'channels' },
  { label: 'alpha / kappa', value: 18, status: 'critical bottleneck', moduleId: 'alerts' },
  { label: 'alpha / omega', value: 64, status: 'recovering', moduleId: 'rebalance' },
];

export function FiberCanvasDashboard() {
  return (
    <CanvasAppShell active="overview" breadcrumb="Liquidity Layer / Command Center">
      <CanvasWorkspace>
        <WorkspaceHeader
          eyebrow="fiber control surface"
          title="Liquidity OS"
          description="Operate your Fiber node from one synchronized surface. Watch capacity drift, test payment routes before execution, and stage rebalances while the workspace camera follows the exact channel, route, or alert behind each signal."
          action={
            <WorkspaceActionButton onClick={() => focusWorkspaceModule('route-probe')} icon={<ArrowRight className="h-4 w-4" />}>
              Probe route
            </WorkspaceActionButton>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {overviewCards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => focusWorkspaceModule(card.moduleId)}
              className="rounded-[6px] border border-line bg-panel p-4 text-left transition hover:border-ink-editorial focus:border-ink-editorial"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">{card.label}</p>
              <p className="mt-4 font-mono text-4xl font-black tracking-[-0.04em] text-ink-editorial">{card.value}</p>
              <p className="mt-2 text-xs leading-5 text-copy">{card.detail}</p>
            </button>
          ))}
        </div>

        <WorkspacePanel className="mt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-line bg-shell-muted">
              <Activity className="h-5 w-5 text-copy" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.08em]">Operational flow</h2>
              <p className="mt-1 text-xs text-copy">Every action keeps the operator console and workspace camera synchronized.</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <ConsoleAction icon={<GitBranch className="h-4 w-4" />} label="Inspect thin outbound channel" moduleId="channels" />
            <ConsoleAction icon={<Radar className="h-4 w-4" />} label="Probe payment before attempting" moduleId="route-probe" />
            <ConsoleAction icon={<RefreshCw className="h-4 w-4" />} label="Stage circular rebalance" moduleId="rebalance" />
            <ConsoleAction icon={<AlertTriangle className="h-4 w-4" />} label="Review failure and drift signals" moduleId="alerts" />
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="mt-4" data-no-magnetic>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Live capacity surface</h2>
            <BarChart3 className="h-4 w-4 text-faint" />
          </div>
          <div className="space-y-4">
            {capacityRows.map((row) => (
              <button
                key={row.label}
                type="button"
                data-no-magnetic
                onClick={() => focusWorkspaceModule(row.moduleId)}
                className="block w-full rounded-[24px] border border-transparent px-4 py-3 text-left transition hover:border-line hover:bg-shell-muted"
              >
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  <span>{row.label}</span>
                  <span>{row.value}%</span>
                </div>
                <p className="mt-1 text-xs text-copy">{row.status}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-none bg-shell-muted">
                  <span className="block h-full rounded-none bg-ink-editorial transition-[width] duration-700" style={{ width: `${row.value}%` }} />
                </div>
              </button>
            ))}
          </div>
        </WorkspacePanel>
      </CanvasWorkspace>
    </CanvasAppShell>
  );
}

function ConsoleAction({ icon, label, moduleId }: { icon: ReactNode; label: string; moduleId: WorkspaceModuleId }) {
  return (
    <button
      type="button"
      onClick={() => focusWorkspaceModule(moduleId)}
      className="flex w-full items-center justify-between rounded-[4px] border border-line bg-panel px-3 py-3 text-sm text-copy transition hover:border-ink-editorial hover:text-ink-editorial"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="text-faint">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-faint" />
    </button>
  );
}
