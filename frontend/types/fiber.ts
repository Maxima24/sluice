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
