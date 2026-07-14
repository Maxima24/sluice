import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { focusWorkspaceModule } from '@/lib/workspace';
import { Badge, LiveDataSkeleton, Pool } from './shared';
import { useChannelHealth } from '@/lib/queries/channels';
import { formatCkb, truncateId } from '@/lib/format';
import { outboundPct, pickRebalancePair } from '@/lib/liquidity';

export function RebalanceEngine() {
  const [running, setRunning] = useState(true);
  const health = useChannelHealth();
  const pair = pickRebalancePair(health.data?.channels ?? []);

  return (
    <div className="flex h-full min-h-[330px] flex-col gap-3 bg-transparent">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge>CIRCULAR PAYMENT</Badge>
            <p className="mt-2 text-xs text-white/55">over-funded source feeds the depleted destination</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge>{running ? 'INFLIGHT' : 'PAUSED'}</Badge>
            <LiveDataSkeleton />
          </div>
        </div>
      </div>

      {pair ? (
        <div className="grid min-h-[160px] flex-1 grid-cols-[1fr_82px_1fr] items-stretch gap-3">
          <Pool
            label="SOURCE"
            amount={formatCkb(pair.source.outbound, { withUnit: false })}
            unit="CKB"
            channel={truncateId(pair.source.channelId, 6, 4)}
            value={outboundPct(pair.source)}
            trend=""
            running={running}
          />

          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              data-no-magnetic
              onClick={() => {
                setRunning((value) => !value);
                focusWorkspaceModule('rebalance');
              }}
              className="grid h-14 w-14 place-items-center rounded-full border border-white/16 bg-white/[0.06] text-white transition hover:border-white/40 hover:text-white"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">move</p>
            <p className="font-mono text-xs font-bold text-white/70">circular</p>
          </div>

          <Pool
            label="DESTINATION"
            amount={formatCkb(pair.dest.outbound, { withUnit: false })}
            unit="CKB"
            channel={truncateId(pair.dest.channelId, 6, 4)}
            value={outboundPct(pair.dest)}
            trend=""
            running={running}
            muted
          />
        </div>
      ) : (
        <div className="flex min-h-[160px] flex-1 items-center justify-center">
          <p className="font-mono text-[11px] text-white/40">
            {health.isError ? 'Node unreachable.' : health.isPending ? 'Loading channels…' : 'Need ≥1 channel to rebalance.'}
          </p>
        </div>
      )}
    </div>
  );
}
