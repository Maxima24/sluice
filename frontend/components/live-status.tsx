'use client';

import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { StatusDot } from '@/components/ui/StatusDot';

/** Node WebSocket liveness indicator (hosts the app's single realtime connection). */
export function LiveStatus() {
  const { connected, lastEventAt } = useRealtimeSync();
  return (
    <div className="flex items-center gap-2 text-xs">
      <StatusDot tone={connected ? 'success' : 'danger'} pulse={connected} />
      <span className="text-neutral-600">{connected ? 'live' : 'offline'}</span>
      {lastEventAt ? (
        <span className="tabular-nums text-neutral-500" data-numeric>
          · {lastEventAt.toLocaleTimeString()}
        </span>
      ) : null}
    </div>
  );
}
