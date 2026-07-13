import { describe, expect, it } from 'vitest';
import {
  channelState,
  deriveAlerts,
  healthScore,
  liquidityLabel,
  outboundPct,
  pickRebalancePair,
  totalOutbound,
} from './liquidity';
import type { ChannelHealth, ChannelHealthDto, ReconciliationStatus } from '@/types/fiber';

function channel(over: Partial<ChannelHealthDto> = {}): ChannelHealthDto {
  const inboundRatio = over.inboundRatio ?? 0;
  return {
    channelId: '0xchannelaaaaaaaaaaaaaaaaaaaaaaaa',
    peerPubkey: '0xpeer',
    state: 'ChannelReady',
    outbound: '990100000000',
    inbound: '0',
    capacity: '990100000000',
    inboundRatio,
    isUdt: false,
    udtScript: null,
    capturedAt: '2026-07-13T00:00:00.000Z',
    ...over,
  };
}

describe('outboundPct', () => {
  it('is the outbound share as a rounded percent', () => {
    expect(outboundPct(channel({ inboundRatio: 0 }))).toBe(100);
    expect(outboundPct(channel({ inboundRatio: 0.5 }))).toBe(50);
    expect(outboundPct(channel({ inboundRatio: 1 }))).toBe(0);
  });
});

describe('channelState', () => {
  it('classifies by outbound share', () => {
    expect(channelState(channel({ inboundRatio: 0 }))).toBe('healthy');
    expect(channelState(channel({ inboundRatio: 0.6 }))).toBe('warning');
    expect(channelState(channel({ inboundRatio: 0.9 }))).toBe('critical');
  });
});

describe('liquidityLabel', () => {
  it('labels outbound-heavy / balanced / depleted', () => {
    expect(liquidityLabel(channel({ inboundRatio: 0 }))).toBe('outbound heavy');
    expect(liquidityLabel(channel({ inboundRatio: 0.5 }))).toBe('balanced');
    expect(liquidityLabel(channel({ inboundRatio: 0.9 }))).toBe('depleted');
  });
});

describe('healthScore', () => {
  it('averages outbound share across channels', () => {
    expect(healthScore([channel({ inboundRatio: 0 }), channel({ inboundRatio: 0 })])).toBe(100);
    expect(healthScore([channel({ inboundRatio: 0 }), channel({ inboundRatio: 0.5 })])).toBe(75);
  });

  it('is 0 for no channels', () => {
    expect(healthScore([])).toBe(0);
  });
});

describe('totalOutbound', () => {
  it('sums outbound with BigInt precision', () => {
    expect(totalOutbound([channel(), channel()])).toBe('1980200000000');
  });
});

describe('pickRebalancePair', () => {
  it('picks the most-outbound source and least-outbound dest', () => {
    const rich = channel({ channelId: '0xrich', outbound: '900' });
    const poor = channel({ channelId: '0xpoor', outbound: '100' });
    const pair = pickRebalancePair([poor, rich]);
    expect(pair?.source.channelId).toBe('0xrich');
    expect(pair?.dest.channelId).toBe('0xpoor');
  });

  it('returns null for no channels', () => {
    expect(pickRebalancePair([])).toBeNull();
  });
});

describe('deriveAlerts', () => {
  const health = (channels: ChannelHealthDto[], over: Partial<ChannelHealth> = {}): ChannelHealth => ({
    source: 'live',
    stale: false,
    channels,
    ...over,
  });
  const recon = (over: Partial<ReconciliationStatus> = {}): ReconciliationStatus => ({
    inSync: true,
    tolerance: '0',
    channels: [],
    checkedAt: '2026-07-13T00:00:00.000Z',
    ...over,
  });

  it('flags channels with no inbound liquidity', () => {
    const alerts = deriveAlerts(health([channel({ inbound: '0' })]), recon());
    expect(alerts.some((a) => a.text.startsWith('No inbound liquidity'))).toBe(true);
  });

  it('flags outbound below 20%', () => {
    const alerts = deriveAlerts(health([channel({ inbound: '5', inboundRatio: 0.9 })]), recon());
    expect(alerts.some((a) => a.text.startsWith('Outbound below 20%'))).toBe(true);
  });

  it('flags a stale snapshot as danger', () => {
    const alerts = deriveAlerts(health([channel({ inbound: '5', inboundRatio: 0.5 })], { source: 'snapshot' }), recon());
    expect(alerts.some((a) => a.tone === 'danger')).toBe(true);
  });

  it('flags reconciliation drift', () => {
    const alerts = deriveAlerts(health([channel({ inbound: '5', inboundRatio: 0.5 })]), recon({ inSync: false }));
    expect(alerts.some((a) => a.text === 'Snapshot drift detected')).toBe(true);
  });

  it('is empty for a balanced, in-sync, live node', () => {
    const alerts = deriveAlerts(health([channel({ inbound: '5', inboundRatio: 0.5 })]), recon());
    expect(alerts).toHaveLength(0);
  });

  it('returns nothing when health is undefined', () => {
    expect(deriveAlerts(undefined, recon())).toHaveLength(0);
  });
});
