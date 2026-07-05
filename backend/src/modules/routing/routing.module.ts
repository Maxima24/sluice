import { Module } from '@nestjs/common';
import { RoutingController } from './controllers/routing.controller';
import { RoutingService } from './services/routing.service';
import { RoutingRepository } from './repositories/routing.repository';
import { ROUTING_SERVICE } from './routing.public';

@Module({
  controllers: [RoutingController],
  providers: [
    RoutingService,
    RoutingRepository,
    { provide: ROUTING_SERVICE, useExisting: RoutingService },
  ],
  exports: [ROUTING_SERVICE],
})
export class RoutingModule {}
