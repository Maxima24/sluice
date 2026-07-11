export interface NodeInfo {
  version: string;
  pubkey: string;
  chainHash: string;
  nodeName?: string | null;
}

export interface ChannelHealthChannel {
  channelId: string;
  peerPubkey: string;
  state: string;
  outbound: string;
  inbound: string;
  capacity: string;
  inboundRatio: number;
  isUdt?: boolean;
  capturedAt?: string;
}

export interface ChannelHealth {
  source: 'live' | 'snapshot';
  stale: boolean;
  channels: ChannelHealthChannel[];
}

export interface ReconciliationStatus {
  inSync: boolean;
  tolerance: string;
  checkedAt: string;
  channels: Array<{
    channelId: string;
    inSync: boolean;
    snapshotOutbound: string | null;
    nodeOutbound: string | null;
    drift: string;
    driftAt?: string;
  }>;
}

export interface CinematicData {
  info: NodeInfo | null;
  health: ChannelHealth | null;
  reconciliation: ReconciliationStatus | null;
}
