import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppConfig } from '../../config/app.config';
import { FiberRpcError } from '../../common/exceptions/fiber-rpc.error';
import type { IFiberRpcClient } from './fiber-rpc.port';
import type { JsonRpcResponse } from './types/json-rpc';
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

/**
 * The single seam where raw JSON-RPC over HTTP happens. Every node method is
 * wrapped with typed inputs/outputs; nothing else in the app touches the wire.
 */
@Injectable()
export class FiberRpcAdapter implements IFiberRpcClient, OnModuleInit {
  private readonly logger = new Logger(FiberRpcAdapter.name);
  private readonly rpcUrl: string;
  private readonly timeoutMs: number;
  private id = 0;

  constructor(private readonly config: AppConfig) {
    this.rpcUrl = this.config.get('FIBER_RPC_URL');
    this.timeoutMs = this.config.get('FIBER_RPC_TIMEOUT_MS');
  }

  async onModuleInit(): Promise<void> {
    // Loud but non-fatal boot probe — confirms we hit a REAL node without
    // blocking API startup when the node is down (dashboard renders "node down").
    try {
      const info = await this.nodeInfo();
      this.logger.log(
        `Fiber node connected — version=${info.version} pubkey=${info.pubkey} chain=${info.chain_hash}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Fiber node unreachable at ${this.rpcUrl}: ${msg}`);
    }
  }

  nodeInfo(): Promise<NodeInfoResult> {
    return this.call<NodeInfoResult>('node_info');
  }

  listChannels(params: ListChannelsParams = {}): Promise<ListChannelsResult> {
    return this.call<ListChannelsResult>('list_channels', [params]);
  }

  graphChannels(params: GraphChannelsParams = {}): Promise<GraphChannelsResult> {
    return this.call<GraphChannelsResult>('graph_channels', [params]);
  }

  listPeers(): Promise<ListPeersResult> {
    return this.call<ListPeersResult>('list_peers');
  }

  sendPayment(params: SendPaymentParams): Promise<SendPaymentResponse> {
    return this.call<SendPaymentResponse>('send_payment', [params]);
  }

  sendPaymentWithRouter(params: SendPaymentWithRouterParams): Promise<SendPaymentResponse> {
    return this.call<SendPaymentResponse>('send_payment_with_router', [params]);
  }

  buildRouter(params: BuildRouterParams): Promise<BuildRouterResult> {
    return this.call<BuildRouterResult>('build_router', [params]);
  }

  getPayment(paymentHash: string): Promise<SendPaymentResponse> {
    return this.call<SendPaymentResponse>('get_payment', [{ payment_hash: paymentHash }]);
  }

  /**
   * FNN JSON-RPC is positional; most methods take a single object element
   * (`params: [{ ... }]`). Amount fields come back as raw 0x-hex strings and
   * are passed through untouched — never parsed to Number here.
   */
  private async call<R>(method: string, params: unknown[] = []): Promise<R> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++this.id, method, params }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new FiberRpcError(method, res.status, `HTTP ${res.status} ${res.statusText}`);
      }

      let body: JsonRpcResponse<R>;
      try {
        body = (await res.json()) as JsonRpcResponse<R>;
      } catch {
        throw new FiberRpcError(method, 'PARSE', 'response was not valid JSON');
      }

      if (body.error) {
        throw new FiberRpcError(method, body.error.code, body.error.message, body.error.data);
      }
      return body.result as R;
    } catch (err) {
      if (err instanceof FiberRpcError) throw err;
      const reason =
        err instanceof Error && err.name === 'AbortError'
          ? `timed out after ${this.timeoutMs}ms`
          : err instanceof Error
            ? err.message
            : String(err);
      throw new FiberRpcError(method, 'TRANSPORT', reason);
    } finally {
      clearTimeout(timer);
    }
  }
}
