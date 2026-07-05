/**
 * Per-channel liquidity summary. Amounts are exposed as decimal strings
 * (normalized from the node's 0x-hex u128) plus the raw hex, so the frontend
 * never has to touch hex or risk JS number precision loss.
 */
export interface ChannelSummaryDto {
  channelId: string;
  peerPubkey: string;
  state: string; // state_name, e.g. "ChannelReady"
  outbound: string; // our local_balance, decimal string
  inbound: string; // remote_balance, decimal string
  outboundHex: string; // raw node encoding
  inboundHex: string;
  capacity: string; // outbound + inbound, decimal string
  inboundRatio: number; // inbound / capacity in [0,1] — drives the balance bar
  isUdt: boolean; // true when funding_udt_type_script is present (non-CKB asset)
  udtScript?: { codeHash: string; hashType: string; args: string } | null;
}
