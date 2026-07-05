'use client';

import { useState } from 'react';
import { useFiberSocket, type RealtimeMessage } from '@/hooks/useFiberSocket';

/** Minimal live indicator proving the backend->frontend push works (Step 4). */
export function LiveStatus() {
  const [last, setLast] = useState<string | null>(null);
  const { connected } = useFiberSocket((msg: RealtimeMessage) => {
    if (msg.event === 'balance-changed') setLast(new Date().toLocaleTimeString());
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--color-muted)' }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: connected ? 'var(--color-inbound)' : 'var(--color-danger)',
        }}
      />
      {connected ? 'live' : 'disconnected'}
      {last ? ` · last update ${last}` : ''}
    </div>
  );
}
