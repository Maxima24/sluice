import { Inject, Injectable, Logger } from '@nestjs/common';
import { SnapshotSource } from '@prisma/client';
import { NODE_SERVICE, type INodeService } from '../../node/node.public';
import { CHANNELS_SERVICE, type IChannelHealthService } from '../../channels/channels.public';
import { ReconciliationRepository } from '../repositories/reconciliation.repository';
import { reconcileChannel } from '../mappers/reconciliation.mapper';
import { DEFAULT_TOLERANCE } from '../types/reconciliation.types';
import type { IReconciliationService, ReconciliationStatusDto } from '../reconciliation.public';

/**
 * Compares the latest snapshot (our record) against a fresh list_channels (the
 * truth) and flags drift. The node ALWAYS wins (hard rule #2): on drift we
 * re-snapshot from the node — we never "correct" the node.
 */
@Injectable()
export class ReconciliationService implements IReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    @Inject(NODE_SERVICE) private readonly node: INodeService,
    @Inject(CHANNELS_SERVICE) private readonly channels: IChannelHealthService,
    private readonly repo: ReconciliationRepository,
  ) {}

  async getStatus(): Promise<ReconciliationStatusDto> {
    const now = new Date().toISOString();
    const [live, snapshots] = await Promise.all([
      this.node.listChannels(),
      this.repo.latestSnapshots(),
    ]);

    const nodeById = new Map(live.map((c) => [c.channelId, c]));
    const snapById = new Map(snapshots.map((s) => [s.channelId, s]));
    const ids = new Set<string>([...nodeById.keys(), ...snapById.keys()]);

    let allInSync = true;
    const channels = [...ids].map((id) => {
      const row = reconcileChannel(id, nodeById.get(id), snapById.get(id), DEFAULT_TOLERANCE, now);
      if (!row.inSync) allInSync = false;
      return row;
    });

    // Node wins: re-align the DB to the node on any drift (best-effort).
    if (!allInSync) {
      try {
        const written = await this.channels.captureSnapshot(SnapshotSource.EVENT);
        this.logger.warn(`Drift detected — re-snapshotted ${written} channel(s) from the node.`);
      } catch (err) {
        this.logger.warn(`Drift re-snapshot skipped: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return {
      inSync: allInSync,
      tolerance: DEFAULT_TOLERANCE.toString(10),
      channels,
      checkedAt: now,
    };
  }
}
