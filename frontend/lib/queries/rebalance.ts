import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { LedgerEntry, RebalanceJob, RebalanceRequest } from '@/types/fiber';

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

/** Recent rebalance jobs (audit history), newest first. */
export function useRebalanceHistory() {
  return useQuery({
    queryKey: ['rebalance', 'history'],
    queryFn: () => api.get<RebalanceJob[]>('rebalance'),
    refetchInterval: 5000,
    retry: false,
  });
}

/** Double-entry ledger entries for a settled rebalance. */
export function useLedger(jobId: string | null) {
  return useQuery({
    queryKey: ['ledger', jobId],
    queryFn: () => api.get<LedgerEntry[]>(`ledger/${jobId}`),
    enabled: !!jobId,
    retry: false,
  });
}
