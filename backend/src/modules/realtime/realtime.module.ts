import { Module } from '@nestjs/common';
import { ChannelsModule } from '../channels/channels.module';
import { RealtimeGateway } from './gateways/realtime.gateway';
import { LiquidityPollerService } from './services/liquidity-poller.service';
import { FiberSubscriptionService } from './services/fiber-subscription.service';

@Module({
  imports: [ChannelsModule], // CHANNELS_SERVICE for live reads
  providers: [RealtimeGateway, LiquidityPollerService, FiberSubscriptionService],
  exports: [RealtimeGateway], // Step 6 pushes payment-status transitions through it
})
export class RealtimeModule {}
