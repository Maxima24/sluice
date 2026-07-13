import {
  Activity,
  AlertTriangle,
  BarChart3,
  GitBranch,
  ListChecks,
  Network,
  Radar,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

export type WorkspaceModuleId =
  | 'network'
  | 'liquidity'
  | 'channels'
  | 'route-probe'
  | 'rebalance'
  | 'alerts'
  | 'reconciliation';

export type AppRouteKey =
  | 'overview'
  | 'network'
  | 'channels'
  | 'liquidity'
  | 'probe'
  | 'rebalance'
  | 'alerts'
  | 'reconciliation';

export interface NavigationItem {
  key: AppRouteKey;
  label: string;
  href: string;
  icon: LucideIcon;
  moduleId?: WorkspaceModuleId;
}

export const operatorNav: NavigationItem[] = [
  { key: 'overview', label: 'Dashboard', href: '/', icon: Activity, moduleId: 'network' },
  { key: 'network', label: 'Network', href: '/network', icon: Network, moduleId: 'network' },
  { key: 'channels', label: 'Channels', href: '/channels', icon: GitBranch, moduleId: 'channels' },
  { key: 'liquidity', label: 'Liquidity', href: '/liquidity', icon: BarChart3, moduleId: 'liquidity' },
  { key: 'probe', label: 'Route Probe', href: '/probe', icon: Radar, moduleId: 'route-probe' },
  { key: 'rebalance', label: 'Rebalancing', href: '/rebalance', icon: RefreshCw, moduleId: 'rebalance' },
  { key: 'alerts', label: 'Alerts', href: '/alerts', icon: AlertTriangle, moduleId: 'alerts' },
  { key: 'reconciliation', label: 'Audit Log', href: '/reconciliation', icon: ListChecks, moduleId: 'reconciliation' },
];

export const workspaceSearchIndex: Array<{ label: string; aliases: string[]; moduleId: WorkspaceModuleId }> = [
  { label: 'Node 15', aliases: ['node 15', 'node alpha', 'alpha'], moduleId: 'network' },
  { label: 'Channel 4', aliases: ['channel 4', 'channel inspector', 'channels'], moduleId: 'channels' },
  { label: 'Liquidity Health', aliases: ['liquidity', 'health', 'capacity'], moduleId: 'liquidity' },
  { label: 'Route Probe', aliases: ['route', 'probe', 'can i pay', 'payment'], moduleId: 'route-probe' },
  { label: 'Rebalancing Engine', aliases: ['rebalance', 'rebalancing', 'circular payment'], moduleId: 'rebalance' },
  { label: 'Alert Timeline', aliases: ['alerts', 'warning', 'critical'], moduleId: 'alerts' },
  { label: 'Reconciliation', aliases: ['audit', 'drift', 'reconciliation'], moduleId: 'reconciliation' },
];

export function focusWorkspaceModule(moduleId: WorkspaceModuleId) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('fiber-workspace-focus', { detail: { moduleId } }));
}

export function focusWorkspaceSearch(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const hit = workspaceSearchIndex.find((item) =>
    [item.label.toLowerCase(), ...item.aliases].some((alias) => alias.includes(normalized) || normalized.includes(alias)),
  );

  if (hit) focusWorkspaceModule(hit.moduleId);
  return hit ?? null;
}
