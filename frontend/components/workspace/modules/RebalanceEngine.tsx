import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { focusWorkspaceModule } from '@/lib/workspace';
import { Badge, LiveDataSkeleton, Pool } from './shared';

export function RebalanceEngine() {
  const [running, setRunning] = useState(true);

  return (
    <div className="flex h-full min-h-[330px] flex-col gap-3 bg-transparent">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge>CIRCULAR PAYMENT</Badge>
            <p className="mt-2 text-xs text-white/55">liquidity is moving through the route</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge>{running ? 'INFLIGHT' : 'PAUSED'}</Badge>
            <LiveDataSkeleton />
          </div>
        </div>
      </div>

      <div className="grid min-h-[160px] flex-1 grid-cols-[1fr_82px_1fr] items-stretch gap-3">
        <Pool label="SOURCE" amount="8.42" unit="CKB" channel="CHAN-01" value={82} trend="-1.2" running={running} />

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
          <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">fee cap</p>
          <p data-numeric className="font-mono text-xs font-bold text-white/70">0.003</p>
        </div>

        <Pool label="DESTINATION" amount="2.19" unit="CKB" channel="CHAN-04" value={31} trend="+1.2" running={running} muted />
      </div>
    </div>
  );
}
