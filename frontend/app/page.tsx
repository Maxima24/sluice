'use client';

import { WifiOff } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { MetricTile } from '@/components/ui/MetricTile';
import { StatusDot } from '@/components/ui/StatusDot';
import type { StatusTone } from '@/components/ui/types';
import { ChannelList } from '@/components/dashboard/ChannelList';
import { NodeIdentityPanel } from '@/components/dashboard/NodeIdentityPanel';
import { useNodeInfo } from '@/lib/queries/node';
import { useChannelHealth } from '@/lib/queries/channels';
import { formatCkb, sumShannon } from '@/lib/format';

export default function OverviewPage() {
  const node = useNodeInfo();
  const health = useChannelHealth();

  const channels = health.data?.channels ?? [];
  const live = health.data?.source === 'live' && !health.data.stale;
  const nodeDown = node.isError;
  const statusTone: StatusTone = nodeDown ? 'danger' : live ? 'success' : 'warning';
  const statusLabel = nodeDown ? 'Offline' : live ? 'Online' : 'Degraded';
  const readyCount = channels.filter((c) => c.state === 'ChannelReady').length;

  return (
    <div>
      <PageHeader title="Overview" description="Live liquidity health for this Fiber node." />
      <div className="space-y-6 p-6">
        {nodeDown ? (
          <AlertBanner
            tone="danger"
            icon={<WifiOff className="h-4 w-4" />}
            title="Node unreachable"
            description="The backend or the FNN node is down — showing last-known data where available."
          />
        ) : health.data && (health.data.source === 'snapshot' || health.data.stale) ? (
          <AlertBanner
            tone="warning"
            title="Showing last-known snapshot"
            description="The live node is unreachable; channel balances may be stale."
          />
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="Node status"
            value={
              <span className="flex items-center gap-2 text-2xl">
                <StatusDot tone={statusTone} pulse={live} />
                {statusLabel}
              </span>
            }
            hint={node.data?.version ? `v${node.data.version}` : undefined}
          />
          <MetricTile label="Channels" value={channels.length} hint={`${readyCount} ready`} />
          <MetricTile
            label="Total outbound"
            value={<span className="text-2xl">{formatCkb(sumShannon(channels.map((c) => c.outbound)))}</span>}
            hint="can send"
          />
          <MetricTile
            label="Total inbound"
            value={<span className="text-2xl">{formatCkb(sumShannon(channels.map((c) => c.inbound)))}</span>}
            hint="can receive"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChannelList data={health.data} isPending={health.isPending} />
          </div>
          <NodeIdentityPanel info={node.data} isPending={node.isPending} isError={node.isError} />
        </div>
      </div>
    </div>
  );
}
