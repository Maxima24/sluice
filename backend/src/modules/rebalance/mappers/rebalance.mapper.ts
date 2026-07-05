import type { RebalanceJob } from '@prisma/client';
import type { RebalanceJobDto } from '../dto/rebalance-job.dto';

export function toRebalanceJobDto(j: RebalanceJob): RebalanceJobDto {
  return {
    id: j.id,
    idempotencyKey: j.idempotencyKey,
    sourceChannelId: j.sourceChannelId,
    destChannelId: j.destChannelId,
    amount: j.amount.toFixed(0),
    maxFee: j.maxFee.toFixed(0),
    status: j.status,
    paymentHash: j.paymentHash,
    feePaid: j.feePaid ? j.feePaid.toFixed(0) : null,
    error: j.error,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  };
}
