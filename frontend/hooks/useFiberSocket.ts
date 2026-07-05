'use client';

import { useEffect, useRef } from 'react';
import { env } from '@/lib/env';

/**
 * Step-4 placeholder for the backend->frontend realtime channel. Opens the WS
 * and logs its lifecycle. In Step 4 this subscribes to `balance-changed` events
 * and drives live bar updates. Safe no-op if NEXT_PUBLIC_WS_URL is unset.
 */
export function useFiberSocket(onMessage?: (data: unknown) => void) {
  const ref = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = env.NEXT_PUBLIC_WS_URL;
    if (!url) return;

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      return;
    }
    ref.current = ws;

    ws.onopen = () => console.debug('[fiber-ws] open', url);
    ws.onclose = () => console.debug('[fiber-ws] close');
    ws.onerror = () => console.debug('[fiber-ws] error');
    ws.onmessage = (e) => onMessage?.(e.data);

    return () => ws.close();
  }, [onMessage]);

  return ref;
}
