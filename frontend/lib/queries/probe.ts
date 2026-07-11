import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { ProbeRequest, ProbeResult } from '@/types/fiber';

export function useProbe() {
  return useMutation({
    mutationFn: (body: ProbeRequest) => api.post<ProbeResult>('routing/probe', body),
  });
}
