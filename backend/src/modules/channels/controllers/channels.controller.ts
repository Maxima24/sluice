import { Controller, Get } from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ChannelHealthService } from '../services/channel-health.service';

/** Liquidity health surface for the dashboard. */
@Controller('channels')
export class ChannelsController {
  constructor(private readonly health: ChannelHealthService) {}

  @Get('health')
  @ResponseMessage('Channel health fetched')
  getHealth() {
    return this.health.getHealth();
  }
}
