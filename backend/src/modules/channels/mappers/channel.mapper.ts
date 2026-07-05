import type { ChannelSnapshot, SnapshotSource } from '@prisma/client';
import type { ChannelSummaryDto } from '../../node/dto/channel-summary.dto';
import type { ChannelHealthDto } from '../dto/channel-health.dto';
import type { SnapshotWriteInput } from '../types/channels.types';

/**
 * Pure transforms bridging the node context's live DTO, the persistence row,
 * and the dashboard DTO. Amount math is BigInt; storage/return values are
 * decimal strings.
 */

export function toSnapshotWriteInput(
  c: ChannelSummaryDto,
  source: SnapshotSource,
): SnapshotWriteInput {
  return {
    channelId: c.channelId,
    peerPubkey: c.peerPubkey,
    stateName: c.state,
    localBalance: c.outbound,
    remoteBalance: c.inbound,
    capacity: c.capacity,
    isUdt: c.isUdt,
    fundingUdtTypeScript: c.udtScript ?? null,
    source,
  };
}

export function liveToHealthDto(c: ChannelSummaryDto, capturedAt: Date): ChannelHealthDto {
  return {
    channelId: c.channelId,
    peerPubkey: c.peerPubkey,
    state: c.state,
    outbound: c.outbound,
    inbound: c.inbound,
    capacity: c.capacity,
    inboundRatio: c.inboundRatio,
    isUdt: c.isUdt,
    udtScript: c.udtScript ?? null,
    capturedAt: capturedAt.toISOString(),
  };
}

export function snapshotToHealthDto(s: ChannelSnapshot): ChannelHealthDto {
  const inbound = BigInt(s.remoteBalance.toFixed(0));
  const capacity = BigInt(s.capacity.toFixed(0));
  const inboundRatio = capacity > 0n ? Number((inbound * 10_000n) / capacity) / 10_000 : 0;
  return {
    channelId: s.channelId,
    peerPubkey: s.peerPubkey,
    state: s.stateName,
    outbound: BigInt(s.localBalance.toFixed(0)).toString(10),
    inbound: inbound.toString(10),
    capacity: capacity.toString(10),
    inboundRatio,
    isUdt: s.isUdt,
    udtScript:
      (s.fundingUdtTypeScript as { codeHash: string; hashType: string; args: string } | null) ??
      null,
    capturedAt: s.capturedAt.toISOString(),
  };
}
