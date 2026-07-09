import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { ReconciliationStatus } from '@/types/fiber';

export function useReconciliation() {
  return useQuery({
    queryKey: ['reconciliation', 'status'],
    queryFn: () => api.get<ReconciliationStatus>('reconciliation/status'),
    refetchInterval: 15_000,
    retry: false,
  });
}
