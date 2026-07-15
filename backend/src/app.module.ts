import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { ConfigModule } from './config/config.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { FiberRpcModule } from './infrastructure/fiber-rpc/fiber-rpc.module';
import { NodeModule } from './modules/node/node.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { RoutingModule } from './modules/routing/routing.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { RebalanceModule } from './modules/rebalance/rebalance.module';
import { ReconciliationModule } from './modules/reconciliation/reconciliation.module';
import { AuthModule } from './modules/auth/auth.module';

import { AppController } from './app.controller';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { OperatorAuthGuard } from './common/guards/operator-auth.guard';

@Module({
  imports: [
    // Infrastructure spine
    ConfigModule,
    PrismaModule,
    FiberRpcModule,
    // Bounded contexts (= future microservices)
    NodeModule,
    ChannelsModule,
    RealtimeModule,
    RoutingModule,
    LedgerModule,
    RebalanceModule,
    ReconciliationModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_GUARD, useClass: OperatorAuthGuard },
  ],
})
export class AppModule {}
