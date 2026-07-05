import { Inject, Injectable } from '@nestjs/common';
import { FIBER_RPC, type IFiberRpcClient } from '../../../infrastructure/fiber-rpc/fiber-rpc.port';
import type {
  SendPaymentParams,
  SendPaymentResponse,
  BuildRouterParams,
  BuildRouterResult,
} from '../../../infrastructure/fiber-rpc/types/payments';
import type { GraphChannelsResult } from '../../../infrastructure/fiber-rpc/types/graph';

/** Read-through data access for routing — wraps the FIBER_RPC port. */
@Injectable()
export class RoutingRepository {
  constructor(@Inject(FIBER_RPC) private readonly fiber: IFiberRpcClient) {}

  /** Pre-flight pathfinding with NO funds moved. */
  sendPaymentDryRun(params: SendPaymentParams): Promise<SendPaymentResponse> {
    return this.fiber.sendPayment({ ...params, dry_run: true });
  }

  buildRouter(params: BuildRouterParams): Promise<BuildRouterResult> {
    return this.fiber.buildRouter(params);
  }

  graphChannels(): Promise<GraphChannelsResult> {
    return this.fiber.graphChannels();
  }
}
