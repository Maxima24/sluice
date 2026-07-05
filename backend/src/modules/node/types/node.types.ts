/**
 * Internal domain value types for the node context (not exposed as DTOs).
 * The normalized balance tuple the mapper computes from a raw ChannelInfo.
 */
export interface NormalizedBalances {
  outbound: string; // decimal
  inbound: string; // decimal
  outboundHex: string;
  inboundHex: string;
  capacity: string; // decimal
  inboundRatio: number; // [0,1]
}
