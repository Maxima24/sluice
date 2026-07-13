'use client';

import { Activity, AlertTriangle, ArrowRight, BarChart3, GitBranch, Radar, RefreshCw } from 'lucide-react';
import { type ReactNode } from 'react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceHeader, WorkspacePanel } from './CanvasAppShell';
import { focusWorkspaceModule, type WorkspaceModuleId } from '@/lib/workspace';

const overviewCards: Array<{
  label: string;
  value: string;
  detail: string;
  moduleId: WorkspaceModuleId;
}> = [
  { label: 'Liquidity health', value: '78%', detail: '2 channels need attention', moduleId: 'liquidity' },
  { label: 'Route confidence', value: '82%', detail: '3 alternative paths ready', moduleId: 'route-probe' },
  { label: 'Active peers', value: '7', detail: 'live topology synchronized', moduleId: 'network' },
  { label: 'Drift', value: '0.02', detail: 'inside tolerance window', moduleId: 'reconciliation' },
];

export function FiberCanvasDashboard() {
  return (
    <CanvasAppShell active="overview" breadcrumb="Liquidity Layer / Command Center">
      <CanvasWorkspace>
        <WorkspaceHeader
          eyebrow="operator console"
          title="Command Center"
          description="The console reads the Fiber node state while the workspace remains interactive. Select a metric to move the camera to its operational object."
          action={
            <button
              type="button"
              onClick={() => focusWorkspaceModule('route-probe')}
              className="hidden h-11 shrink-0 items-center gap-2 rounded-[4px] border border-ink-editorial bg-ink-editorial px-4 text-xs font-black uppercase tracking-[0.12em] text-panel transition hover:bg-ink-hover sm:flex"
            >
              Can I Pay?
              <ArrowRight className="h-4 w-4" />
            </button>
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
              <p className="mt-1 text-xs text-copy">Panel selections fly the workspace camera to the relevant module.</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <ConsoleAction icon={<GitBranch className="h-4 w-4" />} label="Inspect Channel 4" moduleId="channels" />
            <ConsoleAction icon={<Radar className="h-4 w-4" />} label="Run route simulation" moduleId="route-probe" />
            <ConsoleAction icon={<RefreshCw className="h-4 w-4" />} label="Open rebalancing engine" moduleId="rebalance" />
            <ConsoleAction icon={<AlertTriangle className="h-4 w-4" />} label="Review alert timeline" moduleId="alerts" />
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Live capacity surface</h2>
            <BarChart3 className="h-4 w-4 text-faint" />
          </div>
          <div className="space-y-4">
            {[78, 44, 18, 64].map((value, index) => (
              <button
                key={index}
                type="button"
                onClick={() => focusWorkspaceModule(index === 2 ? 'alerts' : 'liquidity')}
                className="block w-full text-left"
              >
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  <span>channel {index + 1}</span>
                  <span>{value}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-none bg-shell-muted">
                  <span className="block h-full rounded-none bg-ink-editorial transition-[width] duration-700" style={{ width: `${value}%` }} />
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
