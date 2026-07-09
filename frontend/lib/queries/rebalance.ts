import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { RebalanceJob, RebalanceRequest } from '@/types/fiber';

const ACTIVE = new Set(['PENDING', 'BUILDING', 'INFLIGHT']);

export function useCreateRebalance() {
  return useMutation({
    mutationFn: (body: RebalanceRequest) => api.post<RebalanceJob>('rebalance', body),
  });
}

/** Polls a job every 2s while it's still running; stops once settled. */
export function useRebalanceJob(id: string | null) {
  return useQuery({
    queryKey: ['rebalance', id],
    queryFn: () => api.get<RebalanceJob>(`rebalance/${id}`),
    enabled: !!id,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE.has(status) ? 2000 : false;
    },
  });
}
