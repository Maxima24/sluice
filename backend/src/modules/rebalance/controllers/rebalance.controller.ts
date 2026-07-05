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
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { RebalanceRequestSchema, type RebalanceRequestDto } from '../dto/rebalance-request.dto';
import { RebalanceService } from '../services/rebalance.service';

@Controller('rebalance')
export class RebalanceController {
  constructor(private readonly service: RebalanceService) {}

  @Post()
  @HttpCode(202)
  @ResponseMessage('Rebalance queued')
  @UsePipes(new ZodValidationPipe(RebalanceRequestSchema))
  request(@Body() body: RebalanceRequestDto) {
    return this.service.request(body);
  }

  @Get(':id')
  @ResponseMessage('Rebalance job')
  async getJob(@Param('id') id: string) {
    const job = await this.service.getJob(id);
    if (!job) throw new NotFoundException('rebalance job not found');
    return job;
  }
}
