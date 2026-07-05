import { Injectable } from '@nestjs/common';
import { FiberRpcError } from '../../../common/exceptions/fiber-rpc.error';
import { toNumericString, toU128Hex } from '../../../infrastructure/fiber-rpc/u128';
import type { SendPaymentParams } from '../../../infrastructure/fiber-rpc/types/payments';
import { RoutingRepository } from '../repositories/routing.repository';
import { pickBottleneck, toProbeHops } from '../mappers/routing.mapper';
import type { IRoutingService, ProbeInput } from '../routing.public';
import type { ProbeHopDto, ProbeResultDto } from '../dto/probe-result.dto';

/**
 * "Can I pay?" pre-flight. Runs real pathfinding via send_payment(dry_run) — no
 * funds move. A JSON-RPC error from the node (no route / insufficient liquidity)
 * is a valid "not payable" answer; only genuine transport failures propagate (502).
 */
@Injectable()
export class RoutingService implements IRoutingService {
  constructor(private readonly repo: RoutingRepository) {}

  async probe(input: ProbeInput): Promise<ProbeResultDto> {
    const params: SendPaymentParams = input.invoice
      ? { invoice: input.invoice }
      : { target_pubkey: input.targetPubkey, amount: toU128Hex(input.amount), keysend: true };
    if (input.maxFee) params.max_fee_amount = toU128Hex(input.maxFee);

    try {
      const res = await this.repo.sendPaymentDryRun(params);
      const hops = await this.explicitHops(input);
      return {
        payable: true,
        amount: input.amount,
        fee: res.fee ? toNumericString(res.fee) : '0',
        hops,
        bottleneck: pickBottleneck(hops),
      };
    } catch (err) {
      if (err instanceof FiberRpcError && typeof err.rpcCode === 'number') {
        return { payable: false, amount: input.amount, reason: this.detail(err) };
      }
      throw err; // transport / unexpected -> 502
    }
  }

  /** Best-effort explicit hop list + per-hop liquidity for the bottleneck view. */
  private async explicitHops(input: ProbeInput): Promise<ProbeHopDto[]> {
    if (!input.targetPubkey) return [];
    try {
      const [router, graph] = await Promise.all([
        this.repo.buildRouter({
          amount: toU128Hex(input.amount),
          hops_info: [{ pubkey: input.targetPubkey }],
        }),
        this.repo.graphChannels(),
      ]);
      return toProbeHops(router.router_hops ?? [], graph);
    } catch {
      return [];
    }
  }

  private detail(err: FiberRpcError): string {
    const body = err.getResponse() as { message?: string };
    return (body.message ?? err.message).replace(/^Fiber RPC "[^"]+" failed:\s*/, '');
  }
}
