import type { SnapshotSource } from '@prisma/client';
import type { ChannelHealthDto } from './dto/channel-health.dto';

/** Cross-context boundary token for the channels context. */
export const CHANNELS_SERVICE = Symbol('CHANNELS_SERVICE');

export interface ChannelHealthResult {
  source: 'live' | 'snapshot';
  stale: boolean;
  channels: ChannelHealthDto[];
}

export interface IChannelHealthService {
  getHealth(): Promise<ChannelHealthResult>;
  /** Read live channels and persist a snapshot; returns the number of rows written. */
  captureSnapshot(source: SnapshotSource): Promise<number>;
}

export type { ChannelHealthDto };
