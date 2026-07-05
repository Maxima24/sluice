import { Global, Module } from '@nestjs/common';
import { FiberRpcAdapter } from './fiber-rpc.adapter';
import { FIBER_RPC } from './fiber-rpc.port';

@Global()
@Module({
  providers: [{ provide: FIBER_RPC, useClass: FiberRpcAdapter }],
  exports: [FIBER_RPC],
})
export class FiberRpcModule {}
