import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { LedgerModule } from '../ledger/ledger.module';
import { RebalanceController } from './controllers/rebalance.controller';
import { RebalanceService } from './services/rebalance.service';
import { RebalanceExecutor } from './services/rebalance.executor';
import { RebalanceJobRepository } from './repositories/rebalance-job.repository';
import { RebalanceQueue } from './queues/rebalance.queue';
import { REBALANCE_SERVICE } from './rebalance.public';

@Module({
  imports: [RealtimeModule, LedgerModule], // RealtimeGateway (status push) + LEDGER_SERVICE
  controllers: [RebalanceController],
  providers: [
    RebalanceService,
    RebalanceExecutor,
    RebalanceJobRepository,
    RebalanceQueue,
    { provide: REBALANCE_SERVICE, useExisting: RebalanceService },
  ],
  exports: [REBALANCE_SERVICE],
})
export class RebalanceModule {}
