import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { ChannelHealth } from '@/types/fiber';

export const channelHealthKey = ['channels', 'health'] as const;

export function useChannelHealth() {
  return useQuery({
    queryKey: channelHealthKey,
    queryFn: () => api.get<ChannelHealth>('channels/health'),
    refetchInterval: 10_000, // safety net — the node/tunnel WS may drop
    retry: false, // surface a down node fast
  });
}
