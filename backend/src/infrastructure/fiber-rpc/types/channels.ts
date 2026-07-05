import type { Hash256, Pubkey, U128Hex, U64Hex } from './json-rpc';

export interface FiberScript {
  code_hash: Hash256;
  hash_type: string;
  args: string;
}

/** FNN serializes channel state as a tagged object, not a bare string. */
export interface ChannelState {
  state_name: string; // e.g. "ChannelReady", "AwaitingChannelReady"
  state_flags?: string | string[];
}

export interface ChannelInfo {
  channel_id: Hash256;
  pubkey: Pubkey; // peer identity — there is NO `peer_id` field on a channel
  is_public?: boolean;
  is_acceptor?: boolean;
  channel_outpoint?: string | null;
  state: ChannelState;
  local_balance: U128Hex; // our OUTBOUND capacity
  remote_balance: U128Hex; // INBOUND capacity
  offered_tlc_balance?: U128Hex;
  received_tlc_balance?: U128Hex;
  funding_udt_type_script?: FiberScript | null; // present => non-CKB (UDT) asset
  created_at?: U64Hex | string;
  enabled?: boolean;
  [k: string]: unknown;
}

export interface ListChannelsParams {
  pubkey?: Pubkey;
  include_closed?: boolean;
}

export interface ListChannelsResult {
  channels: ChannelInfo[];
}
