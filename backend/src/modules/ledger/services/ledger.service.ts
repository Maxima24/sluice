import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { LedgerRepository } from '../repositories/ledger.repository';
import { toLedgerEntryDto } from '../mappers/ledger.mapper';
import type { ILedgerService, LedgerEntryDto, RebalanceLedgerInput } from '../ledger.public';

@Injectable()
export class LedgerService implements ILedgerService {
  constructor(private readonly repo: LedgerRepository) {}

  writeRebalancePair(input: RebalanceLedgerInput, tx: Prisma.TransactionClient): Promise<void> {
    return this.repo.createRebalancePair(input, tx);
  }

  async listForJob(rebalanceJobId: string): Promise<LedgerEntryDto[]> {
    const rows = await this.repo.listForJob(rebalanceJobId);
    return rows.map(toLedgerEntryDto);
  }
}
