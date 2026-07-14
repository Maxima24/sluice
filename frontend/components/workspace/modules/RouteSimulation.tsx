import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { actionButtonClass, Badge, MetricStrip, primaryButtonClass } from './shared';

export function RouteSimulation() {
  const [state, setState] = useState<'probe' | 'bottleneck' | 'reroute'>('probe');
  const statusCopy = {
    probe: ['route payable / 5 hops', '82.3%'],
    bottleneck: ['blocked at hop C / outbound drained', '12.4%'],
    reroute: ['alternate via D selected', '91.0%'],
  } as const;
  const hops = ['A', 'B', 'C', 'D', 'E'];
  const activeHop = state === 'bottleneck' ? 'C' : state === 'reroute' ? 'D' : 'A';

  return (
    <div className="flex h-full min-h-[260px] flex-col gap-4 bg-transparent">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">pre-flight result</p>
          <Badge>{statusCopy[state][1]} confidence</Badge>
        </div>

        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {hops.map((hop, index) => (
            <div key={hop} className="flex min-w-0 flex-1 items-center gap-2">
              <motion.span
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/[0.06] font-mono text-xs text-white/60',
                  activeHop === hop ? 'border-none bg-white font-bold text-black' : '',
                )}
                animate={activeHop === hop ? { scale: [1, 1.08, 1] } : undefined}
                transition={{ duration: 1.8, repeat: activeHop === hop ? Infinity : 0, ease: 'easeInOut' }}
              >
                {hop}
              </motion.span>
              {index < hops.length - 1 ? (
                <span
                  className={cn(
                    'h-px flex-1 bg-white/15',
                    state === 'bottleneck' && index === 1 ? 'border-t-2 border-dashed border-white/70 bg-transparent' : '',
                  )}
                />
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/50">{statusCopy[state][0]}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ['probe', 'PROBE'],
            ['bottleneck', 'SHOW BOTTLENECK'],
            ['reroute', 'SELECT ALT'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              data-no-magnetic
              onClick={() => setState(value as 'probe' | 'bottleneck' | 'reroute')}
              className={cn(actionButtonClass, state === value ? primaryButtonClass : '')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <MetricStrip
        items={[
          ['FEE CEILING', '0.003 CKB'],
          ['BOTTLENECK', state === 'bottleneck' ? 'hop C' : 'none'],
          ['ALT ROUTES', '3'],
          ['STATUS', state === 'bottleneck' ? 'blocked' : 'payable'],
        ]}
      />
    </div>
  );
}
