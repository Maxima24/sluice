import type { LedgerEntry } from '@prisma/client';
import type { LedgerEntryDto } from '../dto/ledger-entry.dto';

export function toLedgerEntryDto(e: LedgerEntry): LedgerEntryDto {
  return {
    id: e.id,
    rebalanceJobId: e.rebalanceJobId,
    channelId: e.channelId,
    direction: e.direction,
    entryType: e.entryType,
    amount: e.amount.toFixed(0),
    createdAt: e.createdAt.toISOString(),
  };
}
