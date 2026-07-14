import { AlertTimeline } from './modules/AlertTimeline';
import { ChannelInspector } from './modules/ChannelInspector';
import { LiquidityMap } from './modules/LiquidityMap';
import { NetworkGraph } from './modules/NetworkGraph';
import { OperatorNote } from './modules/OperatorNote';
import { RebalanceEngine } from './modules/RebalanceEngine';
import { ReconciliationModule } from './modules/ReconciliationModule';
import { RouteSimulation } from './modules/RouteSimulation';
import type { WorkspaceModule } from './workspace-types';

export function ModuleBody({ item }: { item: WorkspaceModule }) {
  if (item.kind === 'network') return <NetworkGraph />;
  if (item.kind === 'liquidity') return <LiquidityMap />;
  if (item.kind === 'route') return <RouteSimulation />;
  if (item.kind === 'rebalance') return <RebalanceEngine />;
  if (item.kind === 'channels') return <ChannelInspector />;
  if (item.kind === 'alerts') return <AlertTimeline />;
  if (item.kind === 'note') return <OperatorNote />;
  return <ReconciliationModule />;
}
