import type { ChannelSnapshot } from '@prisma/client';
import type { ChannelSummaryDto } from '../../node/dto/channel-summary.dto';
import type { ChannelReconciliationDto } from '../dto/reconciliation-status.dto';

/** Pure per-channel compare of our latest snapshot (record) vs the live node (truth). */
export function reconcileChannel(
  channelId: string,
  node: ChannelSummaryDto | undefined,
  snap: ChannelSnapshot | undefined,
  tolerance: bigint,
  now: string,
): ChannelReconciliationDto {
  const nodeOut = node ? BigInt(node.outbound) : null;
  const snapOut = snap ? BigInt(snap.localBalance.toFixed(0)) : null;

  let drift = 0n;
  let inSync: boolean;
  if (nodeOut !== null && snapOut !== null) {
    drift = nodeOut > snapOut ? nodeOut - snapOut : snapOut - nodeOut;
    inSync = drift <= tolerance;
  } else {
    inSync = false; // present on only one side is itself drift
  }

  return {
    channelId,
    inSync,
    snapshotOutbound: snapOut !== null ? snapOut.toString(10) : null,
    nodeOutbound: nodeOut !== null ? nodeOut.toString(10) : null,
    drift: drift.toString(10),
    driftAt: inSync ? undefined : now,
  };
}
