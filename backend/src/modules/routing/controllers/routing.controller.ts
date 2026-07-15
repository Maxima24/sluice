import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ProbeRequestSchema, type ProbeRequestDto } from '../dto/probe-request.dto';
import { RoutingService } from '../services/routing.service';

@ApiTags('routing')
@Controller('routing')
export class RoutingController {
  constructor(private readonly routing: RoutingService) {}

  @Post('probe')
  @ApiOperation({ summary: '"Can I pay?" — dry-run probe (operator session required)' })
  @ApiBearerAuth('operator-session')
  @ApiBody({ schema: { example: { targetPubkey: '0x…', amount: '1000000000', maxFee: '100000000' } } })
  @ResponseMessage('Probe complete')
  @UsePipes(new ZodValidationPipe(ProbeRequestSchema))
  probe(@Body() body: ProbeRequestDto) {
    return this.routing.probe(body);
  }
}
