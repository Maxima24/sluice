import type { Hash256, Pubkey } from './json-rpc';

/**
 * `node_info` result. Only the fields we rely on are typed explicitly; the
 * index signature preserves everything else (counts, udt_cfg_infos, tlc params)
 * without asserting an encoding we haven't verified.
 */
export interface NodeInfoResult {
  version: string;
  commit_hash?: string;
  pubkey: Pubkey;
  node_name?: string | null;
  addresses: string[];
  chain_hash: Hash256;
  [k: string]: unknown;
}
