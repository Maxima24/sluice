import type { ChannelHealth, NodeInfo, ReconciliationStatus } from '@/types/fiber';

export interface CinematicData {
  info: NodeInfo | null;
  health: ChannelHealth | null;
  reconciliation: ReconciliationStatus | null;
}
