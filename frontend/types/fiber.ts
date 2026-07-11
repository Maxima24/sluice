export interface NodeInfo {
  version: string;
  commitHash?: string;
  pubkey: string;
  nodeName?: string | null;
  chainHash: string;
  addresses: string[];
}

export interface Peer {
  pubkey: string;
  address: string;
}

export interface UdtScript {
  codeHash: string;
  hashType: string;
  args: string;
}

export interface ChannelHealthDto {
  channelId: string;
  peerPubkey: string;
  state: string;
  outbound: string; // decimal
  inbound: string; // decimal
  capacity: string; // decimal
  inboundRatio: number; // [0,1]
  isUdt: boolean;
  udtScript?: UdtScript | null;
  capturedAt: string;
}

export interface ChannelHealth {
  source: 'live' | 'snapshot';
  stale: boolean;
  channels: ChannelHealthDto[];
}

/** WS `balance-changed` payload. */
export interface BalanceChanged {
  channelId: string;
  peerPubkey: string;
  state: string;
  outbound: string;
  inbound: string;
  capacity: string;
  inboundRatio: number;
  at: string;
}

export interface ProbeRequest {
  targetPubkey?: string;
  invoice?: string;
  amount: string;
  maxFee?: string;
}

export interface ProbeHop {
  pubkey: string;
  channelOutpoint?: string;
  amountReceived?: string;
  availableOutbound?: string;
}

export interface ProbeResult {
  payable: boolean;
  amount: string;
  fee?: string;
  reason?: string;
  hops?: ProbeHop[];
  bottleneck?: ProbeHop | null;
}

export interface RebalanceRequest {
  sourceChannelId: string;
  destChannelId: string;
  amount: string;
  maxFee: string;
  idempotencyKey: string;
}

/** status: PENDING | BUILDING | INFLIGHT | SUCCEEDED | FAILED */
export interface RebalanceJob {
  id: string;
  idempotencyKey: string;
  sourceChannelId: string;
  destChannelId: string;
  amount: string;
  maxFee: string;
  status: string;
  paymentHash: string | null;
  feePaid: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelReconciliation {
  channelId: string;
  inSync: boolean;
  snapshotOutbound: string | null;
  nodeOutbound: string | null;
  drift: string; // decimal |snapshot - node|
  driftAt?: string;
}

export interface ReconciliationStatus {
  inSync: boolean;
  tolerance: string;
  channels: ChannelReconciliation[];
  checkedAt: string;
}
