import { describe, expect, it, vi } from 'vitest';
import { LedgerDirection, LedgerEntryType, Prisma } from '@prisma/client';
import { LedgerRepository } from './ledger.repository';

function setup() {
  const createMany = vi.fn().mockResolvedValue({ count: 3 });
  const tx = { ledgerEntry: { createMany } } as unknown as Prisma.TransactionClient;
  const repo = new LedgerRepository({} as never);
  return { repo, tx, createMany };
}

const sumBig = (rows: Prisma.LedgerEntryCreateManyInput[]) =>
  rows.reduce((s, r) => s + BigInt((r.amount as Prisma.Decimal).toString()), 0n);

describe('LedgerRepository.createRebalancePair (double-entry, hard rule #4)', () => {
  it.each([
    { amount: 1000n, fee: 7n },
    { amount: 990_100_000_000n, fee: 0n },
    { amount: 1n, fee: 1n },
  ])('writes a balanced 3-row entry for amount=$amount fee=$fee', async ({ amount, fee }) => {
    const { repo, tx, createMany } = setup();

    await repo.createRebalancePair(
      { rebalanceJobId: 'job-1', sourceChannelId: 'src', destChannelId: 'dst', amount, fee },
      tx,
    );

    expect(createMany).toHaveBeenCalledTimes(1);
    const rows = createMany.mock.calls[0][0].data as Prisma.LedgerEntryCreateManyInput[];
    expect(rows).toHaveLength(3);

    const out = rows.filter((r) => r.direction === LedgerDirection.OUTBOUND);
    const inn = rows.filter((r) => r.direction === LedgerDirection.INBOUND);

    // principal + fee leave the over-funded source
    expect(out).toHaveLength(2);
    expect(out.every((r) => r.channelId === 'src')).toBe(true);
    expect(out.map((r) => r.entryType).sort()).toEqual([LedgerEntryType.FEE, LedgerEntryType.PRINCIPAL].sort());
    // principal arrives at the depleted dest
    expect(inn).toHaveLength(1);
    expect(inn[0].channelId).toBe('dst');
    expect(inn[0].entryType).toBe(LedgerEntryType.PRINCIPAL);

    // the balanced invariant: Σ OUTBOUND === Σ INBOUND + fee
    expect(sumBig(out)).toBe(sumBig(inn) + fee);
  });
});
