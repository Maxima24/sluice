import { describe, expect, it, vi } from 'vitest';
import { Prisma, RebalanceStatus, type RebalanceJob } from '@prisma/client';
import { RebalanceExecutor } from './rebalance.executor';

function makeJob(): RebalanceJob {
  return {
    id: 'job-sim',
    idempotencyKey: 'k',
    sourceChannelId: 'src',
    destChannelId: 'dst',
    amount: new Prisma.Decimal('100000'),
    maxFee: new Prisma.Decimal('1000'),
    status: 'PENDING',
    paymentHash: null,
    feePaid: null,
    error: null,
    router: null,
    createdAt: new Date('2026-07-15T00:00:00.000Z'),
    updatedAt: new Date('2026-07-15T00:00:00.000Z'),
  } as RebalanceJob;
}

function setup(rebalanceSimulate: boolean) {
  const fiber = {
    buildRouter: vi.fn(),
    sendPaymentWithRouter: vi.fn(),
    listChannels: vi.fn(),
    nodeInfo: vi.fn(),
    getPayment: vi.fn(),
    sendPayment: vi.fn(),
  };
  const prisma = { $transaction: vi.fn(async (cb: (tx: unknown) => unknown) => cb({})) };
  const repo = { findById: vi.fn().mockResolvedValue(makeJob()), update: vi.fn().mockResolvedValue(makeJob()) };
  const ledger = { writeRebalancePair: vi.fn().mockResolvedValue(undefined) };
  const gateway = { broadcast: vi.fn() };
  const config = { rebalanceSimulate };
  const executor = new RebalanceExecutor(
    fiber as never,
    prisma as never,
    repo as never,
    ledger as never,
    gateway as never,
    config as never,
  );
  return { executor, fiber, repo, ledger, gateway };
}

describe('RebalanceExecutor — simulation mode (REBALANCE_SIMULATE)', () => {
  it('settles the job and writes a balanced double-entry ledger WITHOUT calling the node', async () => {
    const { executor, fiber, repo, ledger } = setup(true);

    await executor.execute({ jobId: 'job-sim' });

    // Reached SUCCEEDED (settle → repo.update with the SUCCEEDED status inside the txn).
    expect(repo.update).toHaveBeenCalledWith(
      'job-sim',
      RebalanceStatus.SUCCEEDED,
      expect.anything(),
      expect.anything(),
    );

    // Wrote the double-entry ledger; fee is small and ≤ maxFee → the pair balances.
    expect(ledger.writeRebalancePair).toHaveBeenCalledTimes(1);
    const input = ledger.writeRebalancePair.mock.calls[0][0];
    expect(input.amount).toBe(100000n);
    expect(input.fee).toBe(100n); // amount / 1000, below maxFee (1000)
    expect(input.fee <= 1000n).toBe(true);

    // The node is never touched in simulation.
    expect(fiber.buildRouter).not.toHaveBeenCalled();
    expect(fiber.sendPaymentWithRouter).not.toHaveBeenCalled();
    expect(fiber.listChannels).not.toHaveBeenCalled();
  });
});
