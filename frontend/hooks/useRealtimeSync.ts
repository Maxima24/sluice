'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFiberSocket, type RealtimeMessage } from '@/hooks/useFiberSocket';
import { channelHealthKey } from '@/lib/queries/channels';
import type { BalanceChanged, ChannelHealth, ChannelHealthDto } from '@/types/fiber';

/**
 * Hosts the single backend->frontend WebSocket for the app. On `balance-changed`
 * it PATCHES the channel-health query cache in place (the WS payload is complete,
 * and the node may be tunnel-flaky, so liveness never waits on a refetch — the
 * 10s poll reconciles drift). Mount once (in the TopBar's LiveStatus).
 */
export function useRealtimeSync() {
  const qc = useQueryClient();
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);

  const onEvent = useCallback(
    (msg: RealtimeMessage) => {
      if (msg.event !== 'balance-changed') return;
      const d = msg.data as BalanceChanged;
      setLastEventAt(new Date());
      qc.setQueryData<ChannelHealth>(channelHealthKey, (prev) => {
        if (!prev) return prev; // dashboard not mounted yet — nothing to patch
        const idx = prev.channels.findIndex((c) => c.channelId === d.channelId);
        const patched: ChannelHealthDto = {
          ...(prev.channels[idx] ?? { isUdt: false, udtScript: null }),
          channelId: d.channelId,
          peerPubkey: d.peerPubkey,
          state: d.state,
          outbound: d.outbound,
          inbound: d.inbound,
          capacity: d.capacity,
          inboundRatio: d.inboundRatio,
          capturedAt: d.at,
        };
        const channels =
          idx >= 0 ? prev.channels.map((c, j) => (j === idx ? patched : c)) : [...prev.channels, patched];
        return { ...prev, source: 'live', stale: false, channels };
      });
    },
    [qc],
  );

  const { connected } = useFiberSocket(onEvent);
  return { connected, lastEventAt };
}
