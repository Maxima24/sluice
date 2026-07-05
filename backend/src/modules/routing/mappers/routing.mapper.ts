import { toNumericString } from '../../../infrastructure/fiber-rpc/u128';
import type { RouterHop } from '../../../infrastructure/fiber-rpc/types/payments';
import type { GraphChannelsResult } from '../../../infrastructure/fiber-rpc/types/graph';
import type { ProbeHopDto } from '../dto/probe-result.dto';
import type { LiquidityByOutpoint } from '../types/routing.types';

/** build_router hops -> DTO hops, annotated with available outbound liquidity from the graph. */
export function toProbeHops(hops: RouterHop[], graph: GraphChannelsResult): ProbeHopDto[] {
  const liq = outboundByOutpoint(graph);
  return hops.map((h) => ({
    pubkey: h.target,
    channelOutpoint: h.channel_outpoint,
    amountReceived: h.amount_received ? toNumericString(h.amount_received) : undefined,
    availableOutbound: h.channel_outpoint ? liq.get(h.channel_outpoint) : undefined,
  }));
}

/** The hop with the least available outbound liquidity (falls back to the last hop). */
export function pickBottleneck(hops: ProbeHopDto[]): ProbeHopDto | null {
  const withLiq = hops.filter((h) => h.availableOutbound !== undefined);
  if (withLiq.length > 0) {
    return withLiq.reduce((min, h) =>
      BigInt(h.availableOutbound as string) < BigInt(min.availableOutbound as string) ? h : min,
    );
  }
  return hops.length > 0 ? hops[hops.length - 1] : null;
}

function outboundByOutpoint(graph: GraphChannelsResult): LiquidityByOutpoint {
  const m: LiquidityByOutpoint = new Map();
  for (const ch of graph.channels ?? []) {
    if (!ch.channel_outpoint) continue;
    const dirs = [
      ch.update_info_of_node1?.outbound_liquidity,
      ch.update_info_of_node2?.outbound_liquidity,
    ].filter((v): v is string => typeof v === 'string');
    if (dirs.length === 0) continue;
    // Conservative bound: the smaller of the two directional liquidities.
    const minHex = dirs.reduce((a, b) => (BigInt(a) < BigInt(b) ? a : b));
    m.set(ch.channel_outpoint, toNumericString(minHex));
  }
  return m;
}
