import { sumShannon, truncateId } from '@/lib/format';
import type { ChannelHealth, ChannelHealthDto, ReconciliationStatus } from '@/types/fiber';

const ZERO = BigInt(0);

/** Send capacity of a channel as a 0–100 integer (outbound share). */
export function outboundPct(c: ChannelHealthDto): number {
  return Math.round((1 - c.inboundRatio) * 100);
}

/** Coarse routing state from the outbound share. */
export function channelState(c: ChannelHealthDto): 'healthy' | 'warning' | 'critical' {
  const out = 1 - c.inboundRatio;
  if (out >= 0.5) return 'healthy';
  if (out >= 0.2) return 'warning';
  return 'critical';
}

/** Liquidity label used on the heat map. */
export function liquidityLabel(c: ChannelHealthDto): string {
  const out = 1 - c.inboundRatio;
  if (out >= 0.8) return 'outbound heavy';
  if (out <= 0.2) return 'depleted';
  return 'balanced';
}

/**
 * Aggregate send-capacity health (0–100): average outbound share across
 * channels. Reflects the "can I pay" promise; the receive-side gap (no inbound)
 * is surfaced separately by {@link deriveAlerts}. Empty → 0.
 */
export function healthScore(channels: readonly ChannelHealthDto[]): number {
  if (channels.length === 0) return 0;
  const sum = channels.reduce((acc, c) => acc + (1 - c.inboundRatio), 0);
  return Math.round((sum / channels.length) * 100);
}

/** Total outbound (sendable) across channels, as a shannon decimal string. */
export function totalOutbound(channels: readonly ChannelHealthDto[]): string {
  return sumShannon(channels.map((c) => c.outbound));
}

/** Total inbound (receivable) across channels, as a shannon decimal string. */
export function totalInbound(channels: readonly ChannelHealthDto[]): string {
  return sumShannon(channels.map((c) => c.inbound));
}

/**
 * Over-funded → depleted pair for the rebalance visual. source = most outbound,
 * dest = least outbound. `null` when there are no channels. With balanced
 * channels source/dest are near-equal, which correctly signals "nothing to do".
 */
export function pickRebalancePair(
  channels: readonly ChannelHealthDto[],
): { source: ChannelHealthDto; dest: ChannelHealthDto } | null {
  if (channels.length === 0) return null;
  let source = channels[0];
  let dest = channels[0];
  for (const c of channels) {
    if (BigInt(c.outbound) > BigInt(source.outbound)) source = c;
    if (BigInt(c.outbound) < BigInt(dest.outbound)) dest = c;
  }
  return { source, dest };
}

export interface DerivedAlert {
  id: string;
  text: string;
  tone: 'warning' | 'danger';
}

/** Real operator alerts derived from live channel health + reconciliation. */
export function deriveAlerts(
  health: ChannelHealth | undefined,
  recon: ReconciliationStatus | undefined,
): DerivedAlert[] {
  const alerts: DerivedAlert[] = [];
  if (!health) return alerts;

  if (health.source === 'snapshot' || health.stale) {
    alerts.push({ id: 'stale', text: 'Node unreachable — showing snapshot', tone: 'danger' });
  }

  for (const c of health.channels) {
    const short = truncateId(c.channelId, 6, 4);
    if (1 - c.inboundRatio < 0.2) {
      alerts.push({ id: `out-${c.channelId}`, text: `Outbound below 20% · ${short}`, tone: 'warning' });
    }
    if (BigInt(c.inbound) === ZERO) {
      alerts.push({ id: `in-${c.channelId}`, text: `No inbound liquidity · ${short}`, tone: 'warning' });
    }
  }

  if (recon && !recon.inSync) {
    alerts.push({ id: 'drift', text: 'Snapshot drift detected', tone: 'warning' });
  }

  return alerts;
}
