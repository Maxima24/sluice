import { Cable } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { StatusTone } from '@/components/ui/types';
import { BalanceBar } from './BalanceBar';
import { formatCkb, truncateId } from '@/lib/format';
import type { ChannelHealth } from '@/types/fiber';

function stateTone(state: string): StatusTone {
  if (state === 'ChannelReady') return 'success';
  if (/clos|shut/i.test(state)) return 'neutral';
  return 'warning';
}

const fmt = (v: string, isUdt: boolean) => formatCkb(v, { withUnit: !isUdt });

export function ChannelList({ data, isPending }: { data?: ChannelHealth; isPending: boolean }) {
  const hasChannels = !!data && data.channels.length > 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Channels{data ? ` · ${data.source}${data.stale ? ' (stale)' : ''}` : ''}</CardTitle>
      </CardHeader>
      <div className="p-4">
        {isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-outline bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Skeleton className="h-4 w-[18ch]" />
                    <Skeleton className="h-5 w-[10ch]" />
                  </div>
                  <Skeleton className="h-4 w-[16ch]" />
                </div>
                <Skeleton className="mt-2.5 h-2 w-[68%]" />
              </div>
            ))}
          </div>
        ) : !hasChannels ? (
          <EmptyState
            icon={<Cable className="h-5 w-5" />}
            title="No channels yet"
            description="Fund the wallet and open a channel — see infra/README.md §3."
          />
        ) : (
          <ul className="space-y-2">
            {data!.channels.map((c) => (
              <li key={c.channelId} className="rounded-lg border border-outline bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="font-mono text-xs tabular-nums text-neutral-500" data-numeric>
                      {truncateId(c.peerPubkey)}
                    </span>
                    <Badge tone={stateTone(c.state)}>{c.state}</Badge>
                    {c.isUdt ? <Badge tone="info">UDT</Badge> : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums" data-numeric>
                    <span className="text-accent-500">{fmt(c.outbound, c.isUdt)}</span>
                    <span className="text-neutral-600">↔</span>
                    <span className={c.isUdt ? 'text-info-500' : 'text-secondary-500'}>{fmt(c.inbound, c.isUdt)}</span>
                  </div>
                </div>
                <div className="mt-2.5">
                  <BalanceBar inboundRatio={c.inboundRatio} isUdt={c.isUdt} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {hasChannels ? (
        <div className="flex items-center gap-4 border-t border-outline px-4 py-2.5 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent-500" /> outbound (can send)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-secondary-500" /> inbound (can receive)
          </span>
        </div>
      ) : null}
    </Card>
  );
}
