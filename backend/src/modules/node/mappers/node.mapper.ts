import { u128FromHex } from '../../../infrastructure/fiber-rpc/u128';
import type { NodeInfoResult } from '../../../infrastructure/fiber-rpc/types/node-info';
import type { ChannelInfo, FiberScript } from '../../../infrastructure/fiber-rpc/types/channels';
import type { PeerInfo } from '../../../infrastructure/fiber-rpc/types/peers';
import type { NodeInfoDto } from '../dto/node-info.dto';
import type { ChannelSummaryDto } from '../dto/channel-summary.dto';
import type { PeerDto } from '../dto/peer.dto';
import type { NormalizedBalances } from '../types/node.types';

/**
 * Pure transforms: raw RPC types -> domain DTOs. This is the seam where u128
 * hex is normalized to decimal strings/BigInt — never in the controller.
 */

export function toNodeInfoDto(r: NodeInfoResult): NodeInfoDto {
  return {
    version: r.version,
    commitHash: typeof r.commit_hash === 'string' ? r.commit_hash : undefined,
    pubkey: r.pubkey,
    nodeName: (r.node_name as string | null | undefined) ?? null,
    chainHash: r.chain_hash,
    addresses: Array.isArray(r.addresses) ? r.addresses : [],
  };
}

export function normalizeBalances(c: ChannelInfo): NormalizedBalances {
  const outbound = u128FromHex(c.local_balance);
  const inbound = u128FromHex(c.remote_balance);
  const capacity = outbound + inbound;
  const inboundRatio =
    capacity > 0n ? Number((inbound * 10_000n) / capacity) / 10_000 : 0;
  return {
    outbound: outbound.toString(10),
    inbound: inbound.toString(10),
    outboundHex: c.local_balance,
    inboundHex: c.remote_balance,
    capacity: capacity.toString(10),
    inboundRatio,
  };
}

function toUdtScript(s?: FiberScript | null) {
  if (!s) return null;
  return { codeHash: s.code_hash, hashType: s.hash_type, args: s.args };
}

export function toChannelSummaryDto(c: ChannelInfo): ChannelSummaryDto {
  const b = normalizeBalances(c);
  return {
    channelId: c.channel_id,
    peerPubkey: c.pubkey,
    state: c.state?.state_name ?? 'Unknown',
    outbound: b.outbound,
    inbound: b.inbound,
    outboundHex: b.outboundHex,
    inboundHex: b.inboundHex,
    capacity: b.capacity,
    inboundRatio: b.inboundRatio,
    isUdt: !!c.funding_udt_type_script,
    udtScript: toUdtScript(c.funding_udt_type_script),
  };
}

export function toChannelSummaryDtos(channels: ChannelInfo[]): ChannelSummaryDto[] {
  return channels.map(toChannelSummaryDto);
}

export function toPeerDto(p: PeerInfo): PeerDto {
  return { pubkey: p.pubkey, address: p.address };
}

export function toPeerDtos(peers: PeerInfo[]): PeerDto[] {
  return peers.map(toPeerDto);
}
