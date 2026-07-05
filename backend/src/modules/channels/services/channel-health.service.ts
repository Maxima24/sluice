import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SnapshotSource } from '@prisma/client';
import { NODE_SERVICE, type INodeService } from '../../node/node.public';
import type { ChannelSummaryDto } from '../../node/dto/channel-summary.dto';
import { ChannelSnapshotRepository } from '../repositories/channel-snapshot.repository';
import {
  liveToHealthDto,
  snapshotToHealthDto,
  toSnapshotWriteInput,
} from '../mappers/channel.mapper';
import type { ChannelHealthResult, IChannelHealthService } from '../channels.public';
import type { SnapshotWriteInput } from '../types/channels.types';

/**
 * Channel liquidity health. Live-first (node is source of truth), persisting a
 * snapshot only when a channel is new/changed, with a last-known-snapshot
 * fallback when the node is unreachable.
 */
@Injectable()
export class ChannelHealthService implements IChannelHealthService, OnApplicationBootstrap {
  private readonly logger = new Logger(ChannelHealthService.name);

  constructor(
    @Inject(NODE_SERVICE) private readonly node: INodeService,
    private readonly snapshots: ChannelSnapshotRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const written = await this.captureSnapshot(SnapshotSource.BOOT);
      this.logger.log(`Boot snapshot captured — ${written} channel(s) written`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Boot snapshot skipped — node unreachable: ${msg}`);
    }
  }

  async getHealth(): Promise<ChannelHealthResult> {
    try {
      const live = await this.node.listChannels();
      await this.persistChanged(live, SnapshotSource.POLL);
      const now = new Date();
      return {
        source: 'live',
        stale: false,
        channels: live.map((c) => liveToHealthDto(c, now)),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Live channels unavailable — serving last snapshot: ${msg}`);
      const latest = await this.snapshots.latestPerChannel();
      return {
        source: 'snapshot',
        stale: true,
        channels: latest.map(snapshotToHealthDto),
      };
    }
  }

  async captureSnapshot(source: SnapshotSource): Promise<number> {
    const live = await this.node.listChannels();
    return this.persistChanged(live, source);
  }

  /** Write snapshot rows only for channels that are new or whose balance/state changed. */
  private async persistChanged(
    live: ChannelSummaryDto[],
    source: SnapshotSource,
  ): Promise<number> {
    const latest = await this.snapshots.latestPerChannel();
    const byId = new Map(latest.map((s) => [s.channelId, s]));
    const changed: SnapshotWriteInput[] = [];
    for (const c of live) {
      const prev = byId.get(c.channelId);
      const unchanged =
        prev !== undefined &&
        prev.localBalance.toFixed(0) === c.outbound &&
        prev.remoteBalance.toFixed(0) === c.inbound &&
        prev.stateName === c.state;
      if (!unchanged) changed.push(toSnapshotWriteInput(c, source));
    }
    return this.snapshots.createMany(changed);
  }
}
