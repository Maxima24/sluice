import { Injectable } from '@nestjs/common';
import { LedgerDirection, LedgerEntryType, Prisma, type LedgerEntry } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { RebalanceLedgerInput } from '../ledger.public';

/**
 * The double-entry audit ledger (hard rule #4). An audit record of what the tool
 * did — never a balance authority. Writes are balanced or rejected.
 */
@Injectable()
export class LedgerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRebalancePair(input: RebalanceLedgerInput, tx: Prisma.TransactionClient): Promise<void> {
    const { rebalanceJobId, sourceChannelId, destChannelId, amount, fee } = input;

    const rows: Prisma.LedgerEntryCreateManyInput[] = [
      // out through the over-funded source channel: principal + fee leave
      { rebalanceJobId, channelId: sourceChannelId, direction: LedgerDirection.OUTBOUND, entryType: LedgerEntryType.PRINCIPAL, amount: new Prisma.Decimal(amount.toString()) },
      { rebalanceJobId, channelId: sourceChannelId, direction: LedgerDirection.OUTBOUND, entryType: LedgerEntryType.FEE, amount: new Prisma.Decimal(fee.toString()) },
      // in through the depleted dest channel: principal arrives
      { rebalanceJobId, channelId: destChannelId, direction: LedgerDirection.INBOUND, entryType: LedgerEntryType.PRINCIPAL, amount: new Prisma.Decimal(amount.toString()) },
    ];

    // Balanced invariant: Σ OUTBOUND == Σ INBOUND + fee  (i.e. principal+fee out == principal in + fee)
    const sum = (dir: LedgerDirection) =>
      rows
        .filter((r) => r.direction === dir)
        .reduce((s, r) => s + BigInt((r.amount as Prisma.Decimal).toString()), 0n);
    if (sum(LedgerDirection.OUTBOUND) !== sum(LedgerDirection.INBOUND) + fee) {
      throw new Error('Ledger entries are not balanced — refusing to write');
    }

    await tx.ledgerEntry.createMany({ data: rows });
  }

  listForJob(rebalanceJobId: string): Promise<LedgerEntry[]> {
    return this.prisma.ledgerEntry.findMany({
      where: { rebalanceJobId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
