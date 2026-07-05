'use client';

import { useEffect, useRef, useState } from 'react';
import { env } from '@/lib/env';

export interface RealtimeMessage {
  event: string;
  data: unknown;
}

/**
 * Backend -> frontend realtime channel (path `/realtime`). Reconnects with a
 * small backoff and parses the `{ event, data }` envelope the RealtimeGateway
 * sends (e.g. `balance-changed`). Returns the live connection status.
 */
export function useFiberSocket(onEvent?: (msg: RealtimeMessage) => void) {
  const [connected, setConnected] = useState(false);
  const cbRef = useRef(onEvent);
  cbRef.current = onEvent;

  useEffect(() => {
    const base = env.NEXT_PUBLIC_WS_URL;
    if (!base) return;
    const url = `${base.replace(/\/$/, '')}/realtime`;

    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const connect = () => {
      if (closed) return;
      try {
        ws = new WebSocket(url);
      } catch {
        retry = setTimeout(connect, 3000);
        return;
      }
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!closed) retry = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws?.close();
      ws.onmessage = (e) => {
        try {
          cbRef.current?.(JSON.parse(String(e.data)) as RealtimeMessage);
        } catch {
          /* ignore non-JSON frames */
        }
      };
    };
    connect();

    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      ws?.close();
    };
  }, []);

  return { connected };
}
