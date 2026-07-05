import { Injectable } from '@nestjs/common';
import type { ChannelSnapshot } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/** Reads the latest persisted snapshot per channel (the record side of the compare). */
@Injectable()
export class ReconciliationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async latestSnapshots(): Promise<ChannelSnapshot[]> {
    const rows = await this.prisma.channelSnapshot.findMany({ orderBy: { capturedAt: 'desc' } });
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
}
