import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { RebalanceRequestSchema, type RebalanceRequestDto } from '../dto/rebalance-request.dto';
import { RebalanceService } from '../services/rebalance.service';

@ApiTags('rebalance')
@Controller('rebalance')
export class RebalanceController {
  constructor(private readonly service: RebalanceService) {}

  @Post()
  @HttpCode(202)
  @ApiOperation({ summary: 'Queue a circular rebalance (operator session required)' })
  @ApiBearerAuth('operator-session')
  @ApiBody({
    schema: {
      example: {
        sourceChannelId: '0x…',
        destChannelId: '0x…',
        amount: '10000000000',
        maxFee: '500000000',
        idempotencyKey: '<uuid>',
      },
    },
  })
  @ResponseMessage('Rebalance queued')
  @UsePipes(new ZodValidationPipe(RebalanceRequestSchema))
  request(@Body() body: RebalanceRequestDto) {
    return this.service.request(body);
  }

  @Get()
  @ApiOperation({ summary: 'Rebalance history — recent jobs, newest first' })
  @ResponseMessage('Rebalance history')
  list() {
    return this.service.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Rebalance job by id' })
  @ResponseMessage('Rebalance job')
  async getJob(@Param('id') id: string) {
    const job = await this.service.getJob(id);
    if (!job) throw new NotFoundException('rebalance job not found');
    return job;
  }
}
