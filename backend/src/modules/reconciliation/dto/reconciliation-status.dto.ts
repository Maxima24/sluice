export interface ChannelReconciliationDto {
  channelId: string;
  inSync: boolean;
  snapshotOutbound: string | null; // decimal; null if no snapshot
  nodeOutbound: string | null; // decimal; null if not on the node
  drift: string; // |snapshot - node| decimal
  driftAt?: string; // ISO, present when out of sync
}

export interface ReconciliationStatusDto {
  inSync: boolean; // overall
  tolerance: string;
  channels: ChannelReconciliationDto[];
  checkedAt: string;
}
