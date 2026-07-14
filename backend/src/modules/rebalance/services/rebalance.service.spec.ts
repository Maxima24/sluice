import { describe, expect, it, vi } from 'vitest';
import { Prisma, type RebalanceJob } from '@prisma/client';
import { RebalanceService } from './rebalance.service';
import type { RebalanceInput } from '../rebalance.public';

function makeJob(over: Partial<RebalanceJob> = {}): RebalanceJob {
  return {
    id: 'job-1',
    idempotencyKey: 'key-1',
    sourceChannelId: 'src',
    destChannelId: 'dst',
    amount: new Prisma.Decimal('100'),
    maxFee: new Prisma.Decimal('5'),
    status: 'PENDING',
    paymentHash: null,
    feePaid: null,
    error: null,
    createdAt: new Date('2026-07-13T00:00:00.000Z'),
    updatedAt: new Date('2026-07-13T00:00:00.000Z'),
    ...over,
  } as RebalanceJob;
}

function setup() {
  const repo = { findByIdempotencyKey: vi.fn(), create: vi.fn(), findById: vi.fn() };
  const queue = { enqueue: vi.fn().mockResolvedValue(undefined) };
  const prisma = { $transaction: vi.fn(async (cb: (tx: unknown) => unknown) => cb({})) };
  const service = new RebalanceService(prisma as never, repo as never, queue as never);
  return { service, repo, queue, prisma };
}

const input: RebalanceInput = {
  idempotencyKey: 'key-1',
  sourceChannelId: 'src',
  destChannelId: 'dst',
  amount: '100',
  maxFee: '5',
};

describe('RebalanceService.request (idempotency + concurrency, hard rule #3)', () => {
  it('creates and enqueues exactly once for a new key', async () => {
    const { service, repo, queue } = setup();
    repo.findByIdempotencyKey.mockResolvedValue(null);
    repo.create.mockResolvedValue(makeJob());

    const dto = await service.request(input);

    expect(dto.id).toBe('job-1');
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(queue.enqueue).toHaveBeenCalledTimes(1);
    expect(queue.enqueue).toHaveBeenCalledWith({ jobId: 'job-1' });
  });

  it('returns the existing job and never re-enqueues on a duplicate key', async () => {
    const { service, repo, queue } = setup();
    repo.findByIdempotencyKey.mockResolvedValue(makeJob({ status: 'INFLIGHT' }));

    const dto = await service.request(input);

    expect(dto.id).toBe('job-1');
    expect(dto.status).toBe('INFLIGHT');
    expect(repo.create).not.toHaveBeenCalled();
    expect(queue.enqueue).not.toHaveBeenCalled();
  });

  it('retries a serialization/unique conflict (P2002) then succeeds once', async () => {
    const { service, repo, queue, prisma } = setup();
    const conflict = new Prisma.PrismaClientKnownRequestError('unique violation', {
      code: 'P2002',
      clientVersion: '7.0.0',
    });
    prisma.$transaction
      .mockRejectedValueOnce(conflict)
      .mockImplementationOnce(async (cb: (tx: unknown) => unknown) => cb({}));
    repo.findByIdempotencyKey.mockResolvedValue(null);
    repo.create.mockResolvedValue(makeJob());

    const dto = await service.request(input);

    expect(dto.id).toBe('job-1');
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(queue.enqueue).toHaveBeenCalledTimes(1);
  });

  it('does not retry a non-retryable error', async () => {
    const { service, prisma } = setup();
    prisma.$transaction.mockRejectedValue(new Error('boom'));

    await expect(service.request(input)).rejects.toThrow('boom');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
