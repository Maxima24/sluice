import { Controller, Get } from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ReconciliationService } from '../services/reconciliation.service';

@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly service: ReconciliationService) {}

  @Get('status')
  @ResponseMessage('Reconciliation status')
  getStatus() {
    return this.service.getStatus();
  }
}
