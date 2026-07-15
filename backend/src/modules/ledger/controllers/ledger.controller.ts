import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { LEDGER_SERVICE, type ILedgerService } from '../ledger.public';

/** Read-only audit surface: the double-entry ledger entries for a rebalance. */
@Controller('ledger')
export class LedgerController {
  constructor(@Inject(LEDGER_SERVICE) private readonly service: ILedgerService) {}

  @Get(':rebalanceJobId')
  @ResponseMessage('Ledger entries')
  list(@Param('rebalanceJobId') rebalanceJobId: string) {
    return this.service.listForJob(rebalanceJobId);
  }
}
