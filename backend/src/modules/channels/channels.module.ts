import { Module } from '@nestjs/common';
import { NodeModule } from '../node/node.module';
import { ChannelsController } from './controllers/channels.controller';
import { ChannelHealthService } from './services/channel-health.service';
import { ChannelSnapshotRepository } from './repositories/channel-snapshot.repository';
import { CHANNELS_SERVICE } from './channels.public';

@Module({
  imports: [NodeModule], // provides NODE_SERVICE for live channel reads
  controllers: [ChannelsController],
  providers: [
    ChannelHealthService,
    ChannelSnapshotRepository,
    { provide: CHANNELS_SERVICE, useExisting: ChannelHealthService },
  ],
  exports: [CHANNELS_SERVICE],
})
export class ChannelsModule {}
