import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { AppConfig } from '../../../config/app.config';
import { RebalanceExecutor } from '../services/rebalance.executor';
import type { RebalanceJobData } from '../types/rebalance.types';

/**
 * Off-request execution (worker-separation pattern). Runs the worker embedded
 * when RUN_WORKER_INLINE=true, else a separate process consumes the same queue.
 * Retries + backoff come from BullMQ job options. BullMQ owns the Redis
 * connections (created from parsed RedisOptions) so there's no ioredis-instance
 * version coupling.
 */
@Injectable()
export class RebalanceQueue implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RebalanceQueue.name);
  private queue?: Queue;
  private worker?: Worker;

  constructor(
    private readonly config: AppConfig,
    private readonly executor: RebalanceExecutor,
  ) {}

  onModuleInit(): void {
    const url = this.config.get('REDIS_URL');
    if (!url) {
      this.logger.warn('REDIS_URL not set — rebalance queue disabled (POST /rebalance will 503).');
      return;
    }
    const connection = this.parseConnection(url);

    this.queue = new Queue('rebalance', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 200,
        removeOnFail: 1000,
      },
    });

    if (this.config.get('RUN_WORKER_INLINE')) {
      this.worker = new Worker('rebalance', (job) => this.executor.execute(job.data as RebalanceJobData), {
        connection,
      });
      this.worker.on('failed', (job, err) =>
        this.logger.warn(`rebalance job ${job?.id ?? '?'} failed: ${err.message}`),
      );
      this.logger.log('Rebalance worker started (inline).');
    }
  }

  get enabled(): boolean {
    return !!this.queue;
  }

  async enqueue(data: RebalanceJobData): Promise<void> {
    if (!this.queue) {
      throw new ServiceUnavailableException('Rebalance queue unavailable (REDIS_URL not set)');
    }
    await this.queue.add('rebalance', data);
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
  }

  private parseConnection(url: string): ConnectionOptions {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: Number(u.port || '6379'),
      username: u.username || undefined,
      password: u.password || undefined,
      db: u.pathname && u.pathname !== '/' ? Number(u.pathname.slice(1)) : undefined,
      maxRetriesPerRequest: null, // required by BullMQ for the worker's blocking connection
    };
  }
}
