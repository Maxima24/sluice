import { Injectable } from '@nestjs/common';
import { Prisma, type RebalanceJob } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { RebalanceJobRepository } from '../repositories/rebalance-job.repository';
import { RebalanceQueue } from '../queues/rebalance.queue';
import { toRebalanceJobDto } from '../mappers/rebalance.mapper';
import type { IRebalanceService, RebalanceInput } from '../rebalance.public';
import type { RebalanceJobDto } from '../dto/rebalance-job.dto';

/**
 * Accepts a rebalance request, creates the job idempotently (serializable txn +
 * unique idempotencyKey), and enqueues off-request work. A retry/double-submit
 * with the same key returns the same job and never enqueues twice (hard rule #3).
 */
@Injectable()
export class RebalanceService implements IRebalanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: RebalanceJobRepository,
    private readonly queue: RebalanceQueue,
  ) {}

  async request(input: RebalanceInput): Promise<RebalanceJobDto> {
    let job: RebalanceJob | undefined;
    let created = false;

    for (let attempt = 1; ; attempt++) {
      try {
        const result = await this.prisma.$transaction(
          async (tx) => {
            const existing = await this.repo.findByIdempotencyKey(input.idempotencyKey, tx);
            if (existing) return { job: existing, created: false };
            const fresh = await this.repo.create(
              {
                idempotencyKey: input.idempotencyKey,
                sourceChannelId: input.sourceChannelId,
                destChannelId: input.destChannelId,
                amount: new Prisma.Decimal(input.amount),
                maxFee: new Prisma.Decimal(input.maxFee),
              },
              tx,
            );
            return { job: fresh, created: true };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
        job = result.job;
        created = result.created;
        break;
      } catch (e) {
        if (this.isRetryable(e) && attempt < 3) continue;
        throw e;
      }
    }

    if (created) await this.queue.enqueue({ jobId: job.id }); // off the request path
    return toRebalanceJobDto(job);
  }

  async getJob(id: string): Promise<RebalanceJobDto | null> {
    const j = await this.repo.findById(id);
    return j ? toRebalanceJobDto(j) : null;
  }

  private isRetryable(e: unknown): boolean {
    return (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === 'P2002' /* unique violation from a racing insert */ ||
        e.code === 'P2034') /* serialization failure */
    );
  }
}
