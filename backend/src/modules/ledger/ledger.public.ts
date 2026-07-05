import type { Prisma } from '@prisma/client';
import type { LedgerEntryDto } from './dto/ledger-entry.dto';

export const LEDGER_SERVICE = Symbol('LEDGER_SERVICE');

export interface RebalanceLedgerInput {
  rebalanceJobId: string;
  sourceChannelId: string;
  destChannelId: string;
  amount: bigint; // principal moved
  fee: bigint; // fee paid
}

export interface ILedgerService {
  /**
   * Writes the balanced double-entry pair for a rebalance INSIDE the caller's
   * serializable transaction (so the job update + ledger land atomically).
   */
  writeRebalancePair(input: RebalanceLedgerInput, tx: Prisma.TransactionClient): Promise<void>;
  listForJob(rebalanceJobId: string): Promise<LedgerEntryDto[]>;
}

export type { LedgerEntryDto };
