import type { Pubkey } from './json-rpc';

export interface PeerInfo {
  pubkey: Pubkey;
  address: string; // multiaddr, e.g. /ip4/…/tcp/8228/p2p/<peerid>
  [k: string]: unknown;
}

export interface ListPeersResult {
  peers: PeerInfo[];
}
