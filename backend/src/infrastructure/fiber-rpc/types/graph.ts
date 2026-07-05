import type { Hash256, Pubkey, U128Hex, U64Hex } from './json-rpc';
import type { FiberScript } from './channels';

/** Per-direction network-side liquidity lives inside each node's update info. */
export interface ChannelUpdateInfo {
  timestamp?: U64Hex | string;
  enabled?: boolean;
  outbound_liquidity?: U128Hex;
  tlc_expiry_delta?: U64Hex;
  tlc_minimum_value?: U128Hex;
  fee_rate?: U64Hex;
  [k: string]: unknown;
}

export interface GraphChannelInfo {
  channel_outpoint: string;
  node1: Pubkey;
  node2: Pubkey;
  created_timestamp?: U64Hex | string;
  capacity: U128Hex;
  chain_hash?: Hash256;
  udt_type_script?: FiberScript | null;
  update_info_of_node1?: ChannelUpdateInfo | null;
  update_info_of_node2?: ChannelUpdateInfo | null;
  [k: string]: unknown;
}

export interface GraphChannelsParams {
  limit?: number;
  after?: string;
}

export interface GraphChannelsResult {
  channels: GraphChannelInfo[];
  last_cursor?: string;
}
