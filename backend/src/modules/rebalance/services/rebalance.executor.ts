import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma, RebalanceStatus, type RebalanceJob } from '@prisma/client';
import { FIBER_RPC, type IFiberRpcClient } from '../../../infrastructure/fiber-rpc/fiber-rpc.port';
import type { RouterHop, SendPaymentResponse } from '../../../infrastructure/fiber-rpc/types/payments';
import { toU128Hex } from '../../../infrastructure/fiber-rpc/u128';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { LEDGER_SERVICE, type ILedgerService } from '../../ledger/ledger.public';
import { RealtimeGateway } from '../../realtime/gateways/realtime.gateway';
import { REALTIME_EVENT } from '../../realtime/realtime.public';
import { RebalanceJobRepository } from '../repositories/rebalance-job.repository';
import type { RebalanceJobData } from '../types/rebalance.types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs a rebalance OFF the request path (BullMQ worker). Circular self-payment:
 * out through the over-funded source channel, back in through the depleted dest
 * channel. On success it writes the balanced double-entry ledger + job update in
 * ONE serializable transaction (hard rules #3, #4).
 */
@Injectable()
export class RebalanceExecutor {
  private readonly logger = new Logger(RebalanceExecutor.name);

  constructor(
    @Inject(FIBER_RPC) private readonly fiber: IFiberRpcClient,
    private readonly prisma: PrismaService,
    private readonly repo: RebalanceJobRepository,
    @Inject(LEDGER_SERVICE) private readonly ledger: ILedgerService,
    private readonly gateway: RealtimeGateway,
  ) {}

  async execute(data: RebalanceJobData): Promise<void> {
    const job = await this.repo.findById(data.jobId);
    if (!job) return;
    // Idempotent: a retry/redelivery of an already-settled job is a no-op.
    if (job.status === RebalanceStatus.SUCCEEDED || job.status === RebalanceStatus.FAILED) return;

    const amount = BigInt(job.amount.toFixed(0));
    const maxFee = BigInt(job.maxFee.toFixed(0));

    try {
      await this.repo.update(job.id, RebalanceStatus.BUILDING);
      const router = await this.buildCircularRouter(job, amount);

      // Fee guard — dry-run the router first (no funds move); abort if over maxFee.
      const dry = await this.fiber.sendPaymentWithRouter({ router, keysend: true, dry_run: true });
      const quotedFee = dry.fee ? BigInt(dry.fee) : 0n;
      if (quotedFee > maxFee) {
        await this.fail(job.id, `fee ${quotedFee} exceeds maxFee ${maxFee}`);
        return;
      }

      await this.repo.update(job.id, RebalanceStatus.INFLIGHT);
      const sent = await this.fiber.sendPaymentWithRouter({ router, keysend: true });
      const paymentHash = sent.payment_hash;
      await this.repo.update(job.id, RebalanceStatus.INFLIGHT, { paymentHash });
      this.push(job.id, sent.status, paymentHash);

      const settled = await this.pollUntilSettled(paymentHash, job.id);
      if (settled.status === 'Success') {
        const paidFee = settled.fee ? BigInt(settled.fee) : quotedFee;
        await this.settle(job, amount, paidFee, paymentHash);
        this.push(job.id, 'Success', paymentHash);
      } else {
        await this.fail(job.id, settled.failed_error ?? 'payment failed', paymentHash);
        this.push(job.id, 'Failed', paymentHash);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.fail(job.id, msg);
      throw err; // let BullMQ record the attempt (retries per job options)
    }
  }

  private async buildCircularRouter(job: RebalanceJob, amount: bigint): Promise<RouterHop[]> {
    const [{ channels }, info] = await Promise.all([this.fiber.listChannels(), this.fiber.nodeInfo()]);
    const src = channels.find((c) => c.channel_id === job.sourceChannelId);
    const dst = channels.find((c) => c.channel_id === job.destChannelId);
    if (!src || !dst) throw new Error('source or dest channel not found on the node');
    if (!src.channel_outpoint || !dst.channel_outpoint) throw new Error('channel outpoint unavailable');

    const built = await this.fiber.buildRouter({
      amount: toU128Hex(amount.toString()),
      hops_info: [
        { pubkey: src.pubkey, channel_outpoint: src.channel_outpoint }, // egress via the over-funded channel
        { pubkey: info.pubkey, channel_outpoint: dst.channel_outpoint }, // ingress back to us via the depleted channel
      ],
    });
    await this.repo.update(job.id, RebalanceStatus.BUILDING, {
      router: built.router_hops as unknown as Prisma.InputJsonValue,
    });
    return built.router_hops;
  }

  private async pollUntilSettled(paymentHash: string, jobId: string): Promise<SendPaymentResponse> {
    for (let i = 0; i < 60; i++) {
      const p = await this.fiber.getPayment(paymentHash);
      this.push(jobId, p.status, paymentHash);
      if (p.status === 'Success' || p.status === 'Failed') return p;
      await sleep(2000);
    }
    return { payment_hash: paymentHash, status: 'Failed', failed_error: 'poll timeout' } as SendPaymentResponse;
  }

  /** SUCCEEDED job update + balanced double-entry ledger, atomically. */
  private async settle(job: RebalanceJob, amount: bigint, fee: bigint, paymentHash: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        await this.repo.update(
          job.id,
          RebalanceStatus.SUCCEEDED,
          { paymentHash, feePaid: new Prisma.Decimal(fee.toString()) },
          tx,
        );
        await this.ledger.writeRebalancePair(
          {
            rebalanceJobId: job.id,
            sourceChannelId: job.sourceChannelId,
            destChannelId: job.destChannelId,
            amount,
            fee,
          },
          tx,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  private async fail(jobId: string, error: string, paymentHash?: string): Promise<void> {
    await this.repo.update(jobId, RebalanceStatus.FAILED, {
      error: error.slice(0, 500),
      ...(paymentHash ? { paymentHash } : {}),
    });
  }

  private push(jobId: string, status: string, paymentHash: string): void {
    this.gateway.broadcast(REALTIME_EVENT.PAYMENT_STATUS, {
      jobId,
      status,
      paymentHash,
      at: new Date().toISOString(),
    });
  }
}
