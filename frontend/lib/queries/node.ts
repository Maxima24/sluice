import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { NodeInfo, Peer } from '@/types/fiber';

export function useNodeInfo() {
  return useQuery({
    queryKey: ['node', 'info'],
    queryFn: () => api.get<NodeInfo>('node/info'),
    refetchInterval: 60_000, // node identity is near-static
    retry: false,
  });
}

export function useNodePeers() {
  return useQuery({
    queryKey: ['node', 'peers'],
    queryFn: () => api.get<Peer[]>('node/peers'),
    refetchInterval: 15_000,
    retry: false,
  });
}
