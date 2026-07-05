import type { NodeInfoResult } from './types/node-info';
import type { ListChannelsParams, ListChannelsResult } from './types/channels';
import type { GraphChannelsParams, GraphChannelsResult } from './types/graph';
import type { ListPeersResult } from './types/peers';
import type {
  SendPaymentParams,
  SendPaymentResponse,
  SendPaymentWithRouterParams,
  BuildRouterParams,
  BuildRouterResult,
} from './types/payments';

/** DI token for the single, typed adapter to the Fiber node (hard rule #5). */
export const FIBER_RPC = Symbol('FIBER_RPC');

/**
 * The one interface the rest of the app depends on — never raw JSON-RPC.
 * This is also the reusable-SDK artifact: keep it clean and self-contained.
 */
export interface IFiberRpcClient {
  nodeInfo(): Promise<NodeInfoResult>;
  listChannels(params?: ListChannelsParams): Promise<ListChannelsResult>;
  graphChannels(params?: GraphChannelsParams): Promise<GraphChannelsResult>;
  listPeers(): Promise<ListPeersResult>;

  // Payments / routing (Steps 5-6). Amounts are u128 hex.
  sendPayment(params: SendPaymentParams): Promise<SendPaymentResponse>;
  sendPaymentWithRouter(params: SendPaymentWithRouterParams): Promise<SendPaymentResponse>;
  buildRouter(params: BuildRouterParams): Promise<BuildRouterResult>;
  getPayment(paymentHash: string): Promise<SendPaymentResponse>;
}

export type {
  NodeInfoResult,
  ListChannelsParams,
  ListChannelsResult,
  GraphChannelsParams,
  GraphChannelsResult,
  ListPeersResult,
  SendPaymentParams,
  SendPaymentResponse,
  SendPaymentWithRouterParams,
  BuildRouterParams,
  BuildRouterResult,
};
