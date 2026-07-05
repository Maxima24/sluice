import { Injectable } from '@nestjs/common';
import { Prisma, RebalanceStatus, type RebalanceJob } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/** Persistence for rebalance jobs. The @unique idempotencyKey is the ultimate
 *  double-execution guard; the serializable txn + retry handle concurrent submits. */
@Injectable()
export class RebalanceJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByIdempotencyKey(key: string, tx?: Prisma.TransactionClient): Promise<RebalanceJob | null> {
    return (tx ?? this.prisma).rebalanceJob.findUnique({ where: { idempotencyKey: key } });
  }

  create(data: Prisma.RebalanceJobCreateInput, tx?: Prisma.TransactionClient): Promise<RebalanceJob> {
    return (tx ?? this.prisma).rebalanceJob.create({ data });
  }

  findById(id: string): Promise<RebalanceJob | null> {
    return this.prisma.rebalanceJob.findUnique({ where: { id } });
  }

  update(
    id: string,
    status: RebalanceStatus,
    extra: Prisma.RebalanceJobUpdateInput = {},
    tx?: Prisma.TransactionClient,
  ): Promise<RebalanceJob> {
    return (tx ?? this.prisma).rebalanceJob.update({ where: { id }, data: { status, ...extra } });
  }
}
