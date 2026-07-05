import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { WebSocket } from 'ws';
import { AppConfig } from '../../../config/app.config';
import { LiquidityPollerService } from './liquidity-poller.service';

/**
 * node -> backend subscription (best-effort). Opens FIBER_WS_URL and calls
 * `subscribe_store_changes`; on any store_changes notification (payment/invoice
 * keyed by payment_hash) it triggers an immediate poll so bars update sooner
 * than the interval. If the node doesn't support the subscription (older/newer
 * RPC), it self-disables and the interval poll carries the load.
 */
@Injectable()
export class FiberSubscriptionService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(FiberSubscriptionService.name);
  private ws?: WebSocket;
  private closed = false;
  private disabled = false;
  private reconnectTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly config: AppConfig,
    private readonly poller: LiquidityPollerService,
  ) {}

  onApplicationBootstrap(): void {
    this.connect();
  }

  onModuleDestroy(): void {
    this.closed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }

  private connect(): void {
    if (this.closed || this.disabled) return;
    const url = this.config.get('FIBER_WS_URL');
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;
    ws.on('open', () =>
      ws.send(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'subscribe_store_changes', params: [] })),
    );
    ws.on('message', (data) => this.onMessage(data.toString()));
    ws.on('error', () => undefined); // surfaced via 'close'
    ws.on('close', () => this.scheduleReconnect());
  }

  private onMessage(raw: string): void {
    let msg: { id?: number; method?: string; error?: { message?: string } };
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    // Reply to our subscribe call.
    if (msg.id === 1) {
      if (msg.error) {
        this.disabled = true;
        this.logger.warn(
          `Node subscription unavailable (${msg.error.message}); relying on the interval poll.`,
        );
        this.ws?.close();
        return;
      }
      this.logger.log('Subscribed to node store_changes — event-triggered polling enabled.');
      return;
    }
    // A store_changes notification -> re-read channels immediately.
    if (msg.method === 'store_changes') {
      void this.poller.pollNow('node-event');
    }
  }

  private scheduleReconnect(): void {
    if (this.closed || this.disabled) return;
    this.reconnectTimer = setTimeout(() => this.connect(), 5000);
  }
}
