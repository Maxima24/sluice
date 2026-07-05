import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WebSocket, WebSocketServer as WsServer } from 'ws';

/**
 * Backend -> frontend push channel (path /realtime). One of the two WebSockets
 * in the system (the other is node -> backend); this one carries only
 * liquidity-meaning events, never raw node events.
 */
@WebSocketGateway({ path: '/realtime' })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer() private server?: WsServer;

  handleConnection(): void {
    this.logger.debug(`client connected (${this.clientCount} total)`);
  }

  handleDisconnect(): void {
    this.logger.debug(`client disconnected (${this.clientCount} total)`);
  }

  /** Broadcast a `{ event, data }` envelope to every connected browser. */
  broadcast(event: string, data: unknown): void {
    if (!this.server) return;
    const msg = JSON.stringify({ event, data });
    for (const client of this.server.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    }
  }

  get clientCount(): number {
    return this.server?.clients.size ?? 0;
  }
}
