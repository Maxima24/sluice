import { Injectable } from '@nestjs/common';
import { Prisma, type ChannelSnapshot } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { SnapshotWriteInput } from '../types/channels.types';

/**
 * Persistence data-access for channel snapshots. The ONLY place the channels
 * context touches Postgres. Constructs Prisma.Decimal from the mapper's decimal
 * strings. Snapshots are records — never authoritative over node balances.
 */
@Injectable()
export class ChannelSnapshotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(
    inputs: SnapshotWriteInput[],
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    if (inputs.length === 0) return 0;
    const client = tx ?? this.prisma;
    const data: Prisma.ChannelSnapshotCreateManyInput[] = inputs.map((i) => ({
      channelId: i.channelId,
      peerPubkey: i.peerPubkey,
      stateName: i.stateName,
      localBalance: new Prisma.Decimal(i.localBalance),
      remoteBalance: new Prisma.Decimal(i.remoteBalance),
      capacity: new Prisma.Decimal(i.capacity),
      isUdt: i.isUdt,
      fundingUdtTypeScript: (i.fundingUdtTypeScript ??
        Prisma.JsonNull) as Prisma.InputJsonValue,
      source: i.source,
    }));
    const res = await client.channelSnapshot.createMany({ data });
    return res.count;
  }

  /**
   * Latest snapshot per channel (append-only history → newest wins). Deduped in
   * JS to keep Prisma.Decimal typing; fine at single-node scale. Feeds Step 7.
   */
  async latestPerChannel(): Promise<ChannelSnapshot[]> {
    const rows = await this.prisma.channelSnapshot.findMany({
      orderBy: { capturedAt: 'desc' },
    });
    const seen = new Set<string>();
    const latest: ChannelSnapshot[] = [];
    for (const r of rows) {
      if (!seen.has(r.channelId)) {
        seen.add(r.channelId);
        latest.push(r);
      }
    }
    return latest;
  }

  findLatest(channelId: string): Promise<ChannelSnapshot | null> {
    return this.prisma.channelSnapshot.findFirst({
      where: { channelId },
      orderBy: { capturedAt: 'desc' },
    });
  }
}
