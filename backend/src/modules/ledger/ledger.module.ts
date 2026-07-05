import { Module } from '@nestjs/common';
import { LedgerService } from './services/ledger.service';
import { LedgerRepository } from './repositories/ledger.repository';
import { LEDGER_SERVICE } from './ledger.public';

@Module({
  providers: [LedgerService, LedgerRepository, { provide: LEDGER_SERVICE, useExisting: LedgerService }],
  exports: [LEDGER_SERVICE],
})
export class LedgerModule {}
