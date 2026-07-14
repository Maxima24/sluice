import { AlertTriangle, BarChart3, GitBranch, Network, Radar, RefreshCw, Square } from 'lucide-react';
import type { WorkspaceModule } from './workspace-types';

export function ModuleKindIcon({ kind }: { kind: WorkspaceModule['kind'] }) {
  const className = 'h-4 w-4 text-white/70';
  if (kind === 'network') return <Network className={className} />;
  if (kind === 'liquidity') return <BarChart3 className={className} />;
  if (kind === 'route') return <Radar className={className} />;
  if (kind === 'rebalance') return <RefreshCw className={className} />;
  if (kind === 'channels') return <GitBranch className={className} />;
  if (kind === 'alerts') return <AlertTriangle className={className} />;
  if (kind === 'note') return <Square className={className} />;
  return <AlertTriangle className={className} />;
}
