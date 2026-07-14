import { useState } from 'react';
import { cn } from '@/lib/utils';
import { actionButtonClass, LiveDataSkeleton, severityBadgeClass } from './shared';
import { useChannelHealth } from '@/lib/queries/channels';
import { useReconciliation } from '@/lib/queries/reconciliation';
import { deriveAlerts } from '@/lib/liquidity';

export function AlertTimeline() {
  const health = useChannelHealth();
  const recon = useReconciliation();
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  const alerts = deriveAlerts(health.data, recon.data).map((alert) => ({
    id: alert.id,
    title: alert.text,
    severity: alert.tone === 'danger' ? 'critical' : 'watch',
  }));

  return (
    <div className="flex h-full min-h-[260px] flex-col gap-2 bg-transparent">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">stream</p>
        <LiveDataSkeleton />
      </div>
      {alerts.length === 0 ? (
        <p className="font-mono text-[11px] text-white/40">
          {health.isError ? 'Node unreachable.' : health.isPending ? 'Loading…' : 'All channels healthy.'}
        </p>
      ) : (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition',
              acknowledged.includes(alert.id) ? 'border-white/[0.06] opacity-40' : '',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-bold text-white">{alert.title}</p>
              <button
                type="button"
                data-no-magnetic
                onClick={() => {
                  setAcknowledged((current) =>
                    current.includes(alert.id) ? current.filter((item) => item !== alert.id) : [...current, alert.id],
                  );
                }}
                className={actionButtonClass}
              >
                {acknowledged.includes(alert.id) ? 'undo' : 'ack'}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={severityBadgeClass(alert.severity)}>{alert.severity}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">live</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
