import { Module } from '@nestjs/common';
import { NodeModule } from '../node/node.module';
import { ChannelsModule } from '../channels/channels.module';
import { ReconciliationController } from './controllers/reconciliation.controller';
import { ReconciliationService } from './services/reconciliation.service';
import { ReconciliationRepository } from './repositories/reconciliation.repository';
import { RECONCILIATION_SERVICE } from './reconciliation.public';

@Module({
  imports: [NodeModule, ChannelsModule], // NODE_SERVICE (truth) + CHANNELS_SERVICE (re-snapshot)
  controllers: [ReconciliationController],
  providers: [
    ReconciliationService,
    ReconciliationRepository,
    { provide: RECONCILIATION_SERVICE, useExisting: ReconciliationService },
  ],
  exports: [RECONCILIATION_SERVICE],
})
export class ReconciliationModule {}
