import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ReconciliationService } from '../services/reconciliation.service';

@ApiTags('reconciliation')
@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly service: ReconciliationService) {}

  @Get('status')
  @ApiOperation({ summary: 'Snapshot vs node drift (node always wins)' })
  @ResponseMessage('Reconciliation status')
  getStatus() {
    return this.service.getStatus();
  }
}
