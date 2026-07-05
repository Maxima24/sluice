/**
 * A liquidity-meaning event pushed to the browser (never a raw node event).
 * Amounts are decimal strings, matching ChannelHealthDto.
 */
export interface BalanceChangedDto {
  channelId: string;
  peerPubkey: string;
  state: string;
  outbound: string; // decimal
  inbound: string; // decimal
  capacity: string; // decimal
  inboundRatio: number; // [0,1]
  at: string; // ISO
}
