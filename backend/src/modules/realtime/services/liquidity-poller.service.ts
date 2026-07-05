import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { AppConfig } from '../../../config/app.config';
import { CHANNELS_SERVICE, type IChannelHealthService } from '../../channels/channels.public';
import type { ChannelHealthDto } from '../../channels/dto/channel-health.dto';
import { RealtimeGateway } from '../gateways/realtime.gateway';
import { REALTIME_EVENT } from '../realtime.public';
import type { BalanceChangedDto } from '../dto/balance-changed.dto';

/**
 * The PRIMARY source of channel-state truth: FNN pushes no channel-balance
 * events, so we poll `list_channels` on an interval (POLL_INTERVAL_MS), diff
 * against the last emitted value, and push `balance-changed` for deltas.
 * `pollNow()` lets the node subscription trigger an immediate re-read.
 */
@Injectable()
export class LiquidityPollerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(LiquidityPollerService.name);
  private readonly lastSig = new Map<string, string>();
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(
    @Inject(CHANNELS_SERVICE) private readonly channels: IChannelHealthService,
    private readonly gateway: RealtimeGateway,
    private readonly config: AppConfig,
  ) {}

  onApplicationBootstrap(): void {
    const ms = this.config.get('POLL_INTERVAL_MS');
    this.timer = setInterval(() => void this.pollNow('interval'), ms);
    this.logger.log(`Liquidity poller started — every ${ms}ms`);
    void this.pollNow('boot');
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /** Re-read live channels and push balance-changed for any new/changed channel. */
  async pollNow(reason = 'event'): Promise<void> {
    if (this.running) return; // never overlap polls
    this.running = true;
    try {
      const health = await this.channels.getHealth();
      if (health.source !== 'live') return; // node down -> don't emit stale snapshots as changes
      let changed = 0;
      for (const c of health.channels) {
        const sig = `${c.state}|${c.outbound}|${c.inbound}`;
        if (this.lastSig.get(c.channelId) !== sig) {
          this.lastSig.set(c.channelId, sig);
          this.gateway.broadcast(REALTIME_EVENT.BALANCE_CHANGED, this.toEvent(c));
          changed++;
        }
      }
      if (changed > 0) {
        this.logger.debug(`poll(${reason}): ${changed}/${health.channels.length} changed -> pushed`);
      }
    } catch (err) {
      this.logger.warn(`poll(${reason}) failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      this.running = false;
    }
  }

  private toEvent(c: ChannelHealthDto): BalanceChangedDto {
    return {
      channelId: c.channelId,
      peerPubkey: c.peerPubkey,
      state: c.state,
      outbound: c.outbound,
      inbound: c.inbound,
      capacity: c.capacity,
      inboundRatio: c.inboundRatio,
      at: new Date().toISOString(),
    };
  }
}
