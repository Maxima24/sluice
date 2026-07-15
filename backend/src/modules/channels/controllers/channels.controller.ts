import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ChannelHealthService } from '../services/channel-health.service';

/** Liquidity health surface for the dashboard. */
@ApiTags('channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly health: ChannelHealthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Live channel liquidity (outbound/inbound/health, live-first)' })
  @ResponseMessage('Channel health fetched')
  getHealth() {
    return this.health.getHealth();
  }
}
