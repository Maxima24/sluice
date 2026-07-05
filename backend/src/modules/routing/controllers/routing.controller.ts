import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ProbeRequestSchema, type ProbeRequestDto } from '../dto/probe-request.dto';
import { RoutingService } from '../services/routing.service';

@Controller('routing')
export class RoutingController {
  constructor(private readonly routing: RoutingService) {}

  @Post('probe')
  @ResponseMessage('Probe complete')
  @UsePipes(new ZodValidationPipe(ProbeRequestSchema))
  probe(@Body() body: ProbeRequestDto) {
    return this.routing.probe(body);
  }
}
