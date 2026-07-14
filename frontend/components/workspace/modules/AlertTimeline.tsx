import { useState } from 'react';
import { cn } from '@/lib/utils';
import { actionButtonClass, LiveDataSkeleton, severityBadgeClass } from './shared';

export function AlertTimeline() {
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const alerts = [
    { title: 'Outbound below 20%', severity: 'critical', age: '2m' },
    { title: 'Probe failed at hop C', severity: 'blocked', age: '4m' },
    { title: 'Rebalance queued', severity: 'queued', age: '8m' },
    { title: 'Snapshot drift surfaced', severity: 'audit', age: '12m' },
  ];

  return (
    <div className="flex h-full min-h-[260px] flex-col gap-2 bg-transparent">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">stream</p>
        <LiveDataSkeleton />
      </div>
      {alerts.map((alert) => (
        <div
          key={alert.title}
          className={cn(
            'rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition',
            acknowledged.includes(alert.title) ? 'border-white/[0.06] opacity-40' : '',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-bold text-white">{alert.title}</p>
            <button
              type="button"
              data-no-magnetic
              onClick={() => {
                setAcknowledged((current) =>
                  current.includes(alert.title) ? current.filter((item) => item !== alert.title) : [...current, alert.title],
                );
              }}
              className={actionButtonClass}
            >
              {acknowledged.includes(alert.title) ? 'undo' : 'ack'}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={severityBadgeClass(alert.severity)}>{alert.severity}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">{alert.age} ago</span>
          </div>
        </div>
      ))}
    </div>
  );
}
