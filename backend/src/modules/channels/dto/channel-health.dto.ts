/**
 * Per-channel liquidity health for the dashboard. Amounts are decimal strings
 * (normalized u128) — never hex, never JS number. `capturedAt` is the request
 * time for live data, or the snapshot row time when served from the fallback.
 */
export interface ChannelHealthDto {
  channelId: string;
  peerPubkey: string;
  state: string; // state_name, e.g. "ChannelReady"
  outbound: string; // our local_balance, decimal
  inbound: string; // remote_balance, decimal
  capacity: string; // outbound + inbound, decimal
  inboundRatio: number; // inbound / capacity in [0,1] — drives the balance bar
  isUdt: boolean;
  udtScript?: { codeHash: string; hashType: string; args: string } | null;
  capturedAt: string; // ISO
}
